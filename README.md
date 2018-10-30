# sciris-js

## Project setup
```
npm install --save git+https://github.com/sciris/sciris-js.git
```

## Rebuild after updates during development

```
npm run build
```

[billi](https://bili.egoist.moe/#/) is used for building this library.

## Sciris Usage

```
import Vue from 'vue'
import sciris from 'sciris-js';

// If you want to install the vue components used by sciris-js in your app.
// options

Vue.use(sciris.ScirisVue, options)
```

The options can are used to control specific features:

```
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

```
sciris.graphs
sciris.rpcs
sciris.status
sciris.user
sciris.tasks
sciris.utils
```

You can refrence the functions provided by sciris directly via the shorthands: 

```
sciris.rpc(...)
sciris.succeed(...)
sciris.loginCall(...)
```


Or you can use the full paths of the functions

```
sciris.rpcs.rpc(...)
sciris.rpcs.download(...)
sciris.status.succeed(...)
sciris.user.loginCall(...)
```

## Events

You can also listen to events occured inside sciris by:

```
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
