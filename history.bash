#!/usr/bin/env bash

PROJECT_DIR=$(dirname $0)
FILE_HISTORY=$(echo "$PROJECT_DIR/.history")

function start_job
{
	echo "project: " $1 >> $FILE_HISTORY		
	echo "issue:   " $2 >> $FILE_HISTORY
	echo "start:   " $(date +"%d.%m.%Y") >> $FILE_HISTORY
}

function end_job
{
	echo "end:     " $(date +"%d.%m.%Y") >> $FILE_HISTORY
}

function skip_job
{
	echo "skip:    " $(date +"%d.%m.%Y") >> $FILE_HISTORY
}

function clean
{
	rm -f $FILE_HISTORY
}

function history
{
	if [[ $1 = "clean" ]]; then
		clean
		exit
	fi

	if [[ -e $FILE_HISTORY ]]; then
  		column --fillrows $FILE_HISTORY
		exit
	fi
	
	echo "History empty"
}
