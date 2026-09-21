#!/bin/bash

load "$PWD/tests/bats_support/load"
load "$PWD/tests/bats_assert/load"
load "$PWD/tests/bats_file/load"

setup() {
    export TEST_DIRECTORY
    TEST_DIRECTORY="$(mktemp -d)"

    cp ./README.md "$TEST_DIRECTORY/README.md"
    cp ./control "$TEST_DIRECTORY/control"
    cp ./stdlib.bash "$TEST_DIRECTORY/stdlib.bash"
    touch "$TEST_DIRECTORY/history.bash"
    touch "$TEST_DIRECTORY/update.bash"
    touch "$TEST_DIRECTORY/main.bash"
    touch "$TEST_DIRECTORY/in_work.bash"
    touch "$TEST_DIRECTORY/to_work.bash"
    touch "$TEST_DIRECTORY/done_work.bash"
    touch "$TEST_DIRECTORY/todo.bash"
    touch "$TEST_DIRECTORY/do_work.bash"
    touch "$TEST_DIRECTORY/local_check.bash"
    touch "$TEST_DIRECTORY/control_estimate.bash"
    touch "$TEST_DIRECTORY/skip_work.bash"
    touch "$TEST_DIRECTORY/current_job.bash"

	touch "$TEST_DIRECTORY/.config"
	touch "$TEST_DIRECTORY/to-work.mjs"
}

teardown() {
    rm -rf "$TEST_DIRECTORY"
}

@test "control - default behavior, show dashbord" {
    cp ./update.bash "$TEST_DIRECTORY/update.bash"
    cp ./main.bash "$TEST_DIRECTORY/main.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	# Mock index.mjs
	touch index.mjs
	./control
    '

    assert_success
}

@test "control - command update" {
    cp ./update.bash "$TEST_DIRECTORY/update.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	# Mock index.mjs
	touch index.mjs
	./control update
    '

    assert_success
    assert_output --partial "Updating..."
}

@test "control - command u" {
    cp ./update.bash "$TEST_DIRECTORY/update.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	# Mock index.mjs
	touch index.mjs
	./control u
    '

    assert_success
    assert_output --partial "Updating..."
}

@test "control - command in-work, option not correct" {
    cp ./in_work.bash "$TEST_DIRECTORY/in_work.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	./control in-work --edit
    '

    assert_failure
    assert_output --partial "Bad argument"
}

@test "control - command in, option not correct" {
    cp ./in_work.bash "$TEST_DIRECTORY/in_work.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	./control in --edit
    '

    assert_failure
    assert_output --partial "Bad argument"
}

@test "control - command in-work, without arguments" {
    echo "test job file" > "$TEST_DIRECTORY/current_job.txt"
    cp ./in_work.bash "$TEST_DIRECTORY/in_work.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	./control in-work
    '

    assert_success
    assert_output "test job file"
}

@test "control - command in-work, with -e" {
    cp ./in_work.bash "$TEST_DIRECTORY/in_work.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	./control in-work -e
    '

    assert_success
    assert_output "You don\`t have current job"
}

@test "control - command in-work, with --update" {
    echo "test job file" > "$TEST_DIRECTORY/current_job.txt"
    cat > "$TEST_DIRECTORY/to_work.bash" << 'EOF'
    towork ()
    {
      echo "towork called"
    }
EOF

    cp ./in_work.bash "$TEST_DIRECTORY/in_work.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	./control in-work --update
    '

    assert_success
    assert_output --partial "towork called"
}


@test "control - command in-work, with -u" {
    echo "test job file" > "$TEST_DIRECTORY/current_job.txt"

    cat > "$TEST_DIRECTORY/to_work.bash" << 'EOF'
    towork ()
    {
      echo "towork called"
    }
EOF

    cp ./in_work.bash "$TEST_DIRECTORY/in_work.bash"

    run bash -c '
	cd "$TEST_DIRECTORY"
	./control in-work -u
    '

    assert_success
    assert_output --partial "towork called"
}


@test "control - command to-work, with arguments, validate repository name, fail" {
	cp ./to_work.bash "$TEST_DIRECTORY/to_work.bash"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control to-work tests@com 1
	'

	assert_failure
}


@test "control - command to-work, with arguments, validate repository issue, fail" {
	cp ./to_work.bash "$TEST_DIRECTORY/to_work.bash"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control to-work tests 1b
	'

	assert_failure
}


@test "control - command to-work, with arguments" {
	cp ./to_work.bash "$TEST_DIRECTORY/to_work.bash"

	echo "test job file" > "$TEST_DIRECTORY/current_job.txt"

	cat > "$TEST_DIRECTORY/history.bash" << 'EOF'
	start_job()
	{
		echo "history start job"
	}
EOF

	cat > "$TEST_DIRECTORY/current_job.bash" << 'EOF'
	control_dashboard_mark_current_job()
	{
		echo "mock current job mark in dashboard"
	}
EOF

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control to-work tests 1
	'

	assert_success
	assert_output --partial "mock current job mark in dashboard"
}

