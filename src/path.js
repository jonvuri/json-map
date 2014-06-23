'use strict'


var _       = require( 'lodash' )
var esprima = require( 'esprima' )

var fail    = require( './fail' )


function convertPathToRefList( path ) {

	var parsedPath
	var refList = []


	function convertFail() {
		fail( 'Couldn\'t convert path to reference list:', path )
	}

	function getRef( expression ) {

		if ( expression.type === 'ArrayExpression' ) {

			if ( expression.elements.length !== 1 ) {
				convertFail()
			}

			refList.push( expression.elements[0].value )

		} else if ( expression.type === 'Identifier' ) {

			refList.push( expression.name )

		} else if ( expression.type === 'MemberExpression' ) {

			getRef( expression.object )

			if ( expression.property.type === 'Identifier' ) {
				refList.push( expression.property.name )
			} else if ( expression.property.type === 'Literal' ) {
				refList.push( expression.property.value )
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
		convertFail()
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
			return false
		}

	}

}
