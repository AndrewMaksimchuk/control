function EXIT_SUCCESS {
  exit 0
}

function EXIT_FAILURE {
  exit 1
}

function EXIT_PREVIOUS_COMMAND_CODE {
  # combination of Special Parameters and Parameter Expansion
  # ${VARIABLE:-DEFAULT_VALUE}
  exit "${1:-$?}"
}
