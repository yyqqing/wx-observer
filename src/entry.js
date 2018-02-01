import { observe as vueObserve, observerState, set } from 'core/observer/index'
import Watcher from 'core/observer/watcher'
import { noop } from 'shared/util'
import { handleError, isReserved, isPlainObject } from 'core/util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

var __innerUpdate = function (path, newval, oldval) {
  let wxpath = path.replace(/\.(\d)\./g, '[$1].')
  console.log('page._update : ', path, wxpath, newval, oldval)
  this.setData({
    [`${wxpath}`]: newval
  })
  if (this._update) {
    // 页面内函数
    this._update.call(this, path, newval, oldval)
  }
}

function _watchData(target, data, preKeyPath = '') {
  if (Array.isArray(data)) {
    for (let i = 0, l = data.length; i < l; i++) {
      _watchData(target, data[i], preKeyPath + i + '.')
    }
  } else {
    const updater = __innerUpdate.bind(target)

    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let pk = preKeyPath + keys[i]
      if (!isReserved(pk)) {
        // console.log('watching : ', pk)
        proxy(target, `__data`, pk)
        new Watcher(target, pk, updater)

        let _data = data[keys[i]]
        if ((Array.isArray(_data) || isPlainObject(_data)) &&
          Object.isExtensible(_data)) {
          _watchData(target, _data, pk + '.')
        }
      }
    }
  }
}

var observe = function(page) {

  var oldOnLoad = page.onLoad
  var oldOnUnload = page.onUnload

  page._watchers = []

  page.onLoad = function() {
    this.$reWatch()

    if (oldOnLoad) {
      oldOnLoad.apply(this, arguments)
    }
  }

  page.onUnload = function() {
    this.__clswc()

    if (oldOnUnload) {
      oldOnUnload.apply(this, arguments)
    }
  }

  page.__clswc = function() {
    let i = this._watchers.length
    while (i--) {
      // console.log('page.__clswc : teardown ', i)
      this._watchers[i].teardown()
    }

    this._watchers = []
  }

  page.$reWatch = function () {
    this.__clswc()

    var props = this.__data = this.props || {}

    const prevShouldConvert = observerState.shouldConvert
    observerState.shouldConvert = true
    vueObserve(props, true)
    observerState.shouldConvert = prevShouldConvert

    _watchData(this, props)
  }

  return page
}

export { Watcher, observe }
