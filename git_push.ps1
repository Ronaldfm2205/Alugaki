Set-Location 'c:\Users\ferna\OneDrive\Documentos\Site-alugaki'
Write-Host '--- git status ---'
git status --short --branch
Write-Host '--- git config ---'
git config user.name 'GitHub Copilot'
git config user.email 'copilot@github.local'
Write-Host '--- git add ---'
git add .
Write-Host '--- git commit ---'
git commit -m 'fix: auth flow and support login'
Write-Host '--- git push ---'
git push
Write-Host '--- done ---'
Remove-Item -Path 'c:\Users\ferna\OneDrive\Documentos\Site-alugaki\git_push.ps1' -Force
