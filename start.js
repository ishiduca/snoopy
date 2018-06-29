var xtend = require('xtend')
var missi = require('mississippi')
var defined = require('defined')
var defaults = require('./defaults')

module.exports = function start (app) {
  app = xtend(app)
  var init = defined(app.init, defaults.init)
  var update = defined(app.update, defaults.update)
  var view = defined(app.view, defaults.view)
  var run = defined(app.run, defaults.run)
  var initialState = init.call(app)
  var actions = missi.through.obj()
  var states = missi.through.obj()
  var models = missi.through.obj()
  var views = missi.through.obj()
  var effects = missi.through.obj()
  var effectActionsSources = missi.through.obj()
  var errors = missi.through.obj()
  var notifys = {
    actions: actions,
    states: states,
    models: models,
    views: views,
    effects: effects,
    effectActionsSources: effectActionsSources
  }
  var sources = {}
  Object.keys(notifys).forEach(function (name) {
    sources[name] = (
      ['states', 'models', 'views', 'effects'].indexOf(name) !== -1
    )
      ? replayLastValue(notifys[name])
      : function () { return notifys[name] }
  })

  missi.pipe(
    actions,
    scan(function (state, action) {
      return update.call(app, state.model, action)
    }, initialState),
    states,
    map(function (state) { return state.model }),
    difference(),
    models,
    map(function (model) { return view.call(app, model, actionsUp) }),
    views,
    onEnd
  )

  missi.pipe(
    states,
    map(function (state) { return state.effect }),
    effects,
    map(function (effect) { return run.call(app, effect, sources) }),
    effectActionsSources,
    missi.through.obj(function (actionsSource, _, done) {
      missi.pipe(
        actionsSource,
        missi.through.obj(function (action, _, done) {
          actions.write(action)
          done()
        }),
        function (err) {
          if (err) errors.write(err)
        }
      )
      done()
    }),
    onEnd
  )

  process.nextTick(function () {
    states.write(initialState)
  })

  return xtend(sources, {
    stop: stop,
    errors: function () { return errors }
  })

  function stop () {
    Object.keys(notifys).forEach(function (name) {
      notifys[name].end()
    })
  }

  function onEnd (err) {
    if (err) errors.write(err)
  }

  function actionsUp (action) {
    actions.write(action)
  }
}

function difference () {
  var data
  return filter(function (lastData) {
    var flg = data !== lastData
    if (flg) data = lastData
    return flg
  })
}

function filter (f) {
  return missi.through.obj(function (data, _, done) {
    f(data) === true ? done(null, data) : done()
  })
}

function map (f) {
  return missi.through.obj(function (data, _, done) {
    done(null, f(data))
  })
}

function scan (f, data) {
  return map(function (d) {
    return (data = f(data, d))
  })
}

function replayLastValue (notify) {
  var lastValue

  notify.on('data', function (value) {
    lastValue = value
  })

  return function listenWithLastValue () {
    var proxy = missi.through.obj()
    if (typeof lastValue !== 'undefined') proxy.write(lastValue)
    return notify.pipe(proxy)
  }
}
