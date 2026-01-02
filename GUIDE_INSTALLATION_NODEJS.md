# Guide d'Installation Node.js sur Windows

## Pourquoi cette erreur ?

L'erreur `npm : Le terme «npm» n'est pas reconnu` signifie que Node.js (qui inclut npm) n'est pas installé sur votre ordinateur Windows.

## Solution : Installer Node.js

### Étape 1 : Télécharger Node.js

1. Allez sur le site officiel : **https://nodejs.org/**
2. Vous verrez deux boutons :
   - **LTS** (Long Term Support) - Version recommandée ✅
   - **Current** (Version actuelle)
3. Cliquez sur le bouton **LTS** pour télécharger

### Étape 2 : Installer Node.js

1. Ouvrez le fichier `.msi` que vous venez de télécharger
2. Cliquez sur **"Suivant"** dans l'assistant d'installation
3. Acceptez les termes de licence
4. **IMPORTANT** : Laissez toutes les options cochées par défaut, notamment :
   - ✅ "Add to PATH" (ajouter au PATH)
   - ✅ "npm package manager"
   - ✅ "Automatically install the necessary tools"
5. Cliquez sur **"Installer"**
6. Attendez la fin de l'installation
7. Cliquez sur **"Terminer"**

### Étape 3 : Redémarrer le Terminal

**TRÈS IMPORTANT** : Après l'installation, vous DEVEZ :

1. **Fermer complètement** votre terminal PowerShell actuel
2. **Ouvrir un nouveau terminal PowerShell**
3. Ou redémarrer Cursor/VSCode si vous utilisez le terminal intégré

### Étape 4 : Vérifier l'Installation

Dans votre nouveau terminal, tapez :

```powershell
node --version
```

Vous devriez voir quelque chose comme : `v20.11.0` (le numéro peut varier)

Puis tapez :

```powershell
npm --version
```

Vous devriez voir quelque chose comme : `10.2.4` (le numéro peut varier)

### Étape 5 : Installer les Dépendances du Projet

Une fois Node.js installé, dans le dossier du projet, exécutez :

```powershell
# Installer les dépendances principales
npm install

# Installer les dépendances des Firebase Functions
cd functions
npm install
cd ..
```

### Étape 6 : Lancer l'Application

```powershell
npm start
```

L'application devrait s'ouvrir automatiquement dans votre navigateur sur `http://localhost:3000`

## Dépannage

### Si `npm` n'est toujours pas reconnu après l'installation :

1. **Vérifiez que vous avez bien redémarré le terminal**
2. **Vérifiez le PATH Windows** :
   - Appuyez sur `Windows + R`
   - Tapez `sysdm.cpl` et appuyez sur Entrée
   - Allez dans l'onglet "Avancé"
   - Cliquez sur "Variables d'environnement"
   - Dans "Variables système", cherchez "Path"
   - Vérifiez qu'il contient : `C:\Program Files\nodejs\`
   - Si ce n'est pas le cas, ajoutez-le

3. **Réinstallez Node.js** en cochant bien toutes les options

### Si vous avez des erreurs lors de `npm install` :

- Vérifiez votre connexion internet
- Essayez de supprimer le dossier `node_modules` et le fichier `package-lock.json`, puis relancez `npm install`
- Vérifiez que vous êtes dans le bon dossier (celui qui contient `package.json`)

## Besoin d'Aide ?

Si vous rencontrez toujours des problèmes :
1. Vérifiez que Node.js est bien installé : `node --version`
2. Vérifiez que npm est bien installé : `npm --version`
3. Assurez-vous d'avoir redémarré votre terminal après l'installation


