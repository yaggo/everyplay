all: ui.css

ui.css: node_modules/stylus ui.styl
	stylus ui.styl

develop: node_modules/nodefront node_modules/stylus
	stylus -w . &
	coffee -wcb . &
	nodefront serve -l 9000 &
	sleep 1; open -W http://localhost:9000

run: node_modules/nodefront
	nodefront serve -l 9000 &
	sleep 1; open -W http://localhost:9000

node_modules/nodefront:
	npm install nodefront

node_modules/stylus:
	npm install stylus

clean:
	rm -rf node_modules

.PHONY: clean
