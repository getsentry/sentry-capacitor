#Resumed list of what changed
$output = git status --porcelain

if ($null -ne $output) {
  Write-Warning "There are uncommited changes to your code, please revise the changes before commiting"
  $diffArray = git diff
  $diff = [system.String]::Join("`n", $diffArray)
  Write-Error $diff
}
else {
  Write-Information "All changes were commited."
}
