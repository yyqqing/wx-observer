/* @flow */

import { observe as vueObserve } from 'core/observer/index'
import Dep from 'core/observer/dep'
import Watcher from 'core/observer/watcher'
import { noop, hasOwn, def, isReserved, isPlainObject } from 'core/util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

const computedWatcherOptions = { lazy: true }

var computed = {}

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
    for (let i = 0, l = keys.length; i < l; i++) {
      let pk = preKeyPath + keys[i]

      if (!isReserved(pk)) {
        // proxy(vm, `_data`, pk)

        let pd = computed[keys[i]]
        if (pd && pd.get) {
          console.log('_watchComputed key : ', pk, pd)
          vm._computedWatchers[pk] = new Watcher(vm, pd.get, vm._renderDelegate, computedWatcherOptions)
          defineComputed(vm, pk)
        } else {
          console.log('_watchData key : ', pk)
          new Watcher(vm, pk, vm._renderDelegate)
        }

        let _data = data[keys[i]]
        if ((Array.isArray(_data) || isPlainObject(_data)) && Object.isExtensible(_data)) {
          _watchData(vm, _data, pk + '.')
        }
      }
    }
  }
}

function defineComputed (target: any, key: string) {
  sharedPropertyDefinition.get = function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }

  Object.defineProperty(target, key, sharedPropertyDefinition)
}

class VM {
  constructor(page) {
    this._watchers = []
    this._computedWatchers = Object.create(null)

    this._render = page._update

    let data = this._data = page.props || {}
    console.log('VM.constructor 1 data = ', data)
    Object.keys(data).forEach(key => {
      // first setData
      page.setData({
        [`${key}`]: data[key]
      })

      if (!isReserved(key)) {
        let pd = Object.getOwnPropertyDescriptor(data, key)
        if (pd.get) {
          computed[key] = pd
          this._computedWatchers[key] = new Watcher(this, pd.get || noop, noop, computedWatcherOptions)
          defineComputed(this, key)
        } else {
          proxy(this, '_data', key)
        }
      }
    })
    vueObserve(data)
    console.log('VM.constructor 2 data = ', data)

    _watchData(this, data)
  }

  _renderDelegate(path, newval, oldval) {
    let wxpath = path.replace(/\.(\d)\./g, '[$1].')
    this._render(wxpath, newval, oldval)
  }

  teardown() {
    this._watchers.forEach(w => {
      w.teardown()
    })
    this._watchers = []
    this._data = {}
  }
}

var observe = function(page) {

  var oldOnLoad = page.onLoad
  var oldOnUnload = page.onUnload

  if (!page._update) {
    // set default render
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

class Store {
  constructor(obj) {
    this._watchers = []
    this._computedWatchers = Object.create(null)
    let data = this._data = obj || {}
    Object.keys(data).forEach(k => {
      let pd = Object.getOwnPropertyDescriptor(data, k)
      if (pd.get) {
        this._computedWatchers[k] = new Watcher(this, pd.get || noop, noop, computedWatcherOptions)
        defineComputed(this, k)
      } else {
        proxy(this, '_data', k)
      }
    })

    vueObserve(this, true)

    // Object.keys(data).forEach(k => {
    //   proxy(this, '_data', k)
    // })
  }
}

var makeObservable = function(obj: any) {
  // vueObserve(obj, true)
  return new Store(obj)
}

export { observe, makeObservable }
