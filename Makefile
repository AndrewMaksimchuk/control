.PHONY: check

check:
	./shellcheck --color=always ./control *.bash | tee .errors_bash
