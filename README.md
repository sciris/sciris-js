# sciris-js

## Project setup

`d3` is required to be added in the global scope by includeing the following in your html.

```
<script src="http://d3js.org/d3.v5.min.js"></script>
```

To install in the browser also include:

```
<script src="https://unpkg.com/sciris-js/dist/sciris-js.js"></script>
```

Using NPM in your node based projects:

```
npm install --save sciris-js 
```

## Rebuild project for release

```
npm install
npm run build
```

[billi](https://bili.egoist.moe/#/) is used for building this library.

## Publish to NPM

To publish the latest version to npm first you need to update the version number in `package.json` and then:

```
npm publish
```

If you're not logged in you'll be prompted to enter your credentials in the CLI

## Sciris Usage

```js
import Vue from 'vue'
import sciris from 'sciris-js';

// If you want to install the vue components used by sciris-js in your app.
// options

Vue.use(sciris.ScirisVue, options)
```

The options can are used to control specific features:

```js
options = {
  notifications: {
    disable: false,
  },
  spinner: {
    disable: false,
  },
  progressbar: {
    disable: false,
    options: {
      color: 'rgb(0, 0, 255)',
      failedColor: 'red',
      thickness: '3px',
      transition: {
        speed: '0.2s',
        opacity: '0.6s',
        termination: 300
      } 
    }
  }
}
```

You now have access to various scris tools such as: 

```js
sciris.graphs
sciris.rpcs
sciris.status
sciris.user
sciris.tasks
sciris.utils
sciris.mpld3
```

You can access `sciris.mpld3.draw_figure` directly via `mpld3.draw_figure`

You can refrence the functions provided by sciris directly via the shorthands: 

```js
sciris.rpc(...)
sciris.succeed(...)
sciris.loginCall(...)
```


Or you can use the full paths of the functions

```js
sciris.rpcs.rpc(...)
sciris.rpcs.download(...)
sciris.status.succeed(...)
sciris.user.loginCall(...)
```

## Events

You can also listen to events occured inside sciris by:

```js
import sciris from 'sciris-js';

sciris.EventBus.$on(event, callback)
```

Events include

|Name|Args|Description|
|:---|---|---|
|status:start|`vm`| Task has been started|
|status:update|`vm`, `progress` |Porgress of a task has been updated  |
|status:success| `vm`, `notif` |A task has succeeded. It will pass a notification object if it can. |
|status:fail| `vm`, `notif` |A task has failed. It will pass a notification object if it can. | 
