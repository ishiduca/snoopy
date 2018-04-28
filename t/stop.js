'use strict'
const test = require('tape')
const {pipe, through} = require('mississippi')
const {start} = require('../')

test('calling stop() ends actions stream', t => {
  const initialModel = {initial: true}
  const {actions, stop} = start({
    init () { return {model: initialModel} },
    update (model) {
      t.is(model, initialModel, 'model passed to update is set by initial state')
      t.end()
      return {model}
    },
    view (model) { return {div: model} }
  })
  const spy = []
  pipe(
    actions(),
    through.obj((action, _, done) => {
      spy.push(action)
      done()
    }),
    err => {
      t.error(err)
      t.is(spy.length, 0, 'Actions stream ends with no emits actions')
      t.end()
    }
  )
  process.nextTick(() => stop())
})

test('calling stop() ends effects stream', t => {
  const initialModel = {initial: true}
  const {effects, stop} = start({
    init () { return {model: initialModel} },
    update (model) {
      t.is(model, initialModel, 'model passed to update is set by initial state')
      t.end()
      return {model}
    },
    view (model) { return {div: model} }
  })
  const spy = []
  pipe(
    effects(),
    through.obj((effect, _, done) => {
      spy.push(effect)
      done()
    }),
    err => {
      t.error(err)
      t.is(spy.length, 0, 'Effects stream ends with no emits actions')
      t.end()
    }
  )
  process.nextTick(() => stop())
})

test('calling stop() ends views stream', t => {
  const initialModel = {initial: true}
  const {views, stop} = start({
    init () { return {model: initialModel} },
    update (model) {
      t.is(model, initialModel, 'model passed to update is set by initial state')
      t.end()
      return {model}
    },
    view (model) { return {div: model} }
  })
  const spy = []
  pipe(
    views(),
    through.obj((view, _, done) => {
      spy.push(view)
      done()
    }),
    err => {
      t.error(err)
      t.is(spy.length, 0, 'Views stream ends with no emits actions')
      t.end()
    }
  )
  stop()
})

test('calling stop() ends models stream', t => {
  const initialModel = {initial: true}
  const {models, stop} = start({
    init () { return {model: initialModel} },
    update (model) {
      t.is(model, initialModel, 'model passed to update is set by initial state')
      t.end()
      return {model}
    },
    view (model) { return {div: model} }
  })
  const spy = []
  pipe(
    models(),
    through.obj((model, _, done) => {
      spy.push(model)
      done()
    }),
    err => {
      t.error(err)
      t.is(spy.length, 0, 'Models stream ends with one emit actions')
      t.end()
    }
  )
  stop()
})

test('calling stop() ends effectAction stram.', t => {
  const initialModel = {initial: true}
  const {effectActionsSources, stop} = start({
    init () { return {model: initialModel} },
    update (model) {
      t.is(model, initialModel, 'model passed to update is set by initial state')
      t.end()
      return {model}
    },
    view (model) { return {div: model} }
  })
  const spy = []
  pipe(
    effectActionsSources(),
    through.obj((actionsSource, _, done) => {
      spy.push(actionsSource)
      done()
    }),
    err => {
      t.error(err)
      t.is(spy.length, 0, 'EffectActions stream ends with no emits actions')
      t.end()
    }
  )
  process.nextTick(() => stop())
})
