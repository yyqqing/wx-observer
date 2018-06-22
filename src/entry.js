/* @flow */

import VM from './vm'
import Watcher from 'core/observer/watcher'
import { noop } from 'core/util/index'

var observe = function (page) {

  var oldOnLoad = page.onLoad
  var oldOnUnload = page.onUnload

  page.onLoad = function () {
    this._vm = new VM(this.observable)
    new Watcher(this._vm, () => {
      this.setData(this._vm.allData())
    }, noop, {}, true)

    if (oldOnLoad) {
      oldOnLoad.apply(this, arguments)
    }
  }

  page.onUnload = function () {
    if (this._vm) {
      this._vm.teardown()
    }

    if (oldOnUnload) {
      oldOnUnload.apply(this, arguments)
    }
  }

  return page
}

var observable = function (obj: any) {
  return new VM(obj)
}

export default {
  observe,
  observable
}