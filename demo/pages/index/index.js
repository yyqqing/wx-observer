//index.js
//获取应用实例
const app = getApp()

const observer = require('../../observer/observer.js')
var model = require('../../utils/model.js')

Page(observer.observe({
  observable: {
    data: model,
    computed: {
      prop6() {
        return 'prop6 from prop3 : ' + model.prop3
      },
      prop11() {
        return model.prop1
      },
      prop52() {
        return model.prop5
      }
    }
  },

  // 自定义刷新
  // _update(path, newval, oldval) {
  //   console.log('page.index..._update = ', this, path, newval, oldval)
  //   this.setData({
  //     'path': path,
  //     'val': newval,
  //     [`${path}`]: newval
  //   })
  // },

  data: {
    path: '',
    val: '',
    p4idx: 0
  },

  onLoad: function () {
    console.log('pages/index/index : onLoad = ', this, model, this.data)
  },

  btntap(e) {
    let arr = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n'.split(',')
    let props = ['prop1', 'prop2', 'prop3', 'prop4', 'prop7', 'prop8']
    let prop = props[Math.floor(Math.random() * props.length)]
    let val = arr[Math.floor(Math.random() * arr.length)]
    console.log('prop = ', prop, val, model)
    // debugger
    if (prop == 'prop8') {
      model.prop4.push({ 'p1': '-----qqqq-----' })
      this.setData({
        p4idx: model.prop4.length - 1
      })
    }
    else if (prop == 'prop7') {
      this._vm.prop7 = val
    }
    else if (prop == 'prop4') {
      model.prop4[0].p1 = 'changed ' + val
    } else {
      model[prop] = 'changed ' + val
    }
  },

  btnCallMethod(e) {
    model.updateProp1()
  }
}))
