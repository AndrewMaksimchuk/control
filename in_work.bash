#!/usr/bin/env bash

function inwork {
  if [[ ! -f $JOB_FILE ]]; then
    message "You don\`t have current job"
    [[ $1 = "-e" ]] && EXIT_SUCCESS
    towork
    return
  fi

  # Update current issue
  if [[ $1 = '--update' || $1 = '-u' ]]; then
    local config_content current_repo current_issue
    config_content=$(cat "$CONFIG")
    current_repo=$(echo "$config_content" | head -1)
    current_issue=$(echo "$config_content" | tail -1)
    message "Updating current issue..."
    towork "$current_repo" "$current_issue"
    return
  fi

  cat "$JOB_FILE"
}
