#!/usr/bin/env bash

cwd=$(dirname $0)
path=$(readlink -f $cwd)

function addpath() {
  user=$(who -s | head -1 | awk '{print $1}')
  config=$(echo "/home/$user/$1")

  [[ ! -e $config ]] && return 0

  is_set_env=$(cat $config | grep "CONTROL_INSTALL")
  [[ -n $is_set_env ]] && return 0

  echo >>$config
  echo "export CONTROL_INSTALL=\"$path\"" >>$config
  echo 'export PATH="$PATH:$CONTROL_INSTALL"' >>$config
}

function addcompletion() {
    cp -f $cwd/_control_completion /etc/bash_completion.d/

    if [[ -d /usr/share/zsh/vendor-completions/ ]]; then
        cp -f $cwd/_control /usr/share/zsh/vendor-completions/
    fi

    # if [[ -d /usr/share/fish/vendor_completions.d/ ]]; then
    #     cp -f $cwd/control.fish /usr/share/fish/vendor_completions.d/
    # fi
}

addpath ".bashrc"
addpath ".zshrc"
# addpath ".config/fish/config.fish"

addcompletion

execfiles=$(echo $cwd/*.bash $cwd/*.mjs)
chmod +x $execfiles

npm ci
