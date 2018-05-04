//index.js
//获取应用实例
const app = getApp()

const observer = require('../../observer/observer.js')
var model = require('../../utils/model.js')
console.log('before Page : ', model)

Page(observer.observe({
  props: {
    model
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
    val: ''
  },

  onLoad: function () {
    console.log('pages/index/index : onLoad = ', this, model)
  },

  btntap(e) {
    let arr = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n'.split(',')
    let props = ['prop1', 'prop2', 'prop3', 'prop4']
    let prop = props[Math.floor(Math.random() * props.length)]
    let val = arr[Math.floor(Math.random() * arr.length)]
    console.log('prop = ', prop, model)
    if (prop == 'prop4') {
      this.props.model.prop4[0].p1 = 'changed ' + val
    } else {
      model[prop] = 'changed ' + val
    }
  }
}))
