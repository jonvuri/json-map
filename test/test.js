/* global describe it */
/* eslint */

'use strict'

var expect = require( 'chai' ).expect

var jsonmap = require( '../index' )


describe( 'json-map', function ( ) {


	it( 'should apply path maps', function () {

		var source, pathMap, result


		source = { foo: 0 }

		pathMap = function ( refList ) {

			return refList.map( function ( ref ) {

				return 'pre/' + ref

			} )

		}

		result = jsonmap( pathMap )( source )


		expect( result ).to.deep.equal( { 'pre/foo': 0 } )

	} )


	it( 'should apply first path map to return ref list', function () {

		var source, pathMaps, result


		source = { foo: 0 }

		pathMaps = [

			function ( refList ) {

				return refList.map( function ( ref ) {

					return 'one/' + ref

				} )

			},

			function ( refList ) {

				return refList.map( function ( ref ) {

					return 'two/' + ref

				} )

			}

		]

		result = jsonmap( pathMaps )( source )


		expect( result ).to.deep.equal( { 'one/foo': 0 } )

	} )


	it( 'should apply jsonmap.path map', function () {

		var source, path, result


		source = { foo: 0 }

		path = jsonmap.path

		result = jsonmap( path( 'foo', 'bar' ) )( source )


		expect( result ).to.deep.equal( { bar: 0 } )

	} )


	it( 'should apply single-parameter jsonmap.path map', function () {

		var source, path, result


		source = { foo: 0, bar: 1 }

		path = jsonmap.path

		result = jsonmap( path( 'foo' ) )( source )


		expect( result ).to.deep.equal( { foo: 0 } )

	} )


	it( 'should apply jsonmap.ref map', function () {

		var source, ref, result


		source = { foo: 0, bar: 1 }

		ref = jsonmap.ref

		result = jsonmap( ref( [ 'bar' ] ) )( source )


		expect( result ).to.deep.equal( { bar: 1 } )

	} )


	it( 'should apply jsonmap.all map', function () {

		var source, all, result


		source = { foo: 0 }

		all = jsonmap.all

		result = jsonmap( all() )( source )


		expect( result ).to.deep.equal( { foo: 0 } )

	} )


	it( 'should apply value maps', function () {

		var source, all, valueMap, result


		source = { foo: 0 }

		all = jsonmap.all

		valueMap = function () {

			return false

		}

		result = jsonmap( all(), valueMap )( source )


		expect( result ).to.deep.equal( { foo: false } )

	} )


	it( 'should apply multiple value maps', function () {

		var source, all, valueMaps, result


		source = { foo: 0, bar: 1 }

		all = jsonmap.all

		valueMaps = [

			function ( value ) {

				if ( value === 0 ) {

					return false

				} else {

					return value

				}

			},

			function ( value ) {

				if ( value === 1 ) {

					return true

				} else {

					return value

				}

			}

		]

		result = jsonmap( all(), valueMaps )( source )


		expect( result ).to.deep.equal( { foo: false, bar: true } )

	} )


	it( 'should apply jsonmap.val map', function () {

		var source, all, val, result


		source = { foo: 0, bar: 1 }

		all = jsonmap.all

		val = jsonmap.val

		result = jsonmap( all(), [ val( 0, false ), val( 1, true ) ] )( source )


		expect( result ).to.deep.equal( { foo: false, bar: true } )

	} )


} )
