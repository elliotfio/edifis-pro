# EDIFIS

## Description du projet

EDIFIS est une solution complète de gestion pour les entreprises du BTP, conçue pour simplifier et optimiser tous les aspects de la gestion de chantiers. Notre plateforme permet aux artisans, chefs de chantier et personnel administratif de collaborer efficacement sur un même outil.


### Public cible

- **Artisans** : Suivi des interventions, rapports de chantier, gestion du temps
- **Chefs de chantier** : Planification, attribution des tâches, suivi d'avancement
- **Personnel administratif** : Facturation, gestion des clients, reporting
- **Direction** : Vue d'ensemble, KPIs, analyse de rentabilité

## Sommaire
1. [Initialisation](#initialisation)
2. [Arborescence](#arborescence)
3. [Démarrage](#démarrage)
   - [Prérequis](#prérequis)
   - [Création de la base de données](#création-de-la-base-de-données)
   - [Configuration de la base de données](#configuration-de-la-base-de-données)
   - [Installation des dépendances](#installation-des-dépendances)
   - [Lancement des services](#lancement-des-services)
   - [Vérification des tests](#vérification-des-tests)
4. [Utilisation](#utilisation)

## Initialisation

Pour initialiser le projet EDIFIS sur votre machine locale :

```bash
# Cloner le dépôt
git clone https://github.com/elliotfio/edifis-pro.git

# Accéder au répertoire du projet
cd edifis-pro
```

## Arborescence

```
edifis/
├── frontend/             # Application côté client React
│   ├── public/           # Fichiers statiques
│   ├── src/              # Code source React
│   │   ├── api/          # Logique API et requêtes
│   │   ├── assets/       # Ressources statiques
│   │   ├── components/   # Composants réutilisables
│   │   ├── configs/      # Fichiers de configuration
│   │   ├── features/     # Fonctionnalités principales
│   │   ├── lib/          # Utilitaires et helpers
│   │   ├── routes/       # Configuration des routes
│   │   ├── stores/       # Gestion de l'état (Zustand)
│   │   ├── types/        # Types TypeScript
│   │   └── validators/   # Validation des formulaires
│   ├── package.json      # Dépendances frontend
│   └── ...
├── backend/              # Serveur API
│   ├── controllers/      # Contrôleurs
│   ├── models/           # Modèles de données
│   ├── routes/           # Routes API
│   ├── config/           # Configuration
│   ├── tests/            # Tests unitaires et d'intégration
│   ├── package.json      # Dépendances backend
│   └── ...
├── edifis_pro.sql        # Script SQL pour initialiser la base de données
└── README.md             # Ce fichier
```

## Démarrage

### Prérequis
- Node.js version >= 14.x
- npm version >= 6.x
- MySQL Server

### Création de la base de données

Avant de configurer l'application, vous devez créer et initialiser la base de données :

```bash
# Créer un utilisateur et une base de données dans MySQL
mysql -u root -p
```

Dans la console MySQL, exécutez :
```sql
CREATE USER 'hackathon'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
CREATE DATABASE edifis;
GRANT ALL PRIVILEGES ON edifis.* TO 'hackathon'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Ensuite, importez le schéma de la base de données :
```bash
# Importer le schéma de la base de données
mysql -u hackathon -p edifis < chemin/vers/edifis_pro.sql
# Par exemple:
mysql -u hackathon -p edifis < C:\chemin\vers\edifis-pro\edifis_pro.sql
```

### Configuration de la base de données

```bash
# Configurer la base de données
cd backend
cp .env.example .env
# Modifier le fichier .env avec vos paramètres de connexion à la base de données
```

Assurez-vous que les paramètres dans le fichier `.env` correspondent à ceux que vous avez utilisés lors de la création de la base de données.

### Installation des dépendances

```bash
# Installation des dépendances backend
cd backend
npm install

# Installation des dépendances frontend
cd ../frontend
npm install
```

### Lancement des services

```bash
# Démarrer le serveur backend (depuis le dossier backend)
npm run start
# Le serveur backend sera accessible sur http://localhost:3000

# Démarrer l'application frontend (depuis le dossier frontend)
npm run dev
# L'application frontend sera accessible sur http://localhost:5173
```

### Vérification des tests

```bash
# Exécuter les tests backend
cd backend
npm run test
```

## Utilisation

### Connexion utilisateur

1. Accédez à l'application via `http://localhost:5173`
2. Cliquez sur "Se connecter" dans le menu principal
3. Utilisez les identifiants suivants pour vous connecter :
   - Utilisateur artisan : `thierry.paveur@edifis.fr` / `paveur.thierry`
   - Utilisateur chef de chantier : `sophie.martin@edifis.fr` / `martin.sophie`
   - Utilisateur employé administratif : `eva.durand@edifis.fr` / `durant.eva`
   - Administrateur : `admin@edifis.fr` / `system.admin`

Pour créer un nouveau compte utilisateur, cliquez sur "S'inscrire" et suivez les instructions à l'écran.

### Fonctionnalités principales

#### Interface utilisateur
- 🎨 Interface utilisateur responsive et moderne avec TailwindCSS
- ✨ Composants UI réutilisables avec animations fluides
- 📱 Adaptation complète aux appareils mobiles, tablettes et ordinateurs

#### Architecture technique
- 🔐 Système d'authentification complet avec gestion des rôles et permissions
- 🛣️ Routage avancé avec routes protégées selon les profils utilisateurs
- 📡 Communication API optimisée avec React Query (mise en cache, revalidation)
- 🔄 Gestion d'état global efficace avec Zustand
- 🧪 Tests automatisés pour garantir la fiabilité du code

#### Fonctionnalités métier
- 📋 Gestion complète des chantiers (création, suivi, clôture)
- 👷 Administration des équipes et attribution des ressources
- 📊 Tableaux de bord personnalisés selon les profils utilisateurs
- 📝 Suivi des tâches et des interventions en temps réel
- 📅 Planification des interventions avec calendrier interactif
- 💰 Suivi budgétaire et facturation
- 📈 Rapports et statistiques détaillés

#### Sécurité et conformité
- 🔒 Protection des données sensibles (RGPD)
- 🛡️ Authentification sécurisée avec JWT

---