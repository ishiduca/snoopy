var xtend = require('xtend')

module.exports = xtend(require('mississippi'), {
  defaults: require('./defaults'),
  start: require('./start')
})
