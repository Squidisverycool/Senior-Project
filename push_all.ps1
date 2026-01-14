param (
    [string]$msg = "Update project"
)

Write-Host "▶ Git status"
git status

Write-Host "▶ Adding changes"
git add .

Write-Host "▶ Committing"
git commit -m "$msg"

Write-Host "▶ Pushing to GitHub (origin)"
git push origin main

Write-Host "▶ Pushing to Hugging Face (hf)"
git push hf main

Write-Host "✅ Push complete"
