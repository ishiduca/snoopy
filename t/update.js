'use strict'
const test = require('tape')
const {pipe, through} = require('mississippi')
const {start} = require('../')

test('models returned by update are emitted by the model stream', t => {
  const initialModel = {initial: true}
  const expectedModel = {count: 0}
  const app = {
    init () { return {model: initialModel} },
    update (model) { return {model: expectedModel} },
    view (model, actionsUp) {
      actionsUp(true)
      return {div: model}
    }
  }
  const {models, stop} = start(app)
  const spy = []
  pipe(
    models(),
    through.obj((model, _, done) => {
      spy.push(model)
      if (spy.length == 2) stop()
      done()
    }),
    err => {
      t.error(err)
      t.is(spy[0], initialModel)
      t.is(spy[1], expectedModel)
      t.end()
    }
  )
})

test('model stream will not emit a model if is a duplicate', t => {
  const initialModel = {initial: true}
  const {models, stop} = start({
    init () { return {model: initialModel} },
    update (model) { return {model} },
    view (model, actionsUp) {
      actionsUp(true)
      return {div: model}
    }
  })
  pipe(
    models(),
    through.obj((model, _, done) => {
      t.is(model, initialModel)
      stop()
      done()
    }),
    err => {
      t.error(err)
      t.end()
    }
  )
})

test('effects stream will not emit an effect in update returns a nill effect', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const {effects, stop} = start({
    init () { return {model: initialModel} },
    update (model) {
      t.ok(model)
      return {model, effect: null}
    },
    view (model, actionsUp) {
      actionsUp(true)
      return {div: model}
    },
    run (effect) {
      t.fail()
    }
  })
  pipe(
    effects(),
    through.obj((effect, _, done) => {
      t.fail()
      done()
    }),
    err => t.fail()
  )
})

test('effects stream will not emit and effect if update returns an undefiend effect', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const {effects, stop} = start({
    init () { return {model: initialModel} },
    update (model) {
      t.ok(model)
      return {model, effect: undefined}
    },
    view (model, actionsUp) {
      actionsUp(true)
      return {div: model}
    },
    run (effect) {
      t.fail()
    }
  })
  pipe(
    effects(),
    through.obj((effect, _, done) => {
      t.fail()
      done()
    }),
    err => t.fail()
  )
})
