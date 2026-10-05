$input = "protocol=https`nhost=github.com`n`n"
$cred = $input | git credential fill
$user = ($cred | Select-String '^username=(.*)$').Matches.Groups[1].Value
$pass = ($cred | Select-String '^password=(.*)$').Matches.Groups[1].Value
$pair = "$user`:$pass"
$tok = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$H = @{ Authorization = "Basic $tok"; Accept = "application/vnd.github+json" }
$r = Invoke-RestMethod -Uri 'https://api.github.com/repos/sal2nass/Sim_Center/pages/builds?per_page=2' -Headers $H
foreach ($x in $r) { Write-Output ($x.commit.Substring(0,7) + " " + $x.status + " " + $x.error.message) }
