#!/usr/bin/env bash

PROJECT_DIR=$(dirname "$0")
FILE_HISTORY="$PROJECT_DIR/.history"

function start_job
{
  {
    echo "project: " "$1"
    echo "issue:   " "$2"
    echo "start:   $(date +'%d.%m.%Y')"
  } >>  "$FILE_HISTORY"
}

function end_job
{
	echo "end:     $(date +'%d.%m.%Y')" >> "$FILE_HISTORY"
  echo >> "$FILE_HISTORY"
}

function skip_job
{
	echo "skip:    $(date +'%d.%m.%Y')" >> "$FILE_HISTORY"
  echo >> "$FILE_HISTORY"
}

function clean
{
	rm -f "$FILE_HISTORY"
}

function control_history
{
	if [[ $1 = "clean" ]]; then
		clean
		return 0
	fi

	if [[ -e $FILE_HISTORY ]]; then
  		column --fillrows -c 150 "$FILE_HISTORY"
      return 0
	fi
	
	echo "History empty"
  return 0
}
