#!/usr/bin/env bash

function towork_validation() {
	local returned_value

	is_alphanumeric_dash_underscore "$1"
	returned_value=$?

	if [[ "$returned_value" -eq 1 ]]; then
		log_warn "Not valid repository name"
		return 1
	fi

	is_numeric "$2"
	returned_value=$?

	if [[ "$returned_value" -eq 1 ]]; then
		log_warn "Not valid issue number"
		return 1
	fi

	return 0
}

function towork() {
	# $1 - repository name
	# $2 - issue number(hash)
	if [[ (-n $1) && (-n $2) ]]; then
		if ! towork_validation "$1" "$2"; then
			return 1
		fi

		echo "$1" > "$CONFIG"
		echo "$2" >> "$CONFIG"
		start_job "$1" "$2"
		node "$projectdir/to-work.mjs" "$1" "$2"
		echo -en "\033[1K" # clear line
		echo -en "\033[G"  # move cursor to 1 column
		cat "$projectdir/current_job.txt"
		control_dashboard_mark_current_job
		return 0
	fi

	local prompt
	prompt="Enter a repo name and issue number(hash) "
	read -r -p "$prompt" repo iss

	if ! towork_validation "$repo" "$iss"; then
		return 1
	fi

	echo "$repo" > "$CONFIG"
	echo "$iss" >> "$CONFIG"
	start_job "$repo" "$iss"
	node "$projectdir/to-work.mjs" "$repo" "$iss"
	cat "$projectdir/current_job.txt"
	control_dashboard_mark_current_job
}
