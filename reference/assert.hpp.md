# &lt;batteries/assert.hpp&gt; : Fatal error check macros

[Reference](#reference)

This header includes enhanced drop-in replacements for the standard library's `assert(_<condition>_)` function.  All the supported assertion types have a version (`BATT_CHECK*`) which is always on, even in optimized/release builds, and a version (`BATT_ASSERT*`) that is automatically stripped out of non-Debug builds.

## Advantages over standard `assert` statements

- Using a more descriptive assertion macro allows your program to print a more informative error message if an assertion does fail.  For example, you might use the statement:
  ```c++
  assert(x == 1);
  ```
  But if this assertion fails, all you know is that x was not equal to 1.  What was it equal to?!  Batteries will answer this question automatically if you write:
  ```c++
  BATT_ASSERT_EQ(x, 1);
  ```
  You don't have to worry about making sure that the types you're comparing support `std::ostream` output to take advantage of this feature; Batteries will automatically do its best to print out something that might be useful, regardless of type.  If you want to take advantage of this feature explicitly (when writing some arbitrary type to a stream), you can use `batt::make_printable`.
  ***TODO EXAMPLE NEEDED***
- Full stack traces, with source symbols if available, are automatically printed whenever an assertion failure happens.
- `BATT_CHECK_*` allows you to write assertions that are guaranteed never to be compiled out of your program, even in optimized/release builds.
- All `BATT_CHECK_*`/`BATT_ASSERT_*` statements support `operator<<` like `std::ostream` objects, so that you can add more contextual information to help diagnose an assertion failure.  Example:
  ```c++
  int y = get_y();
  int z = get_z();
  int x = (y + z) / 2;
  BATT_ASSERT_EQ(x, 1) << "y = " << y << ", z = " << z << " (expected x to be the average of y and z)";
  ```

## Reference

### Logical Assertions

<!--
| Debug-only | Always Enabled | Other |
| ---------- | -------------- | ---------- |
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK" >}} | {{< doxdefine file="assert.hpp" name="BATT_PANIC" >}} |
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT_EQ" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK_EQ" >}} | {{< doxdefine file="assert.hpp" name="BATT_UNREACHABLE" >}} |
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT_NE" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK_NE" >}} |  {{< doxdefine file="assert.hpp" name="BATT_NORETURN" >}} |
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT_LT" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK_LT" >}} | | 
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT_GT" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK_GT" >}} | |
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT_LE" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK_LE" >}} | |
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT_GE" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK_GE" >}} | |
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT_NOT_NULLPTR" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK_NOT_NULLPTR" >}} | |
| {{< doxdefine file="assert.hpp" name="BATT_ASSERT_IMPLIES" >}} | {{< doxdefine file="assert.hpp" name="BATT_CHECK_IMPLIES" >}} | |
-->

### Comparison Assertions

| Debug-only             | Always Enabled        | Description              |
| :--------------------- | :-------------------- | :----------------------- |
| `BATT_ASSERT_EQ(a, b)` | `BATT_CHECK_EQ(a, b)` | Assert that `(a) == (b)` |
| `BATT_ASSERT_NE(a, b)` | `BATT_CHECK_NE(a, b)` | Assert that `(a) != (b)` |
| `BATT_ASSERT_LT(a, b)` | `BATT_CHECK_LT(a, b)` | Assert that `(a) < (b)`  |
| `BATT_ASSERT_GT(a, b)` | `BATT_CHECK_GT(a, b)` | Assert that `(a) > (b)`  |
| `BATT_ASSERT_LE(a, b)` | `BATT_CHECK_LE(a, b)` | Assert that `(a) <= (b)` |
| `BATT_ASSERT_GE(a, b)` | `BATT_CHECK_GE(a, b)` | Assert that `(a) >= (b)` |

### Other/Advanced
