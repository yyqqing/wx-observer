/* @flow */

import { observe as vueObserve } from 'core/observer/index'
import Watcher from 'core/observer/watcher'
import { noop, hasOwn, isReserved, isPlainObject } from 'core/util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

const computedWatcherOptions = { lazy: true }

function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function(val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function _watchData(vm, data, preKeyPath = '') {
  if (Array.isArray(data)) {
    for (let i = 0, l = data.length; i < l; i++) {
      _watchData(vm, data[i], preKeyPath + i + '.')
    }
  } else {
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let pk = preKeyPath + keys[i]

      if (!isReserved(pk)) {
        new Watcher(vm, pk, vm._renderDelegate)

        let _data = data[keys[i]]
        if ((Array.isArray(_data) || isPlainObject(_data)) && Object.isExtensible(_data)) {
          _watchData(vm, _data, pk + '.')
        }
      }
    }
  }
}

class VM {
  constructor(target) {
    this._watchers = []
    this._computedWatchers = {}

    this._render = target._update

    let props = this._data = target.props || {}
    Object.keys(props).forEach(key => {
      if (!isReserved(key)) {
        proxy(this, `_data`, key)
        // init setData
        this._render(key, props[key], props[key])
      }
    })
    makeObservable(props, false)

    _watchData(this, props)
  }

  _renderDelegate(path, newval, oldval) {
    let wxpath = path.replace(/\.(\d)\./g, '[$1].')
    this._render(wxpath, newval, oldval)
  }

  teardown() {
    this._watchers.forEach(w => {
      w.teardown()
    })
    Object.keys(this._computedWatchers).forEach(k => {
      this._computedWatchers[k].teardown()
    })
    this._watchers = []
    this._data = {}
    this._computedWatchers = {}
  }
}

var observe = function(page) {

  var oldOnLoad = page.onLoad
  var oldOnUnload = page.onUnload

  if (!page._update) {
    page._update = function(wxpath, newval, oldval) {
      console.warn('(@wx-observe default) : page._update = function(wxpath, newval, oldval)\n    path = ', wxpath, '\n    newval = ', newval, '\n    oldval = ', oldval)
      this.setData({
        'path': wxpath,
        'newval': newval,
        'oldval': oldval,
        [`${wxpath}`]: newval
      })
    }
  }

  page.onLoad = function() {
    this._vm = new VM(this)

    if (oldOnLoad) {
      oldOnLoad.apply(this, arguments)
    }
  }

  page.onUnload = function() {
    if (this._vm) {
      this._vm.teardown()
    }

    if (oldOnUnload) {
      oldOnUnload.apply(this, arguments)
    }
  }

  return page
}

var makeObservable = function(obj: any, asRootData: ? boolean = true) {
  if (hasOwn(obj, '__ob__')) {
    return obj
  }

  var _ob = vueObserve(obj, asRootData)

  var delegate = Object.create(null)
  Object.keys(obj).forEach(k => {
    Object.defineProperty(delegate, k, {
      enumerable: true,
      configurable: true,
      get: function() {
        return obj[k]
      },
      set: function(val) {
        obj[k] = val
      }
    })
  })

  // console.log('makeObservable obj = ', obj, delegate)

  return delegate
}

export { observe, makeObservable }