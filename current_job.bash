function control_dashboard_mark_current_job () {
  local job_link
  job_link=$(tail -n1 "$projectdir/current_job.txt" | sed 's|/|\\/|g')
  sed -i "/$job_link/ s/./[ CURRENT JOB ] &/" "$dashboard_file"
}

function control_dashboard_remove_current_job () {
  sed -i '/^\[ CURRENT JOB \]/d' "$dashboard_file"
}

function control_dashboard_skip_current_job () {
  sed -i 's/^\[ CURRENT JOB \]/\[ SKIP JOB \]/g' "$dashboard_file"
}
