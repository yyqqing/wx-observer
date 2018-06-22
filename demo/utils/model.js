const observer = require('../observer/observer.js')

var observedObj = observer.observable({
  data: {
    prop1: 'prop1...',
    prop2: true,
    prop3: 1,
    prop4: [{ 'p1': 'aaa', p2: 'bbbb', p3: 'cccc' }],
  },
  computed: { // 计算属性
    prop5() {
      return 'prop5 = ' + this.prop1
    }
  }
})

module.exports = observedObj