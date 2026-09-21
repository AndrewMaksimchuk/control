run_dev_shell() {
	local current_project_dir="$1"
	local shell_name="${SHELL:-sh}"
	local temp_dir

	shell_name="${shell_name##*/}"

	case "$shell_name" in
		fish)
			(
				cd "$current_project_dir" || exit 1
				cat "$JOB_FILE"
				echo
				echo '[ GIT STATUS ]'
				git status
				PS1='CONTROL DEV SHELL -> '
				export PS1
				bash -i
			)
			;;
		zsh)
			temp_dir=$(mktemp -d)
			cat > "$temp_dir/.zshrc" <<'EOF'
PROMPT='CONTROL DEV SHELL -> '
RPROMPT=''
precmd() {
  PROMPT='CONTROL DEV SHELL -> '
  RPROMPT=''
}
EOF

			(
				cd "$current_project_dir" || exit 1
				cat "$JOB_FILE"
				echo
				echo '[ GIT STATUS ]'
				git status
				ZDOTDIR="$temp_dir" zsh -i
			)

			rm -rf "$temp_dir"
			;;
		bash)
			temp_dir=$(mktemp -d)
			cat > "$temp_dir/.bashrc" <<'EOF'
PS1='CONTROL DEV SHELL -> '
EOF

			(
				cd "$current_project_dir" || exit 1
				cat "$JOB_FILE"
				echo
				echo '[ GIT STATUS ]'
				git status
				HOME="$temp_dir" bash -i
			)

			rm -rf "$temp_dir"
			;;
		*)
			(
				cd "$current_project_dir" || exit 1
				cat "$JOB_FILE"
				echo
				echo '[ GIT STATUS ]'
				git status
				PS1='CONTROL DEV SHELL -> '
				export PS1
				"${SHELL:-sh}" -i
			)
			;;
	esac
}


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

	run_dev_shell "$current_project_dir"
}
