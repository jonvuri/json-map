'use strict'


var util = require( 'util' )


module.exports = function fail( message, object ) {

	var error = new Error( message + ': ' + util.inspect( object ) )

	error.name = 'JsonMapError'

	throw error

}
