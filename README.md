# json-map

Utility to map one JavaScript object to another in a declarative style:

```js
var jsonmap = require( 'json-map' )
var map = jsonmap.map
var path = jsonmap.path
var val = jsonmap.val

var huemap = map( path( 'color', 'hue' ), [ val( 1, 'orange' ), val( 2, 'blue' ) ] )

huemap( { color: 1, intensity: 8 } ) => { hue: 'orange' }
```

There are two main functions: `map` and `transform`. They take a map from one reference list into an object to another reference list, and optionally one or more maps from the value at that location to a new value, and return a function that performs those maps when called on an object. The function `map` returns will return a new object when called, and `transform`'s will change the original object.

Both `map` and `transform` also have a `compose` method that will combine several `map`s and `transform`s into a single function.

There are four map builder functions included: `path` and `ref` for the reference path map, and `val` and `nomap` for the value map.

## .map( refMap [, valMap] )

Returns a function `fn( object )` that calls `refMap( refList )` and `valMap( value, abort )` for every path to a leaf node in `object`, where `refList` is an array of keys representing the path and `value` is the value at that path, and returns a new object based on the results.

`refMap` should return an array of keys to map to in the result object, or a falsy value to not map the path.

`valMap` should return a value to map to in the result. If no `valMap` is given, the value will be unchanged. `valMap` can also be an array of functions, which will be called in order with each function getting the value returned by the last one. Any `valMap` function can call the `abort` callback, which will result in the path not being mapped even if `refMap` returned a new `refList`.

### Examples

```js
var jsonmap = require( 'json-map' )
var map = jsonmap.map
```

```js
function refMap( refList ) {
	return refList.concat( 'value' )
}

var object = { color: 'orange', shade: 'amber' }

map( refMap )( object ) => { color: { value: 'orange' }, shade: { value: 'amber' } }
```

```js
function refMap( refList ) {
	return refList
}

function valMap( value ) {
	return value * 2
}

var object = { hue: 2, intensity: 6 }

map( refMap, valMap )( object ) => { hue: 4, intensity: 12 }
```

```js
function refMap( refList ) {
	return refList[0][0] !== '_' && refList
}

function valMap( value, abort ) {
	if ( typeof value === 'number' ) abort()
    return value
}

var object = { _id: 'A429', value: 'orange', chroma: 12 }

map( refMap, valMap )( object ) => { value: 'orange' }
```

## .transform( refMap [, valMap] )

This behaves the same as **.map()** in all respects except that the returned function will map changes onto the source object rather than returning a new object. `refMap` changes will result in properties being moved from the original path in the object to the new path.

### Examples

```js
var jsonmap = require( 'json-map' )
var transform = jsonmap.transform

function refMap( refList ) {
	return [ 'stringvals' ].concat( refList )
}

function valMap( value, abort ) {
    return String( value )
}

var object = { color: 2 }

transform( refMap, valMap )( object )

object => { color: 2, stringvals: { color: '2' } }
```

## .ref( from [, to] )

A `refMap` function builder that will map the reference list `from` in the source object to the same path in the result, or to the list `to` if specified.

### Examples

```js
var jsonmap = require( 'json-map' )
var map = jsonmap.map
var ref = jsonmap.ref

var object = { color: { primary: 'orange', shade: 'amber' } }

map( ref( [ 'color', 'primary' ], [ 'color' ] ) )( object ) => { color: 'orange' }
```

## .path( from [, to] )

A `refMap` function builder that will map any valid JavaScript reference expression `from` in the source object to the same path in the result, or to the expression `to` if specified.


### Examples

```js
var jsonmap = require( 'json-map' )
var map = jsonmap.map
var path = jsonmap.path

var object = { color: { primary: 'orange', shade: 'amber' } }

map( path( 'color.shade', '["shade"]' ) )( object ) => { shade: 'amber' }
```

## .all()

A `refMap` function builder that will return any `refList` it is passed unchanged, mapping all paths on the object. Note that this is just the identity function `function ( x ) { return x }`.


### Examples

```js
var jsonmap = require( 'json-map' )
var map = jsonmap.map
var all = jsonmap.all

function valMap( value ) {
	return value.length
}

var object = { color: 'orange', shade: 'amber' }

map( all(), valMap )( object ) => { color: 6, shade: 5 }
```

## .val( from, to )

A `valMap` function builder that will return the value `to` if passed the value `from`. If passed any other value it will return it unchanged.

### Examples

```js
var jsonmap = require( 'json-map' )
var map = jsonmap.map
var path = jsonmap.path
var val = jsonmap.val

var object = { color: 1, hue: 8 }

map( path( 'color' ), val( 1, 'orange' ) )( object ) => { color: 'orange' }
```

## .nomap( value )

A `valMap` function builder that will call `abort` if it is passed `value`.

### Examples

```js
var jsonmap = require( 'json-map' )
var map = jsonmap.map
var all = jsonmap.all
var nomap = jsonmap.nomap
var val = jsonmap.val

var object = { '1': { color: 1 }, '2': { color: 0 } }

map( all(), [ nomap( 0 ), val( 1, 'orange' ) ] )( object ) => { color: 'orange' }
```

## .map.compose( mapList )

Combines `mapList`, an array of functions returned by **.map()**, into a single function that will apply them all at once.

### Examples

```js
var jsonmap = require( 'json-map' )
var map = jsonmap.map
var compose = jsonmap.map.compose
var val = jsonmap.val

var object = { front: { color: 1, shade: 2 }, back: { color: 2, shade: 1 } }

function colorRefMap( refList ) {
	return refList[1] === 'color' && [ refList[0] + '_color' ]
}

function shadeRefMap( refList ) {
	return refList[1] === 'shade' && [ refList[0] + '_shade' ]
}

compose( [
	map( colorRefMap, [ val( 1, 'orange' ), val( 2, 'blue' ) ] )
    map( 

map( all(), [ nomap( 0 ), val( 1, 'orange' ) ] )( object ) => { color: 'orange' }
```

## .transform.compose( transformList )

Combines `transformList`, an array of functions returned by **.transform()**, into a single function that will apply them all at once.

### Examples

```js

```