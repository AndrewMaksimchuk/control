# Control your projects

Control github projects  
show open issues and track current job

Support bash, zsh complition

#### Commands

without - show dashboard for today  
`update` - show dashboard(fetch new data)  
`in-work` - get current project and issue in work  
`to-work` - set current project and issue in work  
`done` - set current project and issue is done  
`todo` - save or edit ideas for projects  
`history` - show available hisroty of jobs  
`do-work` - open editor with project of current issues  
`local` - show git status of local projects  
`estimate`- show spended time on jobs
`skip` - skip current job

#### Commands shor versions

`in-work` -> `in`
`to-work` -> `to`
`do-work` -> `do`
`update` -> `u`

#### Files

`dashboard.txt` - all repositories with open issues  
`current_job.txt` - repository and issues working on  
`.history` - all jobs
`.estimate` - summary of spending time for jobs

#### Editor

In command `do-work`, first editor is `vscode`  
and if no find, then use `vi`

#### Require

- node.js

#### Install

Run command `sudo ./install.bash` in terminal  
from this folder

## Dev note

https://unix.stackexchange.com/questions/239528/dynamic-zsh-autocomplete-for-custom-commands#240192
man zshcomplsys \_arguments
man zshcomplsys \_values
man zshcomplsys \_describe
https://unix.stackexchange.com/questions/140602/how-do-i-start-all-shell-sessions-in-a-directory-other-than-home
