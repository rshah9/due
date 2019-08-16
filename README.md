# WELCOME TO DUE NPM LIBRARY
**8.16.2019** <br>
**rgene2@gmail.com**

### Specs

- `Due` library below exposing a utility function
- Compatible to run on Node.js Version ^10.0.0 and Chrome


# Due

A [`cargo`](https://caolan.github.io/async/v2/docs.html#cargo) with [`queue`](https://caolan.github.io/async/v2/docs.html#queue)-like parallel processing and capacity optimization.


## Example Usage

```js
//worker function, accepting an array of tasks
async function worker (tasks) {
  // Process tasks
}

const due = require('due')

// Create a due of 5 workers,
// each one processing up to 20 tasks
const workers = due(worker, 20, 5)

// Add a task to be processed by the workers
workers.push(task)
```


## Reference

### due(worker, capacity[, concurrency[, delay]])

Creates a `due` object with the specified `capacity`, `concurrency` and `delay`. Tasks added to the `due` will be processed altogether (up to the `capacity` limit) in parallel batches (up to the `concurrency` limit). If all workers are in progress, the task is queued until one becomes available. If the `due` hasn’t reached `capacity`, the task is queued for `delay` milliseconds.

Due passes an array of tasks to one of a group of workers, repeating when the worker is finished.

##### Rules to process tasks

- A worker processes a maximum of `capacity` tasks at once.
- A task is processed at most `delay` milliseconds after being pushed to the `due`
- Tasks are processed __as soon as__ `capacity` is reached __or__ `delay` has passed, _depending on workers availability_.

##### Arguments

- `worker(tasks)` - An asynchronous function for processing an array of queued tasks. Returns a Promise.
- `capacity` - An integer for determining how many tasks should be processed per round.
- `concurrency` - An optional integer for determining how many worker functions should be run in parallel; if omitted, the default is `1`.
- `delay` - An optional integer for determining how long should the `due` wait to reach `capacity`; if omitted, the default is `0`.

##### Due objects

The `due` object returned has the following properties and methods:

- `length` - number of tasks waiting to be processed (read-only).
- `running` - `true` if there are tasks being processed, `false` otherwise (read-only).
- `idle` - `false` if there are tasks waiting or being processed, `true` otherwise (read-only).
- `concurrency` - an integer for determining how many `worker` functions should be run in parallel. This property can be changed after a `due` is created to alter the concurrency on-the-fly.
- `push(task)` - adds `task` to the `due`. Returns a Promise resolving once the `worker` has finished processing the task. Instead of a single task, a `tasks` array can be submitted.
- `empty` - Optional callback that is called when the last task from the `due` is given to a `worker` (= all tasks are being processed).
- `drain` - Optional callback that is called when the last task from the `due` has returned from the `worker` (= all tasks have been processed).

---

### Initialization

#### [Async](http://caolan.github.io/async/)-like

- `due(worker, capacity)`
- `due(worker, capacity, concurrency)`
- `due(worker, capacity, concurrency, delay)`

#### With options

- `due(worker, options)`
- `due(options, worker)`

Possible `options` are
- `capacity`
- `concurrency`
- `delay`
- `empty` callback
- `drain` callback

---

### Compared to [Async](http://caolan.github.io/async/)

Object | Tasks per worker (_capacity_) | Workers per object (_concurrency_)
---|:---:|:---:
__queue__|1|`x`
__cargo__|`y`|1
__due__|`y`|`x`

#### `due(worker, capacity)`

Equivalent to `async.cargo(worker, capacity)`

#### `due(worker, 1, concurrency)`

Equivalent to `async.queue(worker, concurrency)`

#### `due(worker, capacity, concurrency)`

Roughly equivalent to using a queue and a cargo together
```js
const queue = async.queue(worker, concurrency)

const cargo = async.cargo(function (tasks, cargoCb) {
  queue.push(tasks)
  cargoCb() // call immediately
}, capacity)

cargo.push(task, taskCb)
```

In the `async` version, `taskCb` will never be called (it would mean passing `cargoCb` to `queue.push(tasks, cargoCb)`, which therefore waits for the worker to complete before pushing other tasks to the queue, making the queue useless).

#### `due(worker, capacity, concurrency, delay)`

Instead of processing tasks on next tick as `async.cargo` does, `due` waits for `delay` milliseconds before processing tasks.
If `capacity` is reached before `delay`, `delay` is ignored and tasks are processed immediately. This is the __capacity optimization__ of `due`.


## A practical example below...

Let's say you own a few container ships

<img src="https://user-images.githubusercontent.com/5923751/59642581-98893800-9133-11e9-88a0-19952a87f91a.jpg" width="200" />

Running a ship is a very expensive operation and you get paid by the container, so you want to put as many containers per ship as possible (= try to fill as close to _capacity_ as possible), and therefore reduce the number of ships running to a minimum.

On the other hand, containers carry perishable goods, so they shouldn't wait more than _delay_ before departure, once they're handed to your shipping company.

If all your ships are already sailing and you receive more containers, they'll wait at port until a ship becomes available to be loaded onto.

- **Worker** = a ship
- **Task** = a container
- **Concurrency** = how many ships you own
- **Capacity** = how many containers can each ship carry
- **Delay** = how long can a container wait before leaving port
