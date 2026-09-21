.PHONY: check

check:
	./shellcheck --color=always ./control *.bash | tee .errors_bash

tests-js:
	npx vitest run --coverage

tests-bash:
	./tests/bats/bin/bats ./tests/*.bats | tee .tests_bash

tests: tests-js tests-bash
