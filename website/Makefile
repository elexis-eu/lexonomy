bundle.js: $(wildcard riot/*.riot)
	[ -d node_modules ] || npm install --legacy-peer-deps
	npm run build
bundle.min.js: bundle.js
	npm run build:riot:minify
watch:
	npm run watch
install:
	npm install
