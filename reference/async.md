# &lt;batteries/async/...&gt; : Async Tasks and I/O

{:toc}

## batt::Watch&lt;T&gt;

```c++
#include <batteries/async/watch.hpp>
```

### Summary

| Getters                           | Modifiers                                                            || Synchronization                                | 
| :-------------------------------- | :-------------------------------- | :-------------------------------- | :--------------------------------------------- |
| [is\_closed](#battwatchis_closed) | [close](#battwatchclose)          | [fetch\_add](#battwatchfetch_add) | [async_wait](#battwatchasync_wait)             |
| [get\_value](#battwatchget_value) | [set_value](#battwatchset_value)  | [fetch\_sub](#battwatchfetch_sub) | [await\_not\_equal](#battwatchawait_not_equal) | 
|                                   | [modify](#battwatchmodify)        | [fetch\_or](#battwatchfetch_or)   | [await\_true](#battwatchawait_true)            |
|                                   | [modify\_if](#battwatchmodify_if) | [fetch\_and](#battwatchfetch_sub) | [await\_equal](#battwatchawait_equal)          |
|                                   |                                   |                                   | [await\_modify](#battwatchawait_modify)        |

### Introduction

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
<br><!-- ==#==========+==+=+=++=+++++++++++-+-+--+----- --- -- -  -  -   - -->

#### batt::Watch::async_wait

Invokes the passed handler `fn` with the current value of the Watch as soon as this value is _not_ equal to the passed value `last_seen`.

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

Retries `fn` on the Watch value until it succeeds or the watch is closed.

```c++
template <typename Fn = batt::Optional<T>(T)>
batt::StatusOr<T> await_modify(Fn&& fn);
```

If `fn` returns `batt::None`, this indicates `fn` should not be called again until a new value is available.

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
T fetch_and(T arg);
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
template <typename Fn = Optional<T>(T)>
Optional<T> modify_if(Fn&& fn);
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

