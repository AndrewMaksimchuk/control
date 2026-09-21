function donework {
  if [[ ! -f $JOB_FILE ]]; then
    log_info "You don\`t have current job"
    return 0
  fi

  local config_content current_repo current_issue
  config_content=$(cat "$CONFIG")
  current_repo=$(echo "$config_content" | head -1)
  current_issue=$(echo "$config_content" | tail -1)

  if ! node "$projectdir/done-work.mjs" "$current_repo" "$current_issue"; then
    log_error "Can't close the issue"
    return 1
  fi

  rm -f "$projectdir/current_job.txt"
  end_job
  control_dashboard_remove_current_job
  message "Job done"
}
