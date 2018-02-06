//index.js
//获取应用实例
const app = getApp()

const observer = require('../../observer/observer.min.js')
var model = require('../../utils/model.js')

Page(observer.observe({
  props: {
    model
  },

  data: {
    path: '',
    val: ''
  },

  // _update(path, newval, oldval) {
  //   console.log('page.index..._update = ', this, path, newval, oldval)
  //   this.setData({
  //     'path': path,
  //     'val': newval,
  //     [`${path}`]: newval
  //   })
  // },

  // getterTest: {
  //   aa: 1,
  //   get bb() {
  //     return 'bb'
  //   }
  // },

  onLoad: function () {
    console.log('pages/index/index : onLoad = ', this, model)
    // observer.observe(model, (path, newval, oldval)=>{
    //   console.log('index observe callback : path = ', path, ', ', newval, ' => ', oldval)
    //   this.setData({
    //     path: path,
    //     val: newval
    //   })
    // })
    // var o = { aa:1, get foo() { return 17; } }
    // for (var k in o) {
    //   let kd = Object.getOwnPropertyDescriptor(o, k)
    //   console.log(k, ' = ', kd)
    // }
  },

  btntap(e) {
    let arr = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n'.split(',')
    let props = ['prop1', 'prop2', 'prop3', 'prop4']
    let prop = props[Math.floor(Math.random() * props.length)]
    let val = arr[Math.floor(Math.random() * arr.length)]
    console.log('prop = ', prop, model)
    if (prop == 'prop4') {
      model.prop4[0].p1 = 'changed ' + val
    } else {
      this.props.model[prop] = 'changed ' + val
    }
  }
}))
