# &lt;batteries/async/...&gt; : Async Tasks and I/O

| Quick Reference ||
| :---------------------- | :--------------------------------- |
| [batt::Task](#batttask) | [batt::Watch&lt;T&gt;](#battwatcht) |

## batt::Task

### Summary

```c++
#include <batteries/async/task.hpp>
```

| Constructors |
| :----------- |
| [Task(executor, stack_size, body_fn)]() |
| [Task(executor, body_fn, name, stack_size, stack_type, priority)]() |


| Static Methods                                  |                                                       |                                               |
| :---------------------------------------------- | :---------------------------------------------------- | :-------------------------------------------- |
| [current](#batttaskcurrent)                     | [current_name](#batttaskcurrent_name)                 | [current_priority](#batttaskcurrent_priority) | 
| [current_stack_pos](#batttaskcurrent_stack_pos) | [current_stack_pos_of](#batttaskcurrent_stack_pos_of) | [default_name](#batttaskdefault_name)         | 
| [yield](#batttaskyield)                         | [sleep](#batttasksleep)                               | [await](#batttaskawait)                       |
| [backtrace_all](batttaskbacktrace_all)          |                                                       |                                               |


| Getters                               |                                       | Modifiers                             | Synchronization                           |
| :------------------------------------ | :------------------------------------ | :------------------------------------ | :---------------------------------------- |
| [id](#batttaskid)                     | [name](#batttaskname)                 | [try_join](#batttasktry_join)         | [join](#batttaskjoin)                     |
| [get_executor](#batttaskget_executor) | [get_priority](#batttaskget_priority) | [set_priority](#batttaskset_priority) | [call_when_done](#batttaskcall_when_done) |
| [stack_pos](#batttaskstack_pos)       | [stack_pos_of](#batttaskstack_pos_of) | [wake](#batttaskwake)                 |                                           |


### Description

A `batt::Task` is similar to `std::thread`, but much lighter weight.  Like `std::thread`, each `batt::Task` has an independent call stack.  Unlike `std::thread`, however, `batt::Task` is implemented 100% in user space, and does not support preemption.  This makes the context swap overhead of `batt::Task` very low in comparison to a `std::thread`, which means it is possible to have many more `batt::Task` instances without losing efficiency.

#### Asynchronous I/O

The primary use case for `batt::Task` is to support asynchronous I/O for efficiency, while retaining the programming model of traditional threads.  This makes asynchronous code much easier to write, read, debug, and maintain than equivalent code using asynchronous continuation handlers (in the style of Boost Asio or Node.js).

An important feature of `batt::Task` to highlight is the static method [batt::Task::await](#batttaskawait).  This method allows the use of asynchronous continuation handler-based APIs (e.g., Boost Asio) in a "blocking" style.  Example:

```c++
#include <batteries/async/task.hpp>
#include <batteries/async/io_result.hpp>

#include <batteries/assert.hpp>
#include <batteries/utility.hpp>

#include <boost/asio/io_context.hpp>
#include <boost/asio/ip/tcp.hpp>

// Some function to get a server endpoint to which to connect.
//
extern boost::asio::ip::tcp::endpoint get_server_endpoint();

int main() {
  // Create an io_context to schedule our Task and manage all asynchronous I/O.
  //
  boost::asio::io_context io;
  
  // Create a TCP/IP socket; we will use this to connect to the server endpoint.
  //
  boost::asio::ip::tcp::socket s{io};
  
  // Launch a task to act as our client.
  //
  batt::Task client_task{io.get_executor(), 
    /*body_fn=*/[&] 
    {
      // Connect to the server.  batt::Task::await will not return until the handler passed
      // to `async_connect` has been invoked.
      //
      boost::system::error_code ec = batt::Task::await<boost::system::error_code>([&](auto&& handler){
        s.async_connect(get_server_endpoint(), BATT_FORWARD(handler));
      });
      
      BATT_CHECK(!ec);
      
      // Interact with the server via the connected socket...
    }};

  // VERY IMPORTANT: without this line, nothing will happen!
  //
  io.run();

  return 0;
}
```

All continuation handler based async APIs require a callback (the continuation handler).  In order to simplify the code, we want to "pause" our code until the I/O is finished, but the async API, `async_connect` in this case, will return immediately.  [batt::Task::await](#batttaskawait) gives us access to the "continuation" of the task, in this case everything that happens after `await` returns, as a handler that can be passed directly to `async_connect`.  All the context swapping, scheduling, memory managment, and synchronization is handled automatically by `batt::Task`, allowing the programmer to focus on the application's natural flow of control, and not the mechanics used to implement this flow.

#### Task Scheduling and Priorities

### Methods

#### batt::Task::Task(executor, stack_size, body_fn)

Create a new Task with a custom stack size.

```c++
template <typename BodyFn = void()>
explicit Task(const boost::asio::any_io_executor& ex, 
              batt::StackSize stack_size, 
              BodyFn&& body_fn) noexcept;
```

#### batt::Task::Task(executor, body_fn, name, stack_size, stack_type, priority)

```c++
template <typename BodyFn = void()>
explicit Task(const boost::asio::any_io_executor& ex, 
              BodyFn&& body_fn,
              std::string&& name = Task::default_name(), 
              StackSize stack_size = batt::StackSize{512 * 1024},
              batt::StackType stack_type = batt::StackType::kFixedSize, 
              batt::Optional<Priority> priority = None) noexcept;
```

Create a new Task, optionally setting name, stack size, stack type, and priority.

The default priority for a Task is the current task priority plus 100; this means that a new Task by default will always "soft-preempt" the currently running task.

#### batt::Task::await


```c++
template <typename R, typename Fn=void(Handler)>
static R await(Fn&& fn);                          // (1)

template <typename R, typename Fn=void(Handler)>
static R await(batt::StaticType<R>, Fn&& fn);     // (2)

template <typename T>
static batt::StatusOr<T> await(const Future)
```

#### batt::Task::backtrace_all

#### batt::Task::call_when_done

#### batt::Task::current

#### batt::Task::current_name

#### batt::Task::current_priority

#### batt::Task::current_stack_pos

#### batt::Task::current_stack_pos_of

#### batt::Task::default_name

#### batt::Task::sleep

#### batt::Task::get_executor

#### batt::Task::get_priority

#### batt::Task::id

#### batt::Task::join

#### batt::Task::name

#### batt::Task::set_priority

#### batt::Task::stack_pos

#### batt::Task::stack_pos_of

#### batt::Task::try_join

#### batt::Task::wake

#### batt::Task::yield


## batt::Watch&lt;T&gt;

### Summary

```c++
#include <batteries/async/watch.hpp>
```

| Constructors                        |
| :---------------------------------- |
| [Watch()](#battwatch_constructor)   |
| [Watch(T)](#battwatcht-constructor) |

| Getters                           | Modifiers                                                            || Synchronization                               || 
| :-------------------------------- | :-------------------------------- | :-------------------------------- | :--------------------------------------------- ||
| [is\_closed](#battwatchis_closed) | [close](#battwatchclose)          | [fetch\_add](#battwatchfetch_add) | [async_wait](#battwatchasync_wait) | [await\_not\_equal](#battwatchawait_not_equal)|
| [get\_value](#battwatchget_value) | [set_value](#battwatchset_value)  | [fetch\_sub](#battwatchfetch_sub) || [await\_equal](#battwatchawait_equal)  | 
|                                   | [modify](#battwatchmodify)        | [fetch\_or](#battwatchfetch_or)   || [await\_true](#battwatchawait_true)            |
|                                   | [modify\_if](#battwatchmodify_if) | [fetch\_and](#battwatchfetch_sub) || [await\_modify](#battwatchawait_modify)        |

### Description

A `batt::Watch` is like a `std::atomic` that you can block on, synchronously and asynchronously.  Like `std::atomic`, it has methods to atomically get/set/increment/etc.  But unlike std::atomic, you can also block a task waiting for some condition to be true.  Example:

```c++
#include <batteries/async/watch.hpp>
#include <batteries/assert.hpp>  // for BATT_CHECK_OK
#include <batteries/status.hpp>  // for batt::Status

int main() {
  batt::Watch<bool> done{false};
  
  // Launch some background task that will do stuff, then set `done` 
  // to `true` when it is finished.
  //
  launch_background_task(&done);

  batt::Status status = done.await_equal(true);
  BATT_CHECK_OK(status);
  
  return 0;
}
```

### Methods

#### batt::Watch::async_wait

Invokes the passed handler `fn` with the described value as soon as one of the following conditions is true:
 * if the Watch value is _not_ equal to the passed value `last_seen`, the current value of the Watch
 * if the Watch is closed, `batt::StatusCode::kClosed`

```c++
template <typename Handler = void(batt::StatusOr<T> new_value)>
void async_wait(T last_seen, Handler&& fn) const;
```

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->

#### batt::Watch::await_equal

Blocks the current task/thread until the Watch contains the specified value.

```c++
batt::Status await_equal(T val) const;
```

##### Return Value

* `batt::OkStatus()` if the Watch value was observed to be `val`
* `batt::StatusCode::kClosed` if the Watch was closed before `val` was observed

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::await_modify

Retries `fn` on the Watch value until it succeeds or the Watch is closed.

```c++
template <typename Fn = batt::Optional<T>(T)>
batt::StatusOr<T> await_modify(Fn&& fn);
```

If `fn` returns `batt::None`, this indicates `fn` should not be called again until a new value is available.

`fn` **MUST** be safe to call multiple times within a single call to `await_modify`.  This is because `await_modify` may be implemented via an atomic compare-and-swap loop.

##### Return Value

* If successful, the old (pre-modify) value on which `fn` finally succeeded
* `batt::StatusCode::kClosed` if the Watch was closed before `fn` was successful

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::await_not_equal

Blocks the current task/thread until the Watch value is _not_ equal to `last_seen`.

```c++
batt::StatusOr<T> await_not_equal(T last_seen);
```

##### Return Value

* On success, the current value of the Watch, which is guaranteed to _not_ equal `last_seen`
* `batt::StatusCode::kClosed` if the Watch was closed before a satisfactory value was observed

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::await_true

Blocks the current task/thread until the passed predicate function returns `true` for the current value of the Watch.

```c++
template <typename Pred = bool(T)>
batt::StatusOr<T> await_true(Pred&& pred);
```

This is the most general of Watch's blocking getter methods.

##### Return Value

* On success, the Watch value for which `pred` returned `true`
* `batt::StatusCode::kClosed` if the Watch was closed before a satisfactory value was observed

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::close

Set the Watch to the "closed" state, which disables all blocking/async synchronization on the Watch, immediately unblocking any currently waiting tasks/threads.

```c++
void close();
```

This method is safe to call multiple times.  The Watch value can still be modified and retrieved after it is closed; this only disables the methods in the "Synchronization" category (see Summary section above).

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::fetch_add

Atomically adds the specified amount to the Watch value, returning the previous value.

```c++
T fetch_add(T arg);
```

_NOTE: This method is only available if T is a primitive integer type._

##### Return Value

The prior value of the Watch.

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::fetch_and

Atomically sets the Watch value to the bitwise-and of the current value and the passed `arg`, returning the previous value.

```c++
T fetch_and(T arg);
```

_NOTE: This method is only available if T is a primitive integer type._

##### Return Value

The prior value of the Watch.

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::fetch_or

Atomically sets the Watch value to the bitwise-and of the current value and the passed `arg`, returning the previous value.

```c++
T fetch_or(T arg);
```

_NOTE: This method is only available if T is a primitive integer type._

##### Return Value

The prior value of the Watch.

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::fetch_sub

Atomically subtracts the specified amount to the Watch value, returning the previous value.

```c++
T fetch_sub(T arg);
```

_NOTE: This method is only available if T is a primitive integer type._

##### Return Value

The prior value of the Watch.

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::get_value

Returns the current value of the Watch to the caller.

```c++
T get_value() const;
```

##### Return Value

The current Watch value.

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::is_closed

Returns whether the Watch is in a "closed" state.

```c++
bool is_closed() const;
```

##### Return Value

* `true` if the Watch is closed
* `false` otherwise

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->

#### batt::Watch::modify

Atomically modifies the Watch value by applying the passed transform `fn`.

```c++
template <typename Fn = T(T)>
T modify(Fn&& fn);
```

`fn` **MUST** be safe to call multiple times within a single call to `modify`.  This is because `modify` may be implemented via an atomic compare-and-swap loop.

##### Return Value

* if `T` is a primitive integer type (including `bool`), the new value of the Watch
* else, the old value of the Watch

***NOTE: This behavior is acknowledged to be less than ideal and will be fixed in the future to be consistent, regardless of `T`***

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::modify_if

Retries calling `fn` on the Watch value until EITHER of: 
  * `fn` returns `batt::None`
  * BOTH of: 
    * `fn` returns a non-`batt::None` value
    * the Watch value is atomically updated via compare-and-swap

```c++
template <typename Fn = batt::Optional<T>(T)>
batt::Optional<T> modify_if(Fn&& fn);
```

`fn` **MUST** be safe to call multiple times within a single call to `modify_if`.  This is because `modify_if` may be implemented via an atomic compare-and-swap loop.

Unlike [await\_modify](#battwatchawait_modify), this method never puts the current task/thread to sleep; it keeps _actively_ polling the Watch value until it reaches one of the exit criteria described above.

##### Return Value

The final value returned by `fn`, which is either `batt::None` or the new Watch value.

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->


#### batt::Watch::set_value

Atomically set the value of the Watch.

```c++
void set_value(T new_value);
```

<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->

