'use strict'


var util      =  require( 'util' )

var esprima   =  require( 'esprima' )
var traverse  =  require( 'traverse' )
var _         =  require( 'lodash' )


function pathToReferenceList( path ) {

	var parsedPath = esprima.parse( path )
	var refList = []


	function fail() {
		throw 'Error processing path: ' + path
	}

	function r( expression ) {

		if ( expression.type === 'ArrayExpression' ) {

			if ( expression.elements.length !== 1 ) {
				fail()
			}

			refList.push( expression.elements[0].value )

		} else if ( expression.type === 'Identifier' ) {

			refList.push( expression.name )

		} else if ( expression.type === 'MemberExpression' ) {

			r( expression.object )

			if ( expression.property.type === 'Identifier' ) {

				refList.push( expression.property.name )

			} else if ( expression.property.type === 'Literal' ) {

				refList.push( expression.property.value )

			} else {
				fail()
			}

		} else {
			fail()
		}

	}


	if ( parsedPath.body.length !== 1 ) {
		fail()
	} else if ( parsedPath.body[0].type !== 'ExpressionStatement' ) {
		fail()
	} else {

		r( parsedPath.body[0].expression )

	}


	return refList

}


var jsonmap = function ( pathMap, valueMap ) {

	var pathMapFns
	var valueMapFns


	if ( _.isArray( pathMap ) ) {

		pathMapFns = pathMap

	} else if ( _.isFunction( pathMap ) ) {

		pathMapFns = [ pathMap ]

	} else {
		throw '[json-map] pathMap is not an array or function: ' + util.inspect( pathMap )
	}


	if ( arguments.length === 1 ) {

		valueMapFns = []

	} else if ( _.isArray( valueMap ) ) {

		valueMapFns = valueMap

	} else if ( _.isFunction( pathMap ) ) {

		valueMapFns = [ valueMap ]

	} else {
		throw '[json-map] valueMap is not an array or function: ' + util.inspect( valueMap )
	}



	return function ( source, destination ) {

		var destTraverse

		if ( !_.isObject( source ) ) {
			throw '[json-map] source not an object: ' + util.inspect( source )
		}

		if ( arguments.length === 1 ) {

			destination = {}

		} else if ( !_.isObject( destination ) ) {
			throw '[json-map] destination not an object: ' + util.inspect( destination )
		}


		destTraverse = traverse( destination )


		traverse( source ).forEach( function ( node ) {

			var sourceRefList = this.path

			if ( sourceRefList.length > 0 ) {

				_.some( pathMapFns, function ( pathMapFn ) {

					var destRefList = pathMapFn( sourceRefList )

					if ( destRefList ) {

						_.each( valueMapFns, function ( valueMapFn ) {

							node = valueMapFn( node )

						})

						destTraverse.set( destRefList, node )

					}

					return destRefList

				} )

			}

		} )


		return destination

	}

}

jsonmap.path = function ( sourcePath, destinationPath ) {

	var matchSourceRefList = pathToReferenceList( sourcePath )
	var destRefList

	if ( arguments.length === 1 ) {

		destRefList = matchSourceRefList

	} else {

		destRefList = pathToReferenceList( destinationPath )

	}

	return function ( sourceRefList ) {

		if ( _.isEqual( sourceRefList, matchSourceRefList ) ) {

			return destRefList

		} else {

			return false

		}

	}

}

jsonmap.ref = function ( refList ) {

	return function ( sourceRefList ) {

		if ( _.isEqual( sourceRefList, refList ) ) {

			return sourceRefList

		} else {

			return false

		}

	}

}

jsonmap.all = function () {

	return _.identity

}

jsonmap.val = function ( sourceValue, destinationValue ) {

	return function ( value ) {

		if ( _.isEqual( value, sourceValue ) ) {

			return destinationValue

		} else {

			return value

		}

	}

}

module.exports = jsonmap
