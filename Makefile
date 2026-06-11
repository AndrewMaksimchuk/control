.PHONY: check

check:
	./shellcheck --color=always ./control *.bash | tee .errors_bash

tests-js:
	npx vitest
