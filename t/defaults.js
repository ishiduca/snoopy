'use strict'
const test = require('tape')
const {pipe, through} = require('mississippi')
const {start} = require('../')

test('defaultInit', t => {
  t.plan(1)
  const expectedModel = {initial: true}
  start({
    init () { return {model: expectedModel} },
    update (model) { t.notOk(true, 'should not update state') },
    run (effect) { t.notOk(true, 'should not run effect') },
    view (model) {
      t.is(model, expectedModel, 'init model is expected')
    }
  })
})

test('defaultUpdate', t => {
  const expectedModel = {initial: true}
  const initialState = {
    model: expectedModel,
    effect: 'INITIALIZE'
  }
  const {models, stop} = start({
    init () { return initialState },
    run (effect) {
      t.is(effect, initialState.effect, 'effect received')
      const s = through.obj()
      ;['ACTIONS1', 'ACTIONS2', 'ACTIONS3'].forEach(a => s.write(a))
      return s
    }
  })
  pipe(
    models(),
    through.obj((model, _, done) => {
      t.is(model, expectedModel, 'initial model is expected.')
      done()
      stop()
    }),
    err => t.end()
  )
})

test('defaultView', t => {
  const {views, stop} = start()
  pipe(
    views(),
    through.obj((view, _, done) => {
      t.notOk(true, 'did not expect to receive default empty view')
    }),
    err => t.notOk(err)
  )
  process.nextTick(() => t.end())
})

test('defaultRun', t => {
  const expectedActions = ['ACTIONS1', 'ACTIONS2', 'ACTIONS3']
  const initialState = {
    model: true,
    effect: 'INITIALIZE'
  }
  const spy = []
  const {actions, stop} = start({
    init () { return initialState },
    view (model, actionsUp) {
      expectedActions.forEach(actionsUp)
    }
  })
  pipe(
    actions(),
    through.obj((action, _, done) => {
      spy.push(action)
      done()
    }),
    err => {
      t.error(err)
      t.deepEqual(spy, expectedActions, 'actions are the same')
      t.end()
    }
  )
  process.nextTick(() => stop())
})

test('defaultApp', t => {
  t.ok(start(), 'undefined app has sources')
  t.end()
})
