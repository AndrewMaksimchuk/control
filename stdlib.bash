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

COLOR_RESET="\033[0m"
COLOR_INFO="\033[1;34m"    # Bold Blue
COLOR_WARN="\033[1;33m"    # Bold Yellow
COLOR_ERROR="\033[1;31m"   # Bold Red

function log_info ()
{
  echo -e "${COLOR_INFO}[INFO]  $*${COLOR_RESET}";
}

function log_warn ()
{
  echo -e "${COLOR_WARN}[WARN]  $*${COLOR_RESET}" >&2;
}

function log_error ()
{
  echo -e "${COLOR_ERROR}[ERROR]  $*${COLOR_RESET}" >&2;
}

function message ()
{
  echo -e "$*"
}

