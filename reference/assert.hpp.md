# &lt;batteries/assert.hpp&gt; : Fatal error check macros

[Reference](#reference)

* TOC
{:toc}

This header includes enhanced drop-in replacements for standard `assert()` statements.  All the supported assertion types have a version (`BATT_CHECK*`) which is always on, even in optimized/release builds, and a version (`BATT_ASSERT*`) that is automatically stripped out of non-Debug builds.

**NOTE:** Batteries assumes the build type is Release/Optimized if the macro `NDEBUG` is defined; in this case, all `BATT_ASSERT*` statements will be stripped out of the compilation. 

## Advantages

- Using a more descriptive assertion macro allows your program to print a more informative error message if an assertion does fail.  For example, you might use the statement:
  ```c++
  assert(x == 1);
  ```
  But if this assertion fails, all you know is that x was not equal to 1.  What was it equal to?!  Batteries will answer this question automatically if you write:
  ```c++
  BATT_ASSERT_EQ(x, 1);
  ```
  
  You don't have to worry about making sure that the types you're comparing support `std::ostream` output to take advantage of this feature; Batteries will automatically do its best to print out something that might be useful, regardless of type.  If you want to take advantage of this feature explicitly (when writing some arbitrary type to a stream), you can use `std::cout << batt::make_printable(obj)`.
- Full stack traces, with source symbols if available, are automatically printed whenever an assertion failure happens.
- `BATT_CHECK_*` allows you to write assertions that are guaranteed never to be compiled out of your program, even in optimized/release builds.
- All `BATT_CHECK_*`/`BATT_ASSERT_*` statements support `operator<<` like `std::ostream` objects, so that you can add more contextual information to help diagnose an assertion failure.  Example:
  ```c++
  int y = get_y();
  int z = get_z();
  int x = (y + z) / 2;
  BATT_ASSERT_EQ(x, 1) 
      << "y = " << y << ", z = " << z 
      << " (expected the average of y and z to be 1)";
  ```
  
  **NOTE:** Diagnostic output expressions added via `<<` are never evaluated unless the assertion actually fails, so don't worry if they are somewhat expensive.  
  **(ALSO) NOTE:** Even on Release builds, all expressions that appear in a `BATT_ASSERT_*` statement _will_ be compiled, so you don't have to worry about breaking Debug builds when compiling primarily using optimization.

## Reference

### Logical Assertions

| Debug-only                   | Always Enabled              | Description                      |
| :--------------------------- | :-------------------------- | :------------------------------- |
| `BATT_ASSERT(cond)`          | `BATT_CHECK(cond)`          | Assert that `bool{cond} == true` |
| `BATT_ASSERT_IMPLES(p, q)`   | `BATT_CHECK_IMPLIES(p, q) ` | Assert that if `(p)` is true, then so is `(q)` (i.e., `(!(p) || (q))`)|
| `BATT_ASSERT_NOT_NULLPTR(x)` | `BATT_CHECK_NOT_NULLPTR(x)` | Assert that `(x) != nullptr` |

### Comparison Assertions

| Debug-only             | Always Enabled            | Description              |
| :--------------------- | :------------------------ | :----------------------- |
| `BATT_ASSERT_EQ(a, b)` | `BATT_CHECK_EQ(a, b)`     | Assert that `(a) == (b)` |
| `BATT_ASSERT_NE(a, b)` | `BATT_CHECK_NE(a, b)`     | Assert that `(a) != (b)` |
| `BATT_ASSERT_LT(a, b)` | `BATT_CHECK_LT(a, b)`     | Assert that `(a) < (b)`  |
| `BATT_ASSERT_GT(a, b)` | `BATT_CHECK_GT(a, b)`     | Assert that `(a) > (b)`  |
| `BATT_ASSERT_LE(a, b)` | `BATT_CHECK_LE(a, b)`     | Assert that `(a) <= (b)` |
| `BATT_ASSERT_GE(a, b)` | `BATT_CHECK_GE(a, b)`     | Assert that `(a) >= (b)` |

### Other/Advanced

| Name | Description |
| :--- | :---------- |
| `BATT_PANIC()` | Forces the program to exit immediately, printing a full stack trace and any message `<<`-inserted to the `BATT_PANIC()` statement. Example:  `BATT_PANIC() << "Something has gone horribly wrong!  x = " << x;`  |
| `BATT_UNREACHABLE()` | Statement that tells the compiler this point in the code should be unreachable; for example, it is right after a call to `std::abort()` or `std::terminate()`.  Use this to silence spurious warnings about dead code. |
| `BATT_NORETURN` | When added to a function declaration (before the return type), tells the compiler that a function never returns.  Use this to silence spurious warnings.  Example:  `BATT_NORETURN void print_stuff_and_exit();`  |
| `batt::make_printable(obj)` | Makes any expression printable, even if it doesn't have an overloaded  `std::ostream& operator<<(std::ostream&, T)` .  If the type of `obj` does define such an operator, however, that will be invoked when using `batt::make_printable`.  `obj` is passed/forwarded by reference only; no copy of the original object/value is made. |
