function todo {
  # $1 - is empty or one of the flags:
  #      --read(-r) open file in less(default behavior)
  #      --add(-a)  open file in vi and go to last
  #                 line in insert mode
  #      --edit(-e) open file in vi
  local todo_file
  todo_file="$projectdir/todo.md"

  if [[ $1 = "--add" || $1 = "-a" ]]; then
    vim + +start "$todo_file"
    return
  fi

  if [[ ! -f $todo_file ]]; then
    message "You don't have ideas for projects\nIf you want save ideas for future, use command 'control todo -a'"
    return 0
  fi

  if [[ $1 = "--edit" || $1 = "-e" ]]; then
    vim "$todo_file"
    return
  fi

  less "$todo_file"
}
