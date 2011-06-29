all:
	@npm install

install:
	@node_modules/forge/bin/forge .

docs:
	@java -jar vendor/jsdoc/jsrun.jar vendor/jsdoc/app/run.js -c=jsdoc.conf
