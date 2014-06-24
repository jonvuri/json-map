/* global describe it */
/* eslint */

'use strict'

var expect = require( 'chai' ).expect

var jsonmap = require( '../build/jsonmap' )


function identity( x ) {
	return x
}


describe( 'json-map', function () {


	describe( '#map', function () {


		it( 'should apply ref maps', function () {

			var source, refMap, result


			source = { color: 'orange' }

			refMap = function ( refList ) {

				return refList.map( function ( ref ) {
					return 'pre_' + ref
				} )

			}

			result = jsonmap.map( refMap )( source )


			expect( result ).to.deep.equal( { 'pre_color': 'orange' } )

		} )


		it( 'should apply value maps', function () {

			var source, valueMap, result


			source = { color: 'orange' }

			valueMap = function () {
				return 'blue'
			}

			result = jsonmap.map( identity, valueMap )( source )


			expect( result ).to.deep.equal( { color: 'blue' } )

		} )


		it( 'should be called on all leaf nodes and only leaf nodes', function () {

			var refCalls = [ [ 'color', 'hue' ], [ 'color', 'shade' ] ]

			var object = { color: { hue: 'orange', shade: 'amber' } }

			var result = []

			function refMapTally( refList ) {
				result.push( refList )
			}

			jsonmap.map( refMapTally )( object )

			expect( result ).to.deep.equal( refCalls )

		} )


		it( 'should apply multiple value maps', function () {

			var source, valueMaps, result


			source = { colorA: 1, colorB: 2 }

			valueMaps = [

				function ( value ) {

					if ( value === 1 ) {
						return 'orange'
					} else {
						return value
					}

				},

				function ( value ) {

					if ( value === 2 ) {
						return 'blue'
					} else {
						return value
					}

				}

			]

			result = jsonmap.map( identity, valueMaps )( source )


			expect( result ).to.deep.equal( { colorA: 'orange', colorB: 'blue' } )

		} )


		it( 'should not map when valueMap calls abort', function () {

			var source, valueMap, result


			source = { colorA: 'orange', colorB: 'blue' }

			valueMap = function ( value, abort ) {

				if ( value === 'blue' ) {
					abort()
				} else {
					return value
				}

			}

			result = jsonmap.map( identity, valueMap )( source )


			expect( result ).to.deep.equal( { colorA: 'orange' } )

		} )


		it( 'should fail when a non-function is passed as refMap', function () {

			var message = 'not a function: \'this string is not a function\''

			function nonFunctionRefMap() {
				jsonmap.map( 'this string is not a function' )
			}

			expect( nonFunctionRefMap ).to.throw( message )

		} )


		it( 'should fail when a value not an array or function is passed as valueMap', function () {

			var message = 'not an array or function: \'this string is not an array or function\''

			function nonFunctionValueMap() {
				jsonmap.map( identity, 'this string is not an array or function' )
			}

			expect( nonFunctionValueMap ).to.throw( message )

		} )


		it( 'should fail when refMap returns a truthy value that is not an array', function () {

			var message = 'not an array: \'this string is not an array\''

			function badRefMap() {
				return 'this string is not an array'
			}

			function nonArrayRefMap() {
				jsonmap.map( badRefMap )( { color: 'orange' } )
			}

			expect( nonArrayRefMap ).to.throw( message )

		} )


		it( 'should fail when map is called on a non-object', function () {

			var message = 'not an object: \'this string is not an object\''

			function nonObjectMap() {
				jsonmap.map( identity )( 'this string is not an object' )
			}

			expect( nonObjectMap ).to.throw( message )

		} )


		describe( '#compose', function () {


			it( 'should apply multiple maps', function () {

				var source, maps, result


				source = { colorA: 'orange', colorB: 'blue', colorC: 'red' }

				maps = [
					jsonmap.map( jsonmap.path( 'colorA' ) ),
					jsonmap.map( jsonmap.path( 'colorB' ) )
				]

				result = jsonmap.map.compose( maps )( source )


				expect( result ).to.deep.equal( { colorA: 'orange', colorB: 'blue' } )

			} )


			it( 'should fail when passed non-functions', function () {

				var message = 'index 1 is not a function: \'this string is not a function\''

				function nonFunctionCompose() {
					jsonmap.map.compose( [
						jsonmap.map( identity ),
						'this string is not a function'
					] )
				}

				expect( nonFunctionCompose ).to.throw( message )

			} )


		} )


	} )


	describe( '#transform', function () {


		it( 'should transform source object', function () {

			var source, result


			source = { color: 'orange' }

			result = jsonmap.transform( identity, jsonmap.val( 'orange', 'blue' ) )( source )


			expect( source ).to.equal( result )
			expect( result.color ).to.equal( 'blue' )

		} )


		describe( '#compose', function () {


			it( 'should apply multiple transforms', function () {

				var source, transforms, result


				source = { colorA: 1, colorB: 2, colorC: 3 }

				transforms = [
					jsonmap.transform( jsonmap.path( 'colorA' ), jsonmap.val( 1, 'orange' ) ),
					jsonmap.transform( jsonmap.path( 'colorB' ), jsonmap.val( 2, 'blue' ) )
				]

				result = jsonmap.transform.compose( transforms )( source )


				expect( source ).to.equal( result )
				expect( result.colorA ).to.equal( 'orange' )
				expect( result.colorB ).to.equal( 'blue' )
				expect( result.colorC ).to.equal( 3 )

			} )


			it( 'should fail when passed non-functions', function () {

				var message = 'index 1 is not a function: \'this string is not a function\''

				function nonFunctionCompose() {
					jsonmap.transform.compose( [
						jsonmap.transform( identity ),
						'this string is not a function'
					] )
				}

				expect( nonFunctionCompose ).to.throw( message )

			} )


		} )


	} )


	describe( '#path', function () {


		it( 'should convert dot notation to ref list', function () {

			var refList = [ 'color', 'hue' ]

			expect( jsonmap.path( 'color.hue' )( refList ) ).to.deep.equal( refList )

		} )


		it( 'should convert member notation to ref list', function () {

			var refList = [ 'color', 'hue' ]

			expect( jsonmap.path( 'color["hue"]' )( refList ) ).to.deep.equal( refList )

		} )


		it( 'should convert member notation with number to ref list', function () {

			var refList = [ 'color', '1' ]

			expect( jsonmap.path( 'color[1]' )( refList ) ).to.deep.equal( refList )

		} )


		it( 'should convert path with leading array expression to ref list', function () {

			var refList = [ '1', 'two' ]

			expect( jsonmap.path( '["1"]["two"]' )( refList ) ).to.deep.equal( refList )
			expect( jsonmap.path( '["1"].two' )( refList ) ).to.deep.equal( refList )
			expect( jsonmap.path( '[1].two' )( refList ) ).to.deep.equal( refList )

		} )


		it( 'should fail to convert member notation with symbol', function () {

			var message = 'couldn\'t convert path to reference list: \'color[hue]\''

			function badPath() {
				jsonmap.path( 'color[hue]' )
			}

			expect( badPath ).to.throw( message )

		} )


		it( 'should fail to convert array notation with multiple elements', function () {

			var message = 'couldn\'t convert path to reference list: \'["color", "hue"]\''

			function badPath() {
				jsonmap.path( '["color", "hue"]' )
			}

			expect( badPath ).to.throw( message )

		} )


		it( 'should fail to convert array notation with element not a string or number', function () {

			var message = 'couldn\'t convert path to reference list: \'[{}]\''

			function badPath() {
				jsonmap.path( '[{}]' )
			}

			expect( badPath ).to.throw( message )

		} )


		it( 'should fail to convert expression with syntax error', function () {

			var message = 'couldn\'t convert path to reference list: \'color["hue"\''

			function badPath() {
				jsonmap.path( 'color["hue"' )
			}

			expect( badPath ).to.throw( message )

		} )


		it( 'should fail to convert non-reference expression', function () {

			var message = 'couldn\'t convert path to reference list: \'1 + 2\''

			function badPath() {
				jsonmap.path( '1 + 2' )
			}

			expect( badPath ).to.throw( message )

		} )


		it( 'should fail to convert non-expression', function () {

			var message = 'couldn\'t convert path to reference list: \'var x = 1\''

			function badPath() {
				jsonmap.path( 'var x = 1' )
			}

			expect( badPath ).to.throw( message )

		} )


		it( 'should fail to convert empty expression', function () {

			var message = 'path cannot be empty: \'\''

			function badPath() {
				jsonmap.path( '' )
			}

			expect( badPath ).to.throw( message )

		} )


		it( 'should apply to map', function () {

			var source, result


			source = { color: 'orange', shade: 'amber' }

			result = jsonmap.map( jsonmap.path( 'color', 'hue' ) )( source )


			expect( result ).to.deep.equal( { hue: 'orange' } )

		} )

		it( 'should apply as identity (single parameter)', function () {

			var source, result


			source = { color: 'orange', shade: 'amber' }

			result = jsonmap.map( jsonmap.path( 'color' ) )( source )


			expect( result ).to.deep.equal( { color: 'orange' } )

		} )


	} )


	describe( '#ref', function () {


		it( 'should apply to map', function () {

			var source, result


			source = { color: 'orange', shade: 'amber' }

			result = jsonmap.map( jsonmap.ref( [ 'color' ], [ 'hue' ] ) )( source )


			expect( result ).to.deep.equal( { hue: 'orange' } )

		} )


		it( 'should apply as identity (single parameter)', function () {

			var source, result


			source = { color: 'orange', shade: 'amber' }

			result = jsonmap.map( jsonmap.ref( [ 'color' ] ) )( source )


			expect( result ).to.deep.equal( { color: 'orange' } )

		} )


	} )


	describe( '#all', function () {


		it( 'should apply to map', function () {

			var source, result


			source = { color: 'orange', shade: 'amber' }

			result = jsonmap.map( jsonmap.all() )( source )


			expect( result ).to.not.equal( source )
			expect( result ).to.deep.equal( source )

		} )


	} )


	describe( '#val', function () {


		it( 'should apply to map', function () {

			var source, valueMaps, result


			source = { colorA: 1, colorB: 2 }

			valueMaps = [ jsonmap.val( 1, 'orange' ), jsonmap.val( 2, 'blue' ) ]

			result = jsonmap.map( identity, valueMaps )( source )


			expect( result ).to.deep.equal( { colorA: 'orange', colorB: 'blue' } )

		} )


	} )


	describe( '#nomap', function () {


		it( 'should stop map from occuring', function () {

			var source, result


			source = { colorA: 'orange', colorB: 'blue' }

			result = jsonmap.map( identity, jsonmap.nomap( 'blue' ) )( source )


			expect( result ).to.deep.equal( { colorA: 'orange' } )

		} )


	} )


} )
