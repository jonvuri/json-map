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


			expect( result ).to.deep.equal( { 'pre_color': 'orage' } )

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


		} )


	} )


	describe( '#path', function () {


		it( 'should apply to map', function () {

			var source, result


			source = { color: 'orange' }

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

			result = jsonmap.map( jsonmap.ref( [ 'color' ] ) )( source )


			expect( result ).to.deep.equal( { color: 'orange' } )

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
