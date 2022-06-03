bundle.js: $(wildcard riot/*.riot)
	[ -d node_modules ] || npm install
	[ -d node_modules ] || npm install
	[ -d editor/node_modules ] || cd editor && npm install && cd ..
	npm run build
bundle.min.js: bundle.js
	npm run build:riot:minify
watch:
	npm run watch
install:
	npm install
