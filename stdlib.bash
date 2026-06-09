function EXIT_SUCCESS ()
{
  exit 0
}

function EXIT_FAILURE ()
{
  exit 1
}

function EXIT_PREVIOUS_COMMAND_CODE ()
{
  # combination of Special Parameters and Parameter Expansion
  # ${VARIABLE:-DEFAULT_VALUE}
  exit "${1:-$?}"
}

function is_numeric ()
{
  [[ $1 =~ ^[0-9]+$ ]]
}

function is_alphanumeric ()
{
  [[ $1 =~ ^[A-Za-z0-9]+$ ]]
}

function is_alphanumeric_dash_underscore ()
{
  [[ $1 =~ ^[A-Za-z0-9_-]+$ ]]
}

