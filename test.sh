#!/bin/bash


cyanprint () {
	printf "\e[36m[ $1 ]\e[0m\n"
}


rm -rf build
mkdir build
cp -R src/* build

cyanprint "Starting ESLint" &&
node_modules/eslint/bin/eslint.js . &&
cyanprint "ESLint complete" &&
cyanprint "Starting tests" &&
node_modules/mocha/bin/mocha --reporter spec test/test.js &&
cyanprint "Tests complete"
