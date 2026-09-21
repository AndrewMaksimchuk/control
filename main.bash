#!/usr/bin/env bash

function main {
	if [[ ! -e "$dashboard_file" ]]; then
		update
		return 0
	fi

	dashboard_stat=$(stat -c %w "$dashboard_file")
	dashboard_day=${dashboard_stat#*-*-}
	dashboard_day=${dashboard_day%% *}

	local current_day
	current_day=$(date +"%d")

	if [[ $dashboard_day = "$current_day" ]]; then
		cat "$dashboard_file"
		message "This is today dashboard\nFor update dashboard, run command 'control update'"
		return 0
	fi

	update
}
