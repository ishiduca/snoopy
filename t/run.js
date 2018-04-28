'use strict'
const test = require('tape')
const {through, pipe} = require('mississippi')
const {start} = require('../')

test('returning an effect form update triggers the run function', t => {
  const initialModel = {initial: true}
  const expectedEffect = {type: 'EXPECTED_EFFECT'}
  start({
    init () { return {model: initialModel} },
    update (model, action) { return {model, effect: expectedEffect} },
    view (model, actionsUp) {
      actionsUp(true)
      return {html: model}
    },
    run (effect) {
      t.is(effect, expectedEffect, 'effect is equivalent to effect object returned in update')
      t.end()
    }
  })
})

test('returning an effect form init triggers the run function', t => {
  const initialModel = {initial: true}
  const expectedEffect = {type: 'EXPECTED_EFFECT'}
  start({
    init () { return {effect: expectedEffect} },
    update (model, action) { return {model, effect: expectedEffect} },
    view (model, actionsUp) {
      actionsUp(true)
      return {html: model}
    },
    run (effect) {
      t.is(effect, expectedEffect, 'effect is equivalent to effect object returned in update')
      t.end()
    }
  })
})

test('returning an action from effect triggers the update function', t => {
  const initialModel = {initial: true}
  const expectedEffect = {type: 'EXPECTED_EFFECT'}
  const expectedAction = {type: 'EXPECTED_ACTION'}
  start({
    init () { return {model: initialModel, effect: expectedEffect} },
    update (model, action) {
      t.is(action, expectedAction, 'Action passed to update is equivalent to the one returned in run')
      t.end()
    },
    view (model, actionsUp) { return {div: model} },
    run (effect) {
      const s = through.obj()
      s.write(expectedAction)
      return s
    }
  })
})

test('returning an actoin from effect emits actions on the action stream.', t => {
  const initialModel = {initial: true}
  const expectedEffect = {type: 'EXPECTED_EFFECT'}
  const expectedAction = {type: 'EXPECTED_ACTION'}
  const {actions, stop} = start({
    init () { return {model: initialModel, effect: expectedEffect} },
    update (model, action) { return {model} },
    view (model, actionsUp) { return {div: model} },
    run (effect) {
      const s = through.obj()
      s.write(expectedAction)
      return s
    }
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
      t.deepEqual(spy, [expectedAction])
      t.end()
    }
  )
  setTimeout(() => stop(), 10)
})

test('actions stream passed to run emits actions', t => {
  const initialModel = {initial: true}
  const expectedEffect = {type: 'EXPECTED_EFFECT'}
  const expectedAction = {type: 'EXPECTED_ACTION'}
  const {actions, stop} = start({
    init () { return {model: initialModel, effect: expectedEffect} },
    update (model, action) { return {model} },
    view (model, actionsUp) { return {div: model} },
    run (effect, sources) {
      const actions = sources.actions
      pipe(
        actions(),
        through.obj((action, _, done) => {
          done()
          t.is(action, expectedAction)
          t.end()
        }),
        err => t.fail()
      )
      const s = through.obj()
      s.end(expectedAction)
      return s
    }
  })
})

test('effectsAction stream will not emit an action if run returns an nill stream', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const app = {
    init () { return {mode: initialModel, effect: true} },
    update (model, action) { return {model} },
    view () {},
    run (effect) {
      t.ok(effect)
    }
  }
  const {effectActionsSources} = start(app)
  pipe(
    effectActionsSources(),
    through.obj((as, _, done) => {
      t.fail()
    }),
    err => t.fail()
  )
})
