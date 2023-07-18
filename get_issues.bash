#!/usr/bin/env bash

link="$1"

if [[ -z $1 ]]; then
    echo "Put repository URL"
    exit
fi

if [[ -z $(echo "$1" | grep -e "^https://github.com") ]]; then
    echo "Put valid URL"
    exit
fi

lynx \
    -accept_all_cookies \
    -dump \
    "$link" \
    > "issues"

line_start=$(
    cat issues \
    | grep -n "^Issues list" \
    | cut -d: -f1
)

line_end=$(
    cat issues \
    | grep -n "^Footer$" \
    | cut -d: -f1
)

issues_list=$(
    cat issues \
    | sed ''"$line_start"','"$line_end"'!d'
)

echo "$issues_list"

# issues_item=$(
#     echo "$issues_list" \
#     | grep -B1 -E '^\s+#[0-9]*\sopened' 
#     # | grep -B 1 -E '^\s+#.+' 
#     # | sed ''"$line_start"','"$line_end"'!d'
#     # | awk '{print $1}'
# )
# echo "$issues_item"

# issues_header=$(
#     echo "$issues_list" \
#     | grep -E '^\s+\[[0-9]*\].[a-zA-Z]' \
#     | head -n -1 \
#     | cut -d] -f2
# )

# issues_number_hash=$(
#     echo "$issues_list" \
#     | grep -E '^\s+#[0-9]*' \
#     | awk '{print $1}'
# )

# issues_number=$(
#     echo "$issues_number_hash" \
#     | tr -d '#'
# )

# for num in $issues_number
# do
#     links+="$link/$num "
# done

# issues_link=$(echo $links | tr " " "\n")

# data=$(paste -d '|' \
#     <(echo "$issues_number_hash") \
#     <(echo "$issues_header") \
#     <(echo "$issues_link"))

# echo "$data" \
# | sort -n -k1.2 \
# | column -t -s '|' -T2 -N Hash,Title,Link
