import { observe as vueObserve, observerState } from 'core/observer/index'
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

var observe = function(page) {

  var oldOnLoad = page.onLoad
  var oldOnUnload = page.onUnload

  page._watchers = []

  var innerUpdate = page._update = function(path, newval, oldval) {
    console.log('page._update : ', path, newval, oldval)

    this.setData({
      [`${path}`]: newval
    })
  }

  var _watchData = function (target, data, preKeyPath = '') {
    if (Array.isArray(data)) {
      for (let i = 0, l = data.length; i < l; i++) {
        _watchData(target, data[i], preKeyPath + i + '.')
      }
    } else {
      const keys = Object.keys(data)
      for (let i = 0; i < keys.length; i++) {
        let pk = preKeyPath + keys[i]
        if (!isReserved(pk)) {
          proxy(target, `__data`, pk)
          new Watcher(target, pk, innerUpdate)

          let _data = data[keys[i]]
          if ((Array.isArray(_data) || isPlainObject(_data)) &&
            Object.isExtensible(_data)) {
            _watchData(target, _data, pk + '.')
          }
        }
      }
    }
  }

  page.onLoad = function() {
    var props = this.__data = this.props || {}

    const prevShouldConvert = observerState.shouldConvert
    observerState.shouldConvert = true
    vueObserve(props, true)
    observerState.shouldConvert = prevShouldConvert

    _watchData(this, props)

    if (oldOnLoad) {
      oldOnLoad.apply(this, arguments)
    }
  }

  page.onUnload = function() {
    let i = this._watchers.length
    while (i--) {
      console.log('page.onUnload : teardown ', i)
      this._watchers[i].teardown()
    }

    if (oldOnUnload) {
      oldOnUnload.apply(this, arguments)
    }
  }

  return page
}

export { Watcher, observe }