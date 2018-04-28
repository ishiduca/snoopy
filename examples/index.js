const yo = require('yo-yo')
// const {pipe, through} = require('mississippi')
const {start, pipe, through} = require('../index')

const updateHelper = mapper => (model, action) => (
  mapper[action.type] == null
    ? {model}
    : mapper[action.type](model, action.payload)
)
const runHelper = mapper => (effect, sources) => (
  mapper[effect.type] == null
    ? null
    : mapper[effect.type](effect.payload, sources)
)

const creator = type => payload => ({
  type: type,
  payload: payload
})

const TICK = creator('TICK')
const SCHEDULE_TICK = creator('SCHEDULE_TICK')

const root = yo`<div></div>`
const {models, views} = start({
  init () {
    return {
      model: 0,
      effect: SCHEDULE_TICK()
    }
  },
  update: updateHelper({
    TICK (model, action) {
      return {
        model: (model + 1) % 60,
        effect: SCHEDULE_TICK()
      }
    }
  }),
  view (model) {
    return yo`
      <div>
        <p>model: ${model}</p>
      </div>
    `
  },
  run: runHelper({
    SCHEDULE_TICK (effect, sources) {
      const src = through.obj()
      setTimeout(() => src.end(TICK()), 1000)
      return src
    }
  })
})

pipe(
  views(),
  through.obj((el, _, done) => {
    yo.update(root, el)
    done()
  }),
  err => console.log(err || 'APP ENDED')
)

pipe(
  models(),
  through.obj((model, _, done) => {
    console.log(model)
    done()
  }),
  err => console.log(err || 'APP ENDED')
)

document.body.appendChild(root)
