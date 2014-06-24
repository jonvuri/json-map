rd build /s /q
md build
xcopy src\* build /s /i

echo "Starting ESLint" && node node_modules/eslint/bin/eslint.js . && echo "ESLint complete" && echo "Starting tests" && node node_modules/mocha/bin/mocha --reporter spec test/test.js && echo "Tests complete"
