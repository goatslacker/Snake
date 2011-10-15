all: createdir build compress docs

install: submodules all

submodules:
	@submodule init && submodule update

build:
	@cat src/snake.js src/collection.js > build/snake.js

docs:
	@3rd-party/docco/bin/docco build/snake.js

createdir:
	@mkdir build docs

compress:
	@3rd-party/UglifyJS/bin/uglifyjs build/snake.js > build/snake.min.js

.PHONY: build docs
