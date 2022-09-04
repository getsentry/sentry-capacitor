ls
#Resumed list of what changed
[String]$output = git status --porcelain

if ($output) {
  git --no-pager diff
  Write-Error "There are uncommited changes to your code, please revise the changes before commiting `n {$output}"
}
else {
  Write-Host "All changes were commited."
}
