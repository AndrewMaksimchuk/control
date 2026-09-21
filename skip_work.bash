function skip_work () {
  rm -f "$projectdir/current_job.txt"
  skip_job
  control_dashboard_skip_current_job
  message "Job skip"
}
