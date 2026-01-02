# Script d'installation automatique pour le projet Vertyno
# PowerShell Script pour installer toutes les dépendances

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation du Projet Vertyno" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Node.js est installé
Write-Host "Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✓ Node.js installé : $nodeVersion" -ForegroundColor Green
    Write-Host "✓ npm installé : $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Node.js n'est pas installé !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez installer Node.js depuis : https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Choisissez la version LTS (Long Term Support)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Après l'installation :" -ForegroundColor Yellow
    Write-Host "1. Redémarrez votre terminal" -ForegroundColor Yellow
    Write-Host "2. Relancez ce script" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Étape 1 : Installer les dépendances du projet principal
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Étape 1/2 : Installation des dépendances principales..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Dépendances principales installées avec succès !" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Erreur lors de l'installation des dépendances principales" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ Erreur : $_" -ForegroundColor Red
    exit 1
}

# Étape 2 : Installer les dépendances des Firebase Functions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Étape 2/2 : Installation des dépendances Firebase Functions..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "functions") {
    Push-Location functions
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Dépendances Firebase Functions installées avec succès !" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "✗ Erreur lors de l'installation des dépendances Firebase Functions" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "✗ Erreur : $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} else {
    Write-Host "⚠ Dossier 'functions' non trouvé, étape ignorée" -ForegroundColor Yellow
    Write-Host ""
}

# Vérifier si le fichier .env existe
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vérification de la configuration..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
    Write-Host "⚠ Fichier .env non trouvé !" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Créez un fichier .env à la racine du projet avec :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "REACT_APP_FIREBASE_API_KEY=your-api-key-here" -ForegroundColor Gray
    Write-Host "REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com" -ForegroundColor Gray
    Write-Host "REACT_APP_FIREBASE_PROJECT_ID=your-project-id" -ForegroundColor Gray
    Write-Host "REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com" -ForegroundColor Gray
    Write-Host "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id" -ForegroundColor Gray
    Write-Host "REACT_APP_FIREBASE_APP_ID=your-app-id" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Consultez INSTALLATION.md pour plus de détails" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✓ Fichier .env trouvé" -ForegroundColor Green
    Write-Host ""
}

# Résumé final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour lancer l'application :" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Pour plus d'informations, consultez INSTALLATION.md" -ForegroundColor Yellow
Write-Host ""



