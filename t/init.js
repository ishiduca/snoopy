'use strict'
const test = require('tape')
const {pipe, through} = require('mississippi')
const {start} = require('../')

test('initial state of model can be set in init', t => {
  const initialModel = {initial: true}
  start({
    init () { return {model: initialModel} },
    update (model, action) {
      t.is(model, initialModel, 'model passed to update is set by initial state')
      t.end()
      return {model}
    },
    view (model, actionsUp) {
      actionsUp(true)
      return {}
    }
  })
})

test('returning an effect in init emits the effect on the effects stream', t => {
  const expectedEffect = {type: 'WEEEEEE'}
  const {effects, stop} = start({
    init () { return {effect: expectedEffect, model: 0} },
    update (model, action) { return {model} },
    view (model, actionsUp) {
      actionsUp(true)
      return {}
    },
    run () {}
  })
  const spy = []
  pipe(
    effects(),
    through.obj((effect, _, done) => {
      spy.push(effect)
      done()
    }),
    err => {
      t.deepEqual(spy, [expectedEffect])
      t.end()
    }
  )
  process.nextTick(() => stop())
})

test('stateful sources pool last value', t => {
  const {states, models, effects, views, stop} = start({
    init () { return {model: 'model', effect: 'effect'} },
    update (model) { return {model} },
    view (model, actionsUp) {
      process.nextTick(() => actionsUp(true))
      return {div: model}
    },
    run () {}
  })
  t.plan(4)
  process.nextTick(() => {
    var flg
    pipe(
      states(), through.obj((s, _, done) => {
        if (flg) return done()
        flg = !flg
        stop()
        t.deepEqual(s, {model: 'model', effect: 'effect'})
        done()
      }),
      err => (err)
    )
    pipe(
      models(), through.obj((m, _, done) => {
        t.is(m, 'model')
        done()
      }),
      err => (err)
    )
    pipe(
      effects(), through.obj((e, _, done) => {
        t.is(e, 'effect')
        done()
      }),
      err => (err)
    )
    pipe(
      views(), through.obj((v, _, done) => {
        t.deepEqual(v, {div: 'model'})
        done()
      }),
      err => (err)
    )
  })
})
