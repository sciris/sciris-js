# sciris-js

## Project setup
```
npm install --save git+https://github.com/sciris/sciris-js.git
```

## Rebuild after updates 

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
import { EventBus } from 'sciris-vue';

EventBus.$on(event, callback)
```

Events include

|Name|Args|Description|
|:---|---|---|
|status:start|`vm`| Task has been started|
|status:update|`vm`, `progress` |Porgress of a task has been updated  |
|status:success| `vm`, `notif` |A task has succeeded. It will pass a notification object if it can. |
|status:fail| `vm`, `notif` |A task has failed. It will pass a notification object if it can. | 
