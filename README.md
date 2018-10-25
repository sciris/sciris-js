# sciris-vue

## Project setup
```
npm install --save git+https://[apitoken]:x-oauth-basic@github.com/sciris/sciris-vue.git
```

## Rebuild after updates 

```
npm run build
```

this will use bili to build for npm 


## Sciris Usage

```
import sciris from 'sciris-vue';
```

after which you'll have access to various sciris tools such as:

```
  sciris.graphs
  sciris.rpc
  sciris.status
  sciris.user
  sciris.tasks
  sciris.utils
```

You can also listen to events occured inside sciris by:

```
import { EventBus } from 'sciris-vue';

EventBus.$on(event, callback)

```

events include

```
'status:start'		=> A task has been started 
'status:update'		=> Porgress of a task has been updated 
'status:success'	=> A task has succeeded. It will pass a notification object if it can.
'status:fail'		=> A task has failed. It will pass a notification object if it can.
```
