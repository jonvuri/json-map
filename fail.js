'use strict'


var util = require( 'util' )


module.exports = function fail() {

	var error = new Error( [].map.call( arguments, util.inspect ).join(' ') )

	error.name = 'JsonMapError'

	throw error

}
