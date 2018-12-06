/* @flow */

import { observe as vueObserve, toggleObserving } from 'core/observer/index'
import Watcher from 'core/observer/watcher'
import { noop, hasOwn, isReserved, isPlainObject, bind } from 'core/util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

const computedWatcherOptions = { computed: true }

function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function defineComputed(
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = false
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache ?
      createComputedGetter(key) :
      userDef
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get ?
      shouldCache && userDef.cache !== false ?
      createComputedGetter(key) :
      userDef.get :
      noop
    sharedPropertyDefinition.set = userDef.set ?
      userDef.set :
      noop
  }
  if (sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      console.log(
        `Computed property "${key}" was assigned to but it has no setter.`
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      watcher.depend()
      return watcher.evaluate()
    }
  }
}

export default class VM {

  constructor(options) {
    this._watchers = []
    this._dataKeys = []

    let vm = this

    toggleObserving(true)
    // init data
    let data = vm._data = options.data || {}
    Object.keys(data).forEach(key => {
      if (!isReserved(key)) {
        proxy(vm, `_data`, key)

        this._dataKeys.push(key)
      }
    })
    vueObserve(data, true)

    // init computed
    let computed = options.computed
    const watchers = vm._computedWatchers = Object.create(null)
    for (const key in computed) {
      if (!isReserved(key)) {
        this._dataKeys.push(key)
      }

      const userDef = computed[key]
      const getter = typeof userDef === 'function' ? userDef : userDef.get
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )

      if (!(key in vm)) {
        defineComputed(vm, key, userDef)
      } else {
        console.log(`The computed property "${key}" is already defined in data.`);
      }
    }

    // init methods
    let methods = options.methods
    for (const key in methods) {
      vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
    }
  }

  allData() {
    let data = {}
    this._dataKeys.forEach(k => {
      data[k] = this[k]
    })
    return data
  }

  teardown() {
    if (this._watcher) {
      this._watcher.teardown()
    }
    this._watchers.forEach(w => {
      w.teardown()
    })
    Object.keys(this._computedWatchers).forEach(k => {
      this._computedWatchers[k].teardown()
    })

    this._data = {}
    this._watchers = []
    this._computedWatchers = {}
  }
}