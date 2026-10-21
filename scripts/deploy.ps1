param([ValidateSet('deploy','rollback','status','tls')][string]$Action = 'deploy')
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$sshOptions = @('-p','5127','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=10','-i',"$env:USERPROFILE\.ssh\id_rsa_4096_c2670")
$scpOptions = @('-P','5127','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-i',"$env:USERPROFILE\.ssh\id_rsa_4096_c2670")
$target = 'b2670@112.167.19.32'
function Assert-Success { if ($LASTEXITCODE -ne 0) { throw "Command failed (exit $LASTEXITCODE)" } }
if ($Action -eq 'deploy') {
  node scripts/package-deploy.mjs
  Assert-Success
  $release = Get-Content .tmp/deploy/latest.json -Raw | ConvertFrom-Json
  ssh @sshOptions $target 'umask 077; mkdir -p ~/a2o/uploads'
  Assert-Success
  scp @scpOptions $release.archive "${target}:a2o/uploads/$($release.release).tar.gz"
  Assert-Success
  scp @scpOptions deploy/release.sh deploy/bootstrap.py deploy/npm-a2o.mjs "${target}:a2o/"
  Assert-Success
  ssh @sshOptions $target "bash ~/a2o/release.sh deploy $($release.release)"
  Assert-Success
} else {
  ssh @sshOptions $target "bash ~/a2o/release.sh $Action"
  Assert-Success
}
