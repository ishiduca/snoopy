# @ishiduca/snoopy

`@ishiduca/snoopy` is implementation of `inu` using [mississippi](https://github.com/maxogden/mississippi) instead of [pull-stream](https://github.com/pull-stream/pull-stream).

```js
const yo = require('yo-yo')
const {pipe, through} = require('mississippi')
const {start} = require('@ishiduca/snoopy')

const root = document.body.querySelector('.clock')
const app = {
  init () {
    return {
      model: 0,
      effect: 'SCHEDULE_TICK'
    }
  },
  update (model, action) {
    if (action === 'TICK') {
      return {
        model: (model + 1) % 60,
        effect: 'SCHEDULE_TICK'
      }
    }
    return {model}
  },
  view (model, actionsUp) {
    return yo`
      <div class='clock'>
        Seconds Elapsed: ${model}
      </div>
    `
  },
  run (effect, sources) {
    if (effect === 'SCHEDULE_TICK') {
      let actionSource = through.obj()
      setTimeout(() => actionSource.end('TICK'), 1000)
      return actionSource
    }
  }
}

const {views} = start(app)
pipe(
  views(),
  through.obj((view, _, done) => {
    yo.update(div, view)
    done()
  }),
  err => {
    err ? console.error(err) : console.log('Finished app')
  }
)
```


## see also

-[inu](https://github.com/ahdinosaur/inu): `@ishiduca/snoopy` is implementation of `inu` using [mississippi](https://github.com/maxogden/mississippi) instead of [pull-stream](https://github.com/pull-stream/pull-stream).
-[mississippi](https://github.com/maxogden/mississippi)
## license

The Apache License

Copyright &copy; 2018 ishiduca.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
