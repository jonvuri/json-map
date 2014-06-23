#!/bin/bash


cyanprint () {
	printf "\e[36m[ $1 ]\e[0m\n"
}


rm -rf build
mkdir build

cyanprint "Instrumenting source files for coverage"
node_modules/visionmedia-jscoverage/jscoverage src build && cyanprint "Instrumenting complete"

cyanprint "Generating coverage report"
node_modules/mocha/bin/mocha --reporter html-cov test/test.js > coverage.html
which -s open && open coverage.html
cyanprint "Coverage complete"
