#Resumed list of what changed
[String]$output = git status --porcelain

if ('' -ne $output) {
  Write-Warning "There are uncommited changes to your code, please revise the changes before commiting"
  $diffArray = git diff
  $diff = [system.String]::Join("`n", $diffArray)
  Write-Error $diff
}
else {
  Write-Information "All changes were commited."
}