@test "control - command to-work, without arguments" {
    skip "Not planing, for now"
    run bash -c '
	  cd "$TEST_DIRECTORY"
	  ./control 
    '

    assert_success
}


@test "control - command done, error with current job file" {
	cp ./done_work.bash "$TEST_DIRECTORY/done_work.bash"

	rm -f "TEST_DIRECTORY/current_job.txt"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control done
	'

	assert_success
	assert_output  --partial "You don\`t have current job"
}


@test "control - command done, error with close issue" {
	cp ./done_work.bash "$TEST_DIRECTORY/done_work.bash"

	echo "test job file" > "$TEST_DIRECTORY/current_job.txt"

	cat > "$TEST_DIRECTORY/done-work.mjs" << 'EOF'
	process.exit(1);
EOF

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control done
	'

	assert_failure
	assert_output  --partial "Can't close the issue"
}


@test "control - command done" {
	cp ./done_work.bash "$TEST_DIRECTORY/done_work.bash"

	echo "test job file" > "$TEST_DIRECTORY/current_job.txt"

	touch "$TEST_DIRECTORY/done-work.mjs"

	cat > "$TEST_DIRECTORY/history.bash" << 'EOF'
	end_job()
	{
		echo "history end job"
	}
EOF

	cat > "$TEST_DIRECTORY/current_job.bash" << 'EOF'
	control_dashboard_remove_current_job()
	{
		echo "mock current job remove in dashboard"
	}
EOF

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control done
	'

	assert_success
	assert_output  --partial  "Job done"
}


@test "control - command todo, bad arguments" {
	cp ./todo.bash "$TEST_DIRECTORY/todo.bash"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control todo misspell
	'

	assert_failure
	assert_output --partial "Bad argument"
}


@test "control - command todo, open editor" {
	cp ./todo.bash "$TEST_DIRECTORY/todo.bash"

	run bash -c '
		vim() {
			echo "MOCK VIM:" "$@"
		}
		export -f vim

		cd "$TEST_DIRECTORY"
		./control todo --add
	'

	assert_success
	assert_output --partial "MOCK VIM: + +start "
}


@test "control - command todo, file of todo notes not exist" {
	cp ./todo.bash "$TEST_DIRECTORY/todo.bash"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control todo
	'

	assert_success
	assert_output --partial "You don't have ideas for projects"
}


@test "control - command todo, edit todos" {
	cp ./todo.bash "$TEST_DIRECTORY/todo.bash"

	echo "Some notes" > "$TEST_DIRECTORY/todo.md"

	run bash -c '
		vim() {
			echo "$@"
		}
		export -f vim

		cd "$TEST_DIRECTORY"
		./control todo --edit
	'

	assert_success
	assert_output --partial "todo.md"
}


@test "control - command todo, show todos" {
	cp ./todo.bash "$TEST_DIRECTORY/todo.bash"

	echo "Some notes" > "$TEST_DIRECTORY/todo.md"

	run bash -c '
		less() {
			cat "$@"
		}
		export -f less

		cd "$TEST_DIRECTORY"
		./control todo
	'

	assert_success
	assert_output "Some notes"
}


@test "control - command history, misspell" {
	cp -f ./history.bash "$TEST_DIRECTORY/history.bash"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control history clear
	'

	assert_failure
	assert_output --partial "Bad argument"
}


@test "control - command history, show history" {
	cp -f ./history.bash "$TEST_DIRECTORY/history.bash"

	echo "items" > "$TEST_DIRECTORY/.history"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control history
	'

	assert_success
	assert_output "items"
}


@test "control - command history, delete history" {
	cp -f ./history.bash "$TEST_DIRECTORY/history.bash"

	echo "items" > "$TEST_DIRECTORY/.history"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control history clean
	'

	assert_success
	assert_file_not_exists "TEST_DIRECTORY/.history"
}


@test "control - command history, empty history" {
	cp -f ./history.bash "$TEST_DIRECTORY/history.bash"

	rm -f "$TEST_DIRECTORY/.history"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control history 
	'

	assert_success
	assert_output "History empty"
}


