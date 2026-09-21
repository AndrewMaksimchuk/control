
function local_check {
	if [[ ! -e  "$config_projects" ]]; then
		log_warn "Missing .config.projects file"
		return 0
	fi

	local path_to_projects projects_dirs
	path_to_projects=$(head -n1 "$config_projects")
	projects_dirs=$(find "$path_to_projects" -maxdepth 1 -mindepth 1 -type d -printf '%f\n')

  for dir in $projects_dirs; do
    echo -e "\033[1m$dir\033[0m => $path_to_projects/$dir"
    cd "$path_to_projects/$dir" || { log_error "Failure to change directory $path_to_projects/$dir"; EXIT_FAILURE; }

    if [[ -d ".git" ]]; then
      local git_status
      git_status=$(git status -s)

      if [[ -z $git_status  ]]; then
        echo -e '\033[1m[OK]\033[0m You are not doing anything here'
      else
        git status -s
      fi

      local origin_main_available
      origin_main_available=$(git branch -a | grep -c origin/main)

      if [[ $origin_main_available -gt 0 ]]; then
        local git_logs
        git_logs=$(git log origin/main..HEAD | git shortlog -s | cat)

        if [[ ! -z $git_logs ]]; then
          echo 'You have unpushed commits' 
          echo "$git_logs"
        fi
      fi
    else
      echo -e '\033[1m[BAD]\033[0m Git not initialized!'
    fi

    cd "$OLDPWD" || { log_error "Faile to change directory $OLDPWD"; EXIT_FAILURE; }
    echo
  done
}

