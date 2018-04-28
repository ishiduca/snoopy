'use strict'
const test = require('tape')
const {pipe, through} = require('mississippi')
const {start} = require('../')

test('Calling dispatch triggers update function with action passed to dispatch', t => {
  const initialModel = {initial: true}
  const expectedAction = {type: 'DISPATCHED'}
  start({
    init () { return {model: initialModel} },
    update (model, action) {
      t.is(action, expectedAction, 'action passed to update is the action passed to dispatch')
      t.end()
      return {model}
    },
    view (model, actionsUp) {
      actionsUp(expectedAction)
      return {}
    }
  })
})

test('Delaying call to dispatch triggers update function with action passed to dispatch', t => {
  const initialModel = {initial: true}
  const expectedAction = {type: 'DISPATCHED'}
  start({
    init () { return {model: initialModel} },
    update (model, action) {
      t.is(action, expectedAction, 'action passed to update is the action passed to dispatch')
      t.end()
      return {model}
    },
    view (model, actionsUp) {
      setTimeout(() => actionsUp(expectedAction), 10)
      return {}
    }
  })
})

test('Calling dispatch emits actions on the acton stream', t => {
  const initialModel = {initial: true}
  const expectedAction = {type: 'DISPATCHED'}
  const {actions, stop} = start({
    init () { return {model: initialModel} },
    update (model, action) { return {model} },
    view (model, actionsUp) {
      setTimeout(() => actionsUp(expectedAction), 10)
      return {}
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
  setTimeout(() => stop(), 20)
})
