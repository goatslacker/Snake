all: createdir build compress docs

install: submodules all

submodules:
	@git submodule init && git submodule update

build:
	@cat src/snake.js src/collection.js > build/snake.js && echo "Snake built."

docs:
	@packages/docco/bin/docco build/snake.js

createdir:
	@mkdir -p build docs

compress:
	@packages/UglifyJS/bin/uglifyjs build/snake.js > build/snake.min.js && echo "Snake compressed with UglifyJS."

.PHONY: build docs
