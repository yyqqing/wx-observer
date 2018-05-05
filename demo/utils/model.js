const observer = require('../observer/observer.js')

var observedObj = observer.makeObservable({
  prop1: 'prop1...',
  prop2: true,
  prop3: 1,
  prop4: [{ 'p1': 'aaa', p2: 'bbbb', p3: 'cccc' }],

  // 计算属性
  get prop5() {
    return 'prop5 = ' + this.prop1
  }
})

module.exports = observedObj