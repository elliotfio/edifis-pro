SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

--
-- Suppression des tables dans l'ordre (enfants d'abord)
--
DROP TABLE IF EXISTS `artisan`;
DROP TABLE IF EXISTS `chef`;
DROP TABLE IF EXISTS `employe`;
DROP TABLE IF EXISTS `worksites`;
DROP TABLE IF EXISTS `users`;

--
-- Structure de la table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `date_creation` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `worksites`
--

CREATE TABLE IF NOT EXISTS `worksites` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `status` varchar(50) NOT NULL,
  `coordinates` point NOT NULL,
  `cost` decimal(10,2) NOT NULL DEFAULT 0,
  `budget` decimal(10,2) NOT NULL,
  `specialities_needed` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `artisan`
--

CREATE TABLE IF NOT EXISTS `artisan` (
  `user_id` int NOT NULL,
  `specialites` text NOT NULL,
  `disponible` boolean NOT NULL DEFAULT true,
  `note_moyenne` float DEFAULT NULL,
  `current_worksite` varchar(50) DEFAULT NULL,
  `history_worksite` text,
  PRIMARY KEY (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`current_worksite`) REFERENCES `worksites` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `chef`
--

CREATE TABLE IF NOT EXISTS `chef` (
  `user_id` int NOT NULL,
  `years_experience` varchar(50) NOT NULL,
  `current_worksite` varchar(50) DEFAULT NULL,
  `history_worksite` text,
  PRIMARY KEY (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`current_worksite`) REFERENCES `worksites` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `employe`
--

CREATE TABLE IF NOT EXISTS `employe` (
  `user_id` int NOT NULL,
  PRIMARY KEY (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Insertion des données de test
--

-- 1. Insertion des utilisateurs avec mots de passe en clair (format lastName.firstName)
-- Ces mots de passe devront être hashés ultérieurement
INSERT INTO `users` (`firstName`, `lastName`, `email`, `password`, `role`, `date_creation`) VALUES
('Admin', 'System', 'admin@edifis.fr', 'system.admin', 'admin', '2024-01-01'),
('Thomas', 'Dubois', 'thomas.dubois@edifis.fr', 'dubois.thomas', 'chef', '2024-01-02'),
('Marie', 'Laurent', 'marie.laurent@edifis.fr', 'laurent.marie', 'chef', '2024-01-03'),
('Jean', 'Moreau', 'jean.moreau@edifis.fr', 'moreau.jean', 'chef', '2024-01-04'),
('Sophie', 'Martin', 'sophie.martin@edifis.fr', 'martin.sophie', 'chef', '2024-01-05'),
('Pierre', 'Bernard', 'pierre.bernard@edifis.fr', 'bernard.pierre', 'chef', '2024-01-06'),
('Claire', 'Petit', 'claire.petit@edifis.fr', 'petit.claire', 'chef', '2024-01-07'),
('Lucas', 'Roux', 'lucas.roux@edifis.fr', 'roux.lucas', 'chef', '2024-01-08'),
('Emma', 'Girard', 'emma.girard@edifis.fr', 'girard.emma', 'chef', '2024-01-09'),
('Nicolas', 'Simon', 'nicolas.simon@edifis.fr', 'simon.nicolas', 'chef', '2024-01-10'),
('Julie', 'Leroy', 'julie.leroy@edifis.fr', 'leroy.julie', 'chef', '2024-01-11'),
('Paul', 'Richard', 'paul.richard@edifis.fr', 'richard.paul', 'employe', '2024-01-12'),
('Sarah', 'Michel', 'sarah.michel@edifis.fr', 'michel.sarah', 'employe', '2024-01-13'),
('Antoine', 'Lefebvre', 'antoine.lefebvre@edifis.fr', 'lefebvre.antoine', 'employe', '2024-01-14'),
('Laura', 'Garcia', 'laura.garcia@edifis.fr', 'garcia.laura', 'employe', '2024-01-15'),
('Hugo', 'David', 'hugo.david@edifis.fr', 'david.hugo', 'employe', '2024-01-16'),
('Alice', 'Bertrand', 'alice.bertrand@edifis.fr', 'bertrand.alice', 'employe', '2024-01-17'),
('Maxime', 'Robert', 'maxime.robert@edifis.fr', 'robert.maxime', 'employe', '2024-01-18'),
('Léa', 'Vincent', 'lea.vincent@edifis.fr', 'vincent.léa', 'employe', '2024-01-19'),
('Gabriel', 'Thomas', 'gabriel.thomas@edifis.fr', 'thomas.gabriel', 'employe', '2024-01-20'),
('Eva', 'Durand', 'eva.durand@edifis.fr', 'durand.eva', 'employe', '2024-01-21'),
('Michel', 'Carpentier', 'michel.carpentier@edifis.fr', 'carpentier.michel', 'artisan', '2024-01-22'),
('Philippe', 'Menuisier', 'philippe.menuisier@edifis.fr', 'menuisier.philippe', 'artisan', '2024-01-23'),
('Jacques', 'Plombier', 'jacques.plombier@edifis.fr', 'plombier.jacques', 'artisan', '2024-01-24'),
('Marc', 'Electricien', 'marc.electricien@edifis.fr', 'electricien.marc', 'artisan', '2024-01-25'),
('Louis', 'Peintre', 'louis.peintre@edifis.fr', 'peintre.louis', 'artisan', '2024-01-26'),
('André', 'Maçon', 'andre.macon@edifis.fr', 'maçon.andré', 'artisan', '2024-01-27'),
('Jean', 'Carreleur', 'jean.carreleur@edifis.fr', 'carreleur.jean', 'artisan', '2024-01-28'),
('Pierre', 'Couvreur', 'pierre.couvreur@edifis.fr', 'couvreur.pierre', 'artisan', '2024-01-29'),
('Antoine', 'Platrier', 'antoine.platrier@edifis.fr', 'platrier.antoine', 'artisan', '2024-01-30'),
('François', 'Chauffagiste', 'francois.chauffagiste@edifis.fr', 'chauffagiste.françois', 'artisan', '2024-01-31'),
('Paul', 'Domoticien', 'paul.domoticien@edifis.fr', 'domoticien.paul', 'artisan', '2024-02-01'),
('Laurent', 'Vitrier', 'laurent.vitrier@edifis.fr', 'vitrier.laurent', 'artisan', '2024-02-02'),
('Nicolas', 'Metallier', 'nicolas.metallier@edifis.fr', 'metallier.nicolas', 'artisan', '2024-02-03'),
('Michel', 'Serrurier', 'michel.serrurier@edifis.fr', 'serrurier.michel', 'artisan', '2024-02-04'),
('David', 'Ascensoriste', 'david.ascensoriste@edifis.fr', 'ascensoriste.david', 'artisan', '2024-02-05'),
('Julien', 'Paysagiste', 'julien.paysagiste@edifis.fr', 'paysagiste.julien', 'artisan', '2024-02-06'),
('Romain', 'Facade', 'romain.facade@edifis.fr', 'facade.romain', 'artisan', '2024-02-07'),
('Vincent', 'Isolation', 'vincent.isolation@edifis.fr', 'isolation.vincent', 'artisan', '2024-02-08'),
('Thomas', 'Etancheite', 'thomas.etancheite@edifis.fr', 'etancheite.thomas', 'artisan', '2024-02-09'),
('Maxime', 'Demolition', 'maxime.demolition@edifis.fr', 'demolition.maxime', 'artisan', '2024-02-10'),
('Sébastien', 'Terrassement', 'sebastien.terrassement@edifis.fr', 'terrassement.sébastien', 'artisan', '2024-02-11'),
('Eric', 'Charpentier', 'eric.charpentier@edifis.fr', 'charpentier.eric', 'artisan', '2024-02-12'),
('Pascal', 'Carrossier', 'pascal.carrossier@edifis.fr', 'carrossier.pascal', 'artisan', '2024-02-13'),
('Alain', 'Ferronnier', 'alain.ferronnier@edifis.fr', 'ferronnier.alain', 'artisan', '2024-02-14'),
('Bernard', 'Miroitier', 'bernard.miroitier@edifis.fr', 'miroitier.bernard', 'artisan', '2024-02-15'),
('Christian', 'Staffeur', 'christian.staffeur@edifis.fr', 'staffeur.christian', 'artisan', '2024-02-16'),
('Denis', 'Fumiste', 'denis.fumiste@edifis.fr', 'fumiste.denis', 'artisan', '2024-02-17'),
('Franck', 'Ramoneur', 'franck.ramoneur@edifis.fr', 'ramoneur.franck', 'artisan', '2024-02-18'),
('Gerard', 'Zingueur', 'gerard.zingueur@edifis.fr', 'zingueur.gerard', 'artisan', '2024-02-19'),
('Henri', 'Parqueteur', 'henri.parqueteur@edifis.fr', 'parqueteur.henri', 'artisan', '2024-02-20'),
('Jacques', 'Mosaiste', 'jacques.mosaiste@edifis.fr', 'mosaiste.jacques', 'artisan', '2024-02-21'),
('Kevin', 'Solier', 'kevin.solier@edifis.fr', 'solier.kevin', 'artisan', '2024-02-22'),
('Loic', 'Enduiseur', 'loic.enduiseur@edifis.fr', 'enduiseur.loic', 'artisan', '2024-02-23'),
('Mathieu', 'Cordiste', 'mathieu.cordiste@edifis.fr', 'cordiste.mathieu', 'artisan', '2024-02-24'),
('Olivier', 'Soudeur', 'olivier.soudeur@edifis.fr', 'soudeur.olivier', 'artisan', '2024-02-25'),
('Patrick', 'Plaquiste', 'patrick.plaquiste@edifis.fr', 'plaquiste.patrick', 'artisan', '2024-02-26'),
('Quentin', 'Bardeur', 'quentin.bardeur@edifis.fr', 'bardeur.quentin', 'artisan', '2024-02-27'),
('Remi', 'Echafaudeur', 'remi.echafaudeur@edifis.fr', 'echafaudeur.remi', 'artisan', '2024-02-28'),
('Simon', 'Granitier', 'simon.granitier@edifis.fr', 'granitier.simon', 'artisan', '2024-02-29'),
('Thierry', 'Paveur', 'thierry.paveur@edifis.fr', 'paveur.thierry', 'artisan', '2024-03-01');

-- 2. Insertion des chantiers avec dates cohérentes avec les statuts (date actuelle: 06/03/2025)
INSERT INTO `worksites` (`id`, `name`, `address`, `startDate`, `endDate`, `status`, `coordinates`, `cost`, `budget`, `specialities_needed`) VALUES
-- Chantiers complétés (dates dans le passé)
('7', 'École Primaire Jean Jaurès', "56 Rue de l\'Education, Avignon", '2024-01-15', '2024-09-30', 'completed', POINT(43.9493, 4.8055), 900000.00, 1100000.00, 'Peinture,Plâtrerie,Électricité'),
('8', 'Clinique Saint-Michel', '12 Avenue de la Santé, Saint-Tropez', '2024-02-01', '2024-12-31', 'completed', POINT(43.2727, 6.6407), 2800000.00, 3200000.00, 'Plomberie,Électricité,Climatisation'),

-- Chantiers en cours (date actuelle entre startDate et endDate)
('1', 'Rénovation Villa Méditerranée', '123 Avenue de la Plage, Nice', '2024-11-01', '2025-06-30', 'in_progress', POINT(43.7102, 7.2620), 150000.00, 180000.00, 'Plomberie,Électricité,Maçonnerie'),
('5', 'Résidence Les Oliviers', '89 Chemin des Oliviers, Toulon', '2024-12-15', '2025-11-30', 'in_progress', POINT(43.1242, 5.9280), 1200000.00, 1500000.00, 'Maçonnerie,Plâtrerie,Peinture'),
('11', 'Théâtre Municipal', '23 Rue des Arts, Fréjus', '2024-10-15', '2025-08-31', 'in_progress', POINT(43.4332, 6.7370), 1600000.00, 1800000.00, 'Plâtrerie,Peinture,Acoustique'),

-- Chantiers attribués (date de début dans le futur proche)
('2', 'Construction Immeuble Le Phare', '45 Rue du Port, Marseille', '2025-04-01', '2026-03-31', 'attributed', POINT(43.2965, 5.3698), 2500000.00, 3000000.00, 'Gros œuvre,Charpente,Électricité'),
('4', 'Complexe Sportif Olympique', '15 Avenue des Sports, Aix-en-Provence', '2025-06-01', '2026-02-28', 'attributed', POINT(43.5297, 5.4474), 3500000.00, 4000000.00, 'Gros œuvre,Menuiserie,Plomberie,Électricité'),
('6', 'Centre Commercial Riviera', '234 Boulevard du Commerce, Cannes', '2025-07-01', '2026-06-30', 'attributed', POINT(43.5528, 7.0174), 5000000.00, 6000000.00, 'Gros œuvre,Électricité,Plomberie,Menuiserie'),

-- Chantiers planifiés (date de début plus lointaine dans le futur)
('3', 'Réhabilitation Hôtel Royal', '78 Boulevard des Lices, Arles', '2025-05-15', '2025-12-31', 'planned', POINT(43.6767, 4.6277), 800000.00, 1000000.00, 'Plâtrerie,Peinture,Menuiserie'),
('9', 'Bibliothèque Municipale', '45 Place des Lettres, Antibes', '2025-08-01', '2026-04-30', 'planned', POINT(43.5808, 7.1283), 1800000.00, 2000000.00, 'Menuiserie,Électricité,Peinture'),
('10', 'Résidence Seniors Les Mimosas', '78 Avenue des Fleurs, Menton', '2025-09-01', '2026-05-31', 'planned', POINT(43.7765, 7.4989), 2200000.00, 2500000.00, 'Plomberie,Électricité,Menuiserie'),
('12', 'Piscine Olympique', '90 Boulevard du Sport, Hyères', '2025-10-01', '2026-08-31', 'planned', POINT(43.1198, 6.1282), 4500000.00, 5000000.00, 'Gros œuvre,Plomberie,Carrelage'),
('13', "Musée d\'Art Contemporain", '34 Place de la Culture, Grasse', '2025-08-15', '2026-06-30', 'planned', POINT(43.6589, 6.9223), 2000000.00, 2300000.00, 'Menuiserie,Peinture,Électricité');

-- 3. Insertion des employés
INSERT INTO `employe` (`user_id`)
SELECT id FROM `users` WHERE role = 'employe';

-- 4. Insertion des chefs (en fonction des utilisateurs ayant le rôle 'chef')
INSERT INTO `chef` (`user_id`, `years_experience`, `current_worksite`, `history_worksite`)
SELECT 
    id, 
    FLOOR(5 + RAND() * 20) AS years_experience, -- Entre 5 et 25 ans d'expérience
    CASE 
        WHEN ROW_NUMBER() OVER () <= 10 THEN -- Un chef par chantier pour les 10 premiers chantiers
            CONVERT(ROW_NUMBER() OVER (), CHAR(50))
        ELSE NULL 
    END AS current_worksite,
    CASE 
        WHEN ROW_NUMBER() OVER () <= 10 THEN -- Historique pour les chefs
            CONCAT('7,8,', CONVERT(ROW_NUMBER() OVER () + 2, CHAR(50)))
        ELSE '7,8'
    END AS history_worksite
FROM `users`