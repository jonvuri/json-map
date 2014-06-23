# json-map

Utility to map one JavaScript object to another in a declarative style:

```js
var map = require( 'json-map' )
var path = map.path
var val = map.val

var barmap = map( path( 'foo', 'bar' ), [ val( 0, false ), val( 1, true ) ] )

barmap( { foo: 1 } ) => { bar: true }

```

There are two main functions: `map` and `transform`. They take a map from one reference list into an object to another reference list, and optionally one or more maps from the value at that location to a new value, and return a function that performs those maps when called on an object. The function `map` returns will return a new object when called, and `transform`'s will change the original object.

Both `map` and `transform` also have a `compose` method that will combine several `map`s and `transform`s into a single function.

There are four map builder functions included: `path` and `ref` for the reference path map, and `val` and `nomap` for the value map.

## .map( refMap [, valMap] )

Returns a function `fn( object )` that calls `refMap( refList )` and `valMap( value, abort )` for every path into `object`, where `refList` is an array of keys representing the path and `value` is the value at that path, and returns a new object based on the results.

`refMap` should return an array of keys to map to in the result object, or a falsy value to not map the path.

`valMap` should return a value to map to in the result. If no `valMap` is given, the value will be unchanged. `valMap` can also be an array of functions, which will be called in order with each function getting the value returned by the last one. Any `valMap` function can call the `abort` callback, which will result in the path not being mapped even if `refMap` returned a new `refList`.

### Examples

```js
var jsonmap = require( 'json-map' )

```

## .transform( refMap [, valMap] )

This behaves the same as **map** in all respects except that the returned function will map changes onto the source object rather than returning a new object. `refMap` changes will result in properties being moved from the original path in the object to the new path.

### Examples

```js

```

## .map.compose( mapList )

Combines `mapList`, an array of functions returned by **.map()**, into a single function that will apply them all at once.

### Examples

```js

```

## .transform.compose( transformList )

Combines `transformList`, an array of functions returned by **.transform()**, into a single function that will apply them all at once.

### Examples

```js

```

## .ref( from [, to] )

A `refMap` function builder that will map the reference list `from` in the source object to the same path in the result, or to the list `to` if specified.

### Examples

```js

```

## .path( from [, to] )

A `refMap` function builder that will map any valid JavaScript reference expression `from` in the source object to the same path in the result, or to the expression `to` if specified.


### Examples

```js

```

## .val( from, to )

A `valMap` function builder that will return the value `to` if passed the value `from`. If passed any other value it will return it unchanged.

### Examples

```js

```

## .nomap( value )

A `valMap` function builder that will call `abort` if it is passed `value`.

### Examples

```js

```