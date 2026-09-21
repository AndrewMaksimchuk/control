function dowork {
	if [[ ! -e $config_projects ]]; then
		log_warn 'You need set path to all your projects'
		read -r -p "Please, enter absolute path to your projects directory: " path_to_projects

		if [[ ! -d $path_to_projects ]]; then
			log_warn 'Bad path, please try again'
			return 0
		fi

		echo -n "$path_to_projects" > "$config_projects"
	fi

	if [[ -n $1 ]]; then
		if [[ ! -d $1 ]]; then
			log_warn 'Bad path, please try again'
			return 0
		fi

		echo -n "$1" > "$config_projects"
		return 0
	fi

	local url path_to_projects current_project_dir
	url=$(sed -n '2p' "$JOB_FILE" | cut -d'/' -f4-)
	path_to_projects=$(head -n1 "$config_projects")
	current_project_dir=$(
		find "$path_to_projects"  -maxdepth 3 -type f -name config -print0 \
		| xargs -0 grep -l -- "$url" \
		| cut -f1 -d'.'
	)

	message "[ OPEN EDITOR ] in $current_project_dir"
	echo

	if [[ -n $(command -v "$VISUAL") ]]; then
		$VISUAL "$current_project_dir"
	elif [[ -n $(command -v code) ]]; then
		# code - is a vscode editor
		code "$current_project_dir" 2>/dev/null
	else
		vim "$current_project_dir"
	fi



	$SHELL -c "
		cd \"$current_project_dir\" || {
			printf 'Failed to cd to: %s\n' \"$current_project_dir\" >&2
			exit 1
		}

		cat \"$JOB_FILE\"
		echo 
		echo '[ GIT STATUS ]'
		git status
		exec \"${SHELL:-sh}\"
	"
}
