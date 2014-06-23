'use strict'


var _       = require( 'lodash' )
var esprima = require( 'esprima' )

var fail    = require( './fail' )


function convertPathToRefList( path ) {

	var parsedPath
	var refList = []


	function convertFail() {
		fail( 'couldn\'t convert path to reference list', path )
	}

	function isValidMemberRef( node ) {
		return node.type === 'Literal' && _.isString( node.value ) || _.isNumber( node.value )
	}

	function getRef( expression ) {

		var element, property

		if ( expression.type === 'ArrayExpression' ) {

			if ( expression.elements.length === 1 ) {

				element = expression.elements[0]

				if ( isValidMemberRef( element ) ) {
					refList.push( String( element.value ) )
				} else {
					convertFail()
				}

			} else {

				convertFail()

			}

		} else if ( expression.type === 'Identifier' ) {

			refList.push( expression.name )

		} else if ( expression.type === 'MemberExpression' ) {

			getRef( expression.object )

			property = expression.property

			if ( !expression.computed && property.type === 'Identifier' ) {
				refList.push( property.name )
			} else if ( isValidMemberRef( property ) ) {
				refList.push( String( property.value ) )
			} else {
				convertFail()
			}

		} else {

			convertFail()

		}

	}


	try {
		parsedPath = esprima.parse( path )
	} catch (e) {
		convertFail()
	}


	if ( parsedPath.body.length !== 1 ) {
		fail( 'path cannot be empty', path )
	} else if ( parsedPath.body[0].type !== 'ExpressionStatement' ) {
		convertFail()
	} else {
		getRef( parsedPath.body[0].expression )
	}


	return refList

}


module.exports = function path( fromPath, toPath ) {

	var from = convertPathToRefList( fromPath )
	var to

	if ( toPath ) {
		to = convertPathToRefList( toPath )
	} else {
		to = from
	}

	return function ( refList ) {

		if ( _.isEqual( refList, from ) ) {
			return to
		} else {
			return null
		}

	}

}
