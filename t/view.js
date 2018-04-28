'use strict'
const test = require('tape')
const {pipe, through} = require('mississippi')
const {start} = require('../')

test('newly created app renders initial state', t => {
  const app = {
    init () { return {model: 1} },
    update (model) { return {model} },
    view (model, actionsUp) { return {div: model} }
  }
  const {views, stop} = start(app)
  pipe(
    views(),
    through.obj((v, _, done) => {
      stop()
      t.ok(v)
      done()
    }),
    err => {
      t.error(err)
      t.end()
    }
  )
})

test('view stream will not emit a view if view function returns null', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const {views, stop} = start({
    init () { return {model: initialModel} },
    update (model) { return {model} },
    view (model) {
      t.ok(true)
      return null
    }
  })
  pipe(
    views(),
    through.obj((v, _, done) => {
      t.false(model)
      done()
    }),
    err => t.fail()
  )
})

test('view stream will not emit a view if view function returns undefined', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const {views, stop} = start({
    init () { return {model: initialModel} },
    update (model) { return {model} },
    view (model) {
      t.ok(true)
    }
  })
  pipe(
    views(),
    through.obj((v, _, done) => {
      t.false(model)
      done()
    }),
    err => t.fail()
  )
})
