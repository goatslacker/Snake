all:
	@npm install

install:
	@node_modules/forge/bin/forge.js .

documentation:
	@java -jar vendor/jsdoc/jsrun.jar vendor/jsdoc/app/run.js -c=jsdoc.conf
