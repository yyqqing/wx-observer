//app.js
var model = require('utils/model.js')
const observer = require('observer/observer.js')

App({
  onLaunch: function () {
    console.log('App.onLaunch ...... ')
    // observer.observe(model, (path, newval, oldval) => {
    //   console.log('app observe callback : path = ', path, ', ', newval, ' => ', oldval)
    // })
  },
  
  globalData: {
    
  }
})