@test "control - do-work always uses the default dev prompt in zsh" {
    cp ./do_work.bash "$TEST_DIRECTORY/do_work.bash"

    mkdir -p "$TEST_DIRECTORY/project"
    printf '%s\n' "https://github.com/example/project" > "$TEST_DIRECTORY/project/config"
    printf '%s\n' "You work on repository \"project\"" > "$TEST_DIRECTORY/current_job.txt"
    printf '%s\n' "https://github.com/example/project" >> "$TEST_DIRECTORY/current_job.txt"
    printf '%s\n' "$TEST_DIRECTORY/project" > "$TEST_DIRECTORY/.config"
    git init -q "$TEST_DIRECTORY/project"

    run bash -c '
        message() { :; }
        log_warn() { :; }

        cd "$TEST_DIRECTORY"
        source ./do_work.bash
        SHELL=/bin/zsh
        export SHELL
        JOB_FILE="$TEST_DIRECTORY/current_job.txt"
        export JOB_FILE
        config_projects="$TEST_DIRECTORY/.config"
        export config_projects

        zsh() {
            cat "$ZDOTDIR/.zshrc"
            return 0
        }
        export -f zsh

        run_dev_shell "$TEST_DIRECTORY/project"
    '

    assert_success
    assert_output --partial "PROMPT='CONTROL DEV SHELL -> '"
    assert_output --partial "precmd()"
}


@test "control - do-work falls back to bash in fish" {
    cp ./do_work.bash "$TEST_DIRECTORY/do_work.bash"

    run bash -c '
        message() { :; }
        log_warn() { :; }

        source ./do_work.bash
        SHELL=/usr/bin/fish
        export SHELL
        JOB_FILE="$TEST_DIRECTORY/current_job.txt"
        export JOB_FILE
        bash() {
            printf "bash prompt:%s\\n" "$PS1"
            return 0
        }

        run_dev_shell "$TEST_DIRECTORY"
    '

    assert_success
    assert_output --partial "bash prompt:CONTROL DEV SHELL -> "
}


@test "control - do-work uses the dev prompt in bash" {
    run bash -c '
        tmp_dir=$(mktemp -d)
        printf "%s\n" "PS1='\''CONTROL DEV SHELL -> '\''" > "$tmp_dir/.bashrc"
        HOME="$tmp_dir" bash -ic "printf '%s\\n' \"\$PS1\""
        rm -rf "$tmp_dir"
    '

    assert_success
    assert_output --partial "CONTROL DEV SHELL -> "
}


@test "control - command do-work" {
    skip
    run bash -c '
	  cd "$TEST_DIRECTORY"
	  ./control 
    '

    assert_success
}


@test "control - command local, missing .config.projects file" {
	cp -f ./local_check.bash  "$TEST_DIRECTORY/local_check.bash"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control local
	'

	assert_success
	assert_output --partial "[WARN]  Missing .config.projects file"
}


@test "control - command local, git not initialized" {
	cp -f ./local_check.bash  "$TEST_DIRECTORY/local_check.bash"
	echo  "$TEST_DIRECTORY/projects/" > "$TEST_DIRECTORY/.config.projects"
	mkdir "$TEST_DIRECTORY/projects/" 
	mkdir "$TEST_DIRECTORY/projects/nodejs" 

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control local
	'

	assert_success
	assert_output --partial "Git not initialized!"
}


@test "control - command estimate, misspell" {
	cp -f ./control_estimate.bash "$TEST_DIRECTORY/control_estimate.bash"

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control estimate --delete
	'

	assert_failure
	assert_output --partial "Bad argument"
}


@test "control - command estimate, with details" {
	cp -f ./control_estimate.bash "$TEST_DIRECTORY/control_estimate.bash"

	rm -rf /tmp/control/

	cat > "$TEST_DIRECTORY/.history" << 'EOF'
	project:  esbuild-plugin-cpp
	issue:    2
	start:    17.06.2025
	end:      21.06.2025

EOF

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control estimate -d
	'

	assert_success
	assert_output "21.06.2025 4 days"
}


@test "control - command estimate, default behavior" {
	cp -f ./control_estimate.bash "$TEST_DIRECTORY/control_estimate.bash"

	rm -rf /tmp/control/

	cat > "$TEST_DIRECTORY/.history" << 'EOF'
	project:  esbuild-plugin-cpp
	issue:    2
	start:    17.06.2025
	end:      21.06.2025

EOF

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control estimate
	'

	assert_success
	assert_output "1 job  21.06.2025 4 days"
}


@test "control - command skip" {
	cp -f ./skip_work.bash "$TEST_DIRECTORY/skip_work.bash"

	cat > "$TEST_DIRECTORY/history.bash" << 'EOF'
	skip_job()
	{
		return 0
	}
EOF

	cat > "$TEST_DIRECTORY/current_job.bash" << 'EOF'
	control_dashboard_skip_current_job()
	{
		return 0
	}
EOF

	run bash -c '
		cd "$TEST_DIRECTORY"
		./control skip
	'

	assert_success
	assert_file_not_exists "$TEST_DIRECTORY/current_job.txt"
	assert_output "Job skip"
}

@test "control - command that not exist" {
    run bash -c '
	  cd "$TEST_DIRECTORY"
	  ./control blablabla
    '

    assert_success
    assert_output --partial "Command not correct!"
}
