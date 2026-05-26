#!/usr/bin/env pwsh
Write-Host "Déploiement GitHub Pages - script d'aide"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git n'est pas installé ou non disponible dans le PATH"
  exit 1
}

# Ajoute tous les fichiers, commit et push la branche main
git add -A
$msg = Read-Host "Message de commit (laisser vide pour message par défaut)"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "chore: update site / add deployment files" }
git commit -m $msg
git push origin main

Write-Host "Push terminé. Maintenant active GitHub Pages dans Settings → Pages (branch main, root)."
