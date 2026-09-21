function control_estimate {
  # $1 - optional parameter empty or "-d"
  # if present "-d" - show detail list of jobs

  local file_estimate
  file_estimate=$projectdir/.estimate
  rm -f "$file_estimate"

  mkdir -p /tmp/control/
  split -l 5 "$projectdir/.history" /tmp/control/

  for control_history_file in /tmp/control/*; do
    local file_length
    file_length=$(wc -l "$control_history_file" | cut -d' ' -f1)

    if [[ $file_length -lt 5 ]]; then
      rm "$control_history_file"
      continue
    fi

    local date_end date_start
    date_end=$(sed -n '4p' "$control_history_file" | rev | cut -d' ' -f1 | rev)
    date_start=$(sed -n '3p' "$control_history_file" | rev | cut -d' ' -f1 | rev)

    if [[ $date_end = "$date_start" ]]; then
      echo "$date_end" '1 day' >> "$file_estimate"
      continue
    fi

    local date_month_end date_month_start
    date_month_end=${date_end#*.}
    date_month_end=${date_month_end%%.*}
    date_month_start=${date_start#*.}
    date_month_start=${date_month_start%%.*}

    if [[ $date_month_end = "$date_month_start" ]]; then
      local date_day_end date_day_start
      date_day_end=${date_end%%.*}
      date_day_start=${date_start%%.*}
      echo "$date_end" $((10#$date_day_end - 10#$date_day_start)) 'days' >> "$file_estimate"
      continue
    else
      echo "$date_end" 'Have months for job done, too long' >> "$file_estimate"
      continue
    fi
  done

  if [[ $1 = '-d' ]]; then
    cat "$file_estimate"
    return
  fi

  uniq -c "$file_estimate" | awk '{if ($1 == "1") {printf $1 " job  "} else {printf $1 " jobs "}; for (i=2; i<NF; i++) printf $i " "; print $NF}'
}
