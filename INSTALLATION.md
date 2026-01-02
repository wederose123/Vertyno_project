# Guide d'Installation - Projet Vertyno

Ce guide vous aidera à initialiser complètement le projet avec tous les frameworks, APIs et dépendances npm.

## Prérequis

### 1. Installer Node.js et npm

**Windows :**
- Téléchargez Node.js depuis [https://nodejs.org/](https://nodejs.org/)
- Choisissez la version LTS (Long Term Support)
- Installez le fichier `.msi` téléchargé
- Redémarrez votre terminal après l'installation

**Vérification :**
```bash
node --version
npm --version
```

Vous devriez voir des numéros de version (ex: v20.x.x et 10.x.x)

### 2. Installer Firebase CLI (optionnel, pour le déploiement)

```bash
npm install -g firebase-tools
```

## Installation du Projet

### Étape 1 : Installer les dépendances du projet principal

Dans le répertoire racine du projet :

```bash
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json` :
- React 19.1.0
- React Router DOM 7.6.2
- Firebase 12.0.0
- Material-UI 7.1.1
- Axios 1.11.0
- Et toutes les autres dépendances...

### Étape 2 : Installer les dépendances des Firebase Functions

Dans le dossier `functions/` :

```bash
cd functions
npm install
cd ..
```

Cette commande installera les dépendances pour les Firebase Functions :
- firebase-admin
- firebase-functions
- stripe
- sib-api-v3-sdk (Brevo/Sendinblue)
- axios

### Étape 3 : Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Configuration Firebase
# Récupérez ces valeurs depuis votre console Firebase : https://console.firebase.google.com/
# Projet > Paramètres du projet > Vos applications > Config

REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

**Important :** Remplacez les valeurs `your-xxx-here` par vos vraies valeurs Firebase.

### Étape 4 : Configuration des secrets Firebase Functions

Les Firebase Functions utilisent des secrets pour les clés API sensibles. Configurez-les avec :

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set SITE_URL
firebase functions:secrets:set BREVO_API_KEY
firebase functions:secrets:set BOXTAL_ACCESS_KEY
firebase functions:secrets:set BOXTAL_SECRET_KEY
firebase functions:secrets:set BOXTAL_API_BASE_URL
firebase functions:secrets:set BOXTAL_MAP_ACCESS_KEY
firebase functions:secrets:set BOXTAL_MAP_SECRET_KEY
```

Chaque commande vous demandera de saisir la valeur du secret.

## Scripts Disponibles

### Projet Principal

- `npm start` - Lance l'application en mode développement (http://localhost:3000)
- `npm run build` - Compile l'application pour la production
- `npm test` - Lance les tests
- `npm run eject` - Éjecte Create React App (irréversible)

### Firebase Functions

Dans le dossier `functions/` :

- `npm run serve` - Lance les émulateurs Firebase en local
- `npm run deploy` - Déploie les fonctions sur Firebase
- `npm run logs` - Affiche les logs des fonctions

## Structure du Projet

```
mon-site/
├── src/                    # Code source React
│   ├── Composants/        # Composants réutilisables
│   ├── Pages/             # Pages de l'application
│   ├── Firebase/          # Configuration Firebase
│   └── ...
├── functions/              # Firebase Functions (backend)
│   ├── index.js           # Code des fonctions
│   └── package.json       # Dépendances des fonctions
├── public/                 # Fichiers statiques
├── build/                  # Build de production (généré)
├── package.json            # Dépendances du projet principal
├── firebase.json           # Configuration Firebase
└── .env                    # Variables d'environnement (à créer)
```

## Technologies Utilisées

### Frontend
- **React 19.1.0** - Framework JavaScript
- **React Router DOM 7.6.2** - Routage
- **Material-UI 7.1.1** - Composants UI
- **Styled Components 6.1.19** - Styles CSS-in-JS
- **Firebase 12.0.0** - Backend as a Service

### Backend (Firebase Functions)
- **Firebase Functions v7** - Serverless functions
- **Stripe** - Paiements
- **Brevo (Sendinblue)** - Emails transactionnels
- **Boxtal** - Gestion de livraison
- **Axios** - Requêtes HTTP

## Dépannage

### Erreur "npm n'est pas reconnu"
- Vérifiez que Node.js est bien installé : `node --version`
- Redémarrez votre terminal après l'installation de Node.js
- Vérifiez que Node.js est dans votre PATH

### Erreur lors de `npm install`
- Supprimez le dossier `node_modules` et le fichier `package-lock.json`
- Relancez `npm install`
- Vérifiez votre connexion internet

### Erreur Firebase
- Vérifiez que votre fichier `.env` est correctement configuré
- Vérifiez que vous êtes connecté à Firebase : `firebase login`

## Support

Pour toute question ou problème, consultez :
- [Documentation React](https://react.dev/)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Stripe](https://stripe.com/docs)



