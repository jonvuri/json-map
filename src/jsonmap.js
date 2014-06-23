'use strict'


var traverse = require( 'traverse' )
var _        = require( 'lodash' )

var fail     = require( './fail' )
var path     = require( './path' )


function mapOrTransform( transform, refMap, valueMap ) {

	var valueMaps


	if ( !_.isFunction( refMap ) ) {
		fail( 'not a function', refMap )
	}

	if ( !valueMap ) {
		valueMaps = []
	} else if ( _.isArray( valueMap ) ) {
		valueMaps = valueMap
	} else if ( _.isFunction( valueMap ) ) {
		valueMaps = [ valueMap ]
	} else {
		fail( 'not an array or function', valueMap )
	}


	return function map( object ) {

		var destination


		if ( !_.isObject( object ) ) {
			fail( 'not an object', object )
		}


		object = traverse( object )
		
		if ( transform ) {
			destination = object
		} else {
			destination = traverse( map.object || {} )
		}


		object.forEach( function ( node ) {

			var refList
			var nomap = false

			function abort() {
				nomap = true
			}

			if ( this.notRoot ) {

				refList = refMap( this.path )

				if ( refList ) {

					if ( !_.isArray( refList ) ) {
						fail( 'not an array', refList )
					}

					_.each( valueMaps, function ( valueMap ) {

						node = valueMap( node, abort )

						return !nomap

					})

					if ( !nomap ) {

						if ( transform ) {
							this.remove()
						}
						
						destination.set( refList, node )

					}

				}

			}

		} )


		return destination.value

	}

}


function verifyCallableList( list ) {

	_.each( list, function ( x, i ) {

		if ( !_.isFunction( x ) ) {
			fail( 'index ' + i + ' is not a function', x )
		}

	})

}


var jsonmap = module.exports = {}


jsonmap.map = function map( refMap, valueMap ) {
	return mapOrTransform( false, refMap, valueMap )
}

jsonmap.map.compose = function mapCompose( maps ) {

	verifyCallableList( maps )

	return function ( object ) {

		return _.reduce( maps, function ( result, map ) {
			map.object = result
			return map( object )
		}, {} )

	}

}


jsonmap.transform = function map( refMap, valueMap ) {
	return mapOrTransform( true, refMap, valueMap )
}

jsonmap.transform.compose = function transformCompose( transforms ) {

	verifyCallableList( transforms )

	return function ( object ) {

		return _.reduce( transforms, function ( result, transform ) {
			return transform( result )
		}, object )

	}

}


//// Shorthand callbacks ////

/// refMaps

// Ditch this and its require if you don't want to depend on esprima
jsonmap.path = path

jsonmap.ref = function ref( match ) {

	return function ( refList ) {

		if ( _.isEqual( match, refList ) ) {
			return refList
		} else {
			return false
		}

	}

}

/// valueMaps

jsonmap.val = function val( match, mapTo ) {

	return function ( value ) {

		if ( _.isEqual( match, value ) ) {
			return mapTo
		} else {
			return value
		}

	}

}

jsonmap.nomap = function nomap( match ) {

	return function ( value, abort ) {

		if ( _.isEqual( match, value ) ) {
			abort()
		} else {
			return value
		}

	}

}
