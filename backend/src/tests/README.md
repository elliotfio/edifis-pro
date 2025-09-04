# Migration des Tests

## ⚠️ Tests obsolètes

Les fichiers de tests suivants utilisent l'ancienne architecture et doivent être mis à jour ou remplacés :

- `artisans.test.js` - Tests des routes artisans (obsolète)
- `auth.test.js` - Tests des routes auth (obsolète)  
- `chefs.test.js` - Tests des routes chefs (obsolète)
- `users.test.js` - Tests des routes users (obsolète)
- `worksites.test.js` - Tests des routes worksites (obsolète)

## ✅ Nouveaux tests

Les nouveaux tests suivent l'architecture en couches :

### Tests des Contrôleurs
- `controllers/authController.test.js` - Tests du contrôleur d'authentification
- `controllers/userController.test.js` - Tests du contrôleur utilisateur
- `controllers/artisanController.test.js` - Tests du contrôleur artisan
- `controllers/worksiteController.test.js` - Tests du contrôleur chantier

### Tests des Services
- `services/authService.test.js` - Tests du service d'authentification
- `services/userService.test.js` - Tests du service utilisateur
- `services/artisanService.test.js` - Tests du service artisan
- `services/worksiteService.test.js` - Tests du service chantier

### Tests des Modèles
- `models/User.test.js` - Tests du modèle User
- `models/Artisan.test.js` - Tests du modèle Artisan
- `models/Chef.test.js` - Tests du modèle Chef
- `models/Worksite.test.js` - Tests du modèle Worksite

## Comment exécuter les tests

### Tous les tests
```bash
npm test
```

### Tests par couche
```bash
npm test -- --testPathPattern=controllers
npm test -- --testPathPattern=services
npm test -- --testPathPattern=models
```

### Test spécifique
```bash
npm test -- authService.test.js
```

## Migration des anciens tests

Pour migrer un ancien test :

1. **Identifier la couche testée** :
   - Si ça teste les routes HTTP → Contrôleur
   - Si ça teste la logique métier → Service
   - Si ça teste l'accès aux données → Modèle

2. **Créer le nouveau fichier de test** dans le bon dossier

3. **Adapter les mocks** :
   - Contrôleurs : mock des services
   - Services : mock des modèles
   - Modèles : mock de la base de données

4. **Mettre à jour les imports** pour utiliser la nouvelle structure

## Exemple de migration

### Ancien test (route)
```javascript
// Ancien - teste directement la route
const artisansRouter = require('../routes/artisans');
app.use('/api/artisans', artisansRouter);

it('should create artisan', async () => {
  const response = await request(app)
    .post('/api/artisans')
    .send(artisanData);
  // ...
});
```

### Nouveau test (contrôleur)
```javascript
// Nouveau - teste le contrôleur avec service mocké
const { ArtisanController } = require('../../controllers');
const { ArtisanService } = require('../../services');
jest.mock('../../services');

it('should create artisan', async () => {
  ArtisanService.createArtisan.mockResolvedValue(mockResult);
  
  const response = await request(app)
    .post('/artisans')
    .send(artisanData);
  // ...
});
```

## Suppression des anciens tests

Une fois que les nouveaux tests couvrent toutes les fonctionnalités, les anciens fichiers peuvent être supprimés :

```bash
rm src/tests/artisans.test.js
rm src/tests/auth.test.js
rm src/tests/chefs.test.js
rm src/tests/users.test.js
rm src/tests/worksites.test.js
```
