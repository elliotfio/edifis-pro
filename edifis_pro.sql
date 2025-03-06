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
  `specialites` text NOT NULL,
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
('7', 'École Primaire Jean Jaurès', "56 Rue de l\'Education, Avignon", '2024-01-15', '2024-09-30', 'completed', POINT(43.9493, 4.8055), 900000.00, 1100000.00, '["Peinture","Plâtrerie","Électricité"]'),
('8', 'Clinique Saint-Michel', '12 Avenue de la Santé, Saint-Tropez', '2024-02-01', '2024-12-31', 'completed', POINT(43.2727, 6.6407), 2800000.00, 3200000.00, '["Plomberie","Électricité","Climatisation"]'),

-- Chantiers en cours (date actuelle entre startDate et endDate)
('1', 'Rénovation Villa Méditerranée', '123 Avenue de la Plage, Nice', '2024-11-01', '2025-06-30', 'in_progress', POINT(43.7102, 7.2620), 150000.00, 180000.00, '["Plomberie","Électricité","Maçonnerie"]'),
('5', 'Résidence Les Oliviers', '89 Chemin des Oliviers, Toulon', '2024-12-15', '2025-11-30', 'in_progress', POINT(43.1242, 5.9280), 1200000.00, 1500000.00, '["Maçonnerie","Plâtrerie","Peinture"]'),
('11', 'Théâtre Municipal', '23 Rue des Arts, Fréjus', '2024-10-15', '2025-08-31', 'in_progress', POINT(43.4332, 6.7370), 1600000.00, 1800000.00, '["Plâtrerie","Peinture","Acoustique"]'),

-- Chantiers attribués (date de début dans le futur proche)
('2', 'Construction Immeuble Le Phare', '45 Rue du Port, Marseille', '2025-04-01', '2026-03-31', 'attributed', POINT(43.2965, 5.3698), 2500000.00, 3000000.00, '["Gros œuvre","Charpente","Électricité"]'),
('4', 'Complexe Sportif Olympique', '15 Avenue des Sports, Aix-en-Provence', '2025-06-01', '2026-02-28', 'attributed', POINT(43.5297, 5.4474), 3500000.00, 4000000.00, '["Gros œuvre","Menuiserie","Plomberie","Électricité"]'),
('6', 'Centre Commercial Riviera', '234 Boulevard du Commerce, Cannes', '2025-07-01', '2026-06-30', 'attributed', POINT(43.5528, 7.0174), 5000000.00, 6000000.00, '["Gros œuvre","Électricité","Plomberie","Menuiserie"]'),

-- Chantiers planifiés (date de début plus lointaine dans le futur)
('3', 'Réhabilitation Hôtel Royal', '78 Boulevard des Lices, Arles', '2025-05-15', '2025-12-31', 'planned', POINT(43.6767, 4.6277), 800000.00, 1000000.00, '["Plâtrerie","Peinture","Menuiserie"]'),
('9', 'Bibliothèque Municipale', '45 Place des Lettres, Antibes', '2025-08-01', '2026-04-30', 'planned', POINT(43.5808, 7.1283), 1800000.00, 2000000.00, '["Menuiserie","Électricité","Peinture"]'),
('10', 'Résidence Seniors Les Mimosas', '78 Avenue des Fleurs, Menton', '2025-09-01', '2026-05-31', 'planned', POINT(43.7765, 7.4989), 2200000.00, 2500000.00, '["Plomberie","Électricité","Menuiserie"]'),
('12', 'Piscine Olympique', '90 Boulevard du Sport, Hyères', '2025-10-01', '2026-08-31', 'planned', POINT(43.1198, 6.1282), 4500000.00, 5000000.00, '["Gros œuvre","Plomberie","Carrelage"]'),
('13', "Musée d\'Art Contemporain", '34 Place de la Culture, Grasse', '2025-08-15', '2026-06-30', 'planned', POINT(43.6589, 6.9223), 2000000.00, 2300000.00, '["Menuiserie","Peinture","Électricité"]');

-- 3. Insertion des employés
INSERT INTO `employe` (`user_id`)
SELECT id FROM `users` WHERE role = 'employe';

-- 4. Insertion des chefs (en fonction des utilisateurs ayant le rôle 'chef')
INSERT INTO `chef` (`user_id`, `years_experience`, `specialites`, `current_worksite`, `history_worksite`)
SELECT 
    id, 
    CONCAT(FLOOR(5 + RAND() * 20), ' ans') AS years_experience,
    CASE 
        WHEN id % 10 = 0 THEN '["Gestion de projet","Coordination","Planification"]'
        WHEN id % 10 = 1 THEN '["Gestion d\'équipe","Suivi de chantier","Sécurité"]'
        WHEN id % 10 = 2 THEN '["Planification","Budget","Qualité"]'
        WHEN id % 10 = 3 THEN '["Coordination","Logistique","Approvisionnement"]'
        WHEN id % 10 = 4 THEN '["Suivi de chantier","Contrôle qualité","Réception"]'
        WHEN id % 10 = 5 THEN '["Gestion des risques","Sécurité","Conformité"]'
        WHEN id % 10 = 6 THEN '["Budget","Coûts","Rentabilité"]'
        WHEN id % 10 = 7 THEN '["Planification","Délais","Ressources"]'
        WHEN id % 10 = 8 THEN '["Coordination","Communication","Reporting"]'
        ELSE '["Management","Organisation","Supervision"]'
    END AS specialites,
    CASE 
        WHEN id % 10 = 0 THEN '1'  -- Chantier en cours
        WHEN id % 10 = 1 THEN '5'  -- Chantier en cours
        WHEN id % 10 = 2 THEN '11' -- Chantier en cours
        WHEN id % 10 = 3 THEN '2'  -- Chantier attribué (avec chef, sans artisans)
        WHEN id % 10 = 4 THEN '4'  -- Chantier attribué (avec chef, sans artisans)
        WHEN id % 10 = 5 THEN '6'  -- Chantier attribué (avec chef, sans artisans)
        WHEN id % 10 = 6 THEN '3'  -- Chantier planifié (avec chef et artisans)
        WHEN id % 10 = 7 THEN '9'  -- Chantier planifié (avec chef et artisans)
        WHEN id % 10 = 8 THEN '10' -- Chantier planifié (avec chef et artisans)
        WHEN id % 10 = 9 THEN '12' -- Chantier planifié (avec chef et artisans)
        ELSE '13' -- Chantier planifié (avec chef et artisans)
    END AS current_worksite,
    CASE 
        WHEN id % 5 = 0 THEN '["7"]'
        WHEN id % 5 = 1 THEN '["8"]'
        WHEN id % 5 = 2 THEN '["7","8"]'
        ELSE NULL
    END AS history_worksite
FROM `users`
WHERE role = 'chef';

-- 5. Insertion des artisans avec spécialités correspondant aux besoins des chantiers
INSERT INTO `artisan` (`user_id`, `specialites`, `disponible`, `note_moyenne`, `current_worksite`, `history_worksite`)
SELECT 
    id,
    CASE 
        -- Artisans pour chantier 1 (Rénovation Villa Méditerranée - besoin: Plomberie, Électricité, Maçonnerie)
        WHEN lastName = 'Plombier' THEN '["Plomberie","Sanitaire","Chauffage"]'
        WHEN lastName = 'Electricien' THEN '["Électricité","Domotique","Éclairage"]'
        WHEN lastName = 'Maçon' THEN '["Maçonnerie","Gros œuvre","Béton"]'
        
        -- Artisans pour chantier 5 (Résidence Les Oliviers - besoin: Maçonnerie, Plâtrerie, Peinture)
        WHEN lastName = 'Peintre' THEN '["Peinture","Décoration","Revêtements muraux"]'
        WHEN lastName = 'Platrier' THEN '["Plâtrerie","Cloisons","Isolation"]'
        WHEN lastName = 'Enduiseur' THEN '["Enduits","Plâtrerie","Façades"]'
        
        -- Artisans pour chantier 11 (Théâtre Municipal - besoin: Plâtrerie, Peinture, Acoustique)
        WHEN lastName = 'Isolation' THEN '["Isolation","Acoustique","Thermique"]'
        WHEN lastName = 'Plaquiste' THEN '["Plaques de plâtre","Plâtrerie","Faux plafonds"]'
        WHEN lastName = 'Staffeur' THEN '["Staff","Plâtrerie","Acoustique"]'
        
        -- Artisans pour chantier 3 (Réhabilitation Hôtel Royal - besoin: Plâtrerie, Peinture, Menuiserie)
        WHEN lastName = 'Menuisier' THEN '["Menuiserie","Agencement","Ébénisterie"]'
        WHEN lastName = 'Parqueteur' THEN '["Parquet","Menuiserie","Revêtements de sol"]'
        
        -- Artisans pour chantier 9 (Bibliothèque Municipale - besoin: Menuiserie, Électricité, Peinture)
        WHEN lastName = 'Domoticien' THEN '["Domotique","Électricité","Automatisation"]'
        WHEN lastName = 'Charpentier' THEN '["Charpente","Menuiserie","Ossature bois"]'
        
        -- Artisans pour chantier 10 (Résidence Seniors Les Mimosas - besoin: Plomberie, Électricité, Menuiserie)
        WHEN lastName = 'Chauffagiste' THEN '["Chauffage","Plomberie","Climatisation"]'
        WHEN lastName = 'Vitrier' THEN '["Vitrerie","Menuiserie","Fenêtres"]'
        
        -- Artisans pour chantier 12 (Piscine Olympique - besoin: Gros œuvre, Plomberie, Carrelage)
        WHEN lastName = 'Carreleur' THEN '["Carrelage","Faïence","Mosaïque"]'
        WHEN lastName = 'Terrassement' THEN '["Terrassement","Gros œuvre","Fondations"]'
        WHEN lastName = 'Mosaiste' THEN '["Mosaïque","Carrelage","Revêtements"]'
        
        -- Artisans pour chantier 13 (Musée d'Art Contemporain - besoin: Menuiserie, Peinture, Électricité)
        WHEN lastName = 'Metallier' THEN '["Métallerie","Menuiserie","Serrurerie"]'
        WHEN lastName = 'Solier' THEN '["Sols","Peinture","Revêtements"]'
        WHEN lastName = 'Serrurier' THEN '["Serrurerie","Menuiserie","Métallerie"]'
        
        -- Artisans pour chantiers terminés (7 et 8)
        WHEN lastName = 'Couvreur' THEN '["Couverture","Toiture","Zinguerie"]'
        WHEN lastName = 'Ascensoriste' THEN '["Ascenseurs","Électricité","Mécanique"]'
        WHEN lastName = 'Paysagiste' THEN '["Paysagisme","Aménagement extérieur","Jardinage"]'
        WHEN lastName = 'Facade' THEN '["Façade","Peinture","Isolation extérieure"]'
        WHEN lastName = 'Etancheite' THEN '["Étanchéité","Plomberie","Toiture-terrasse"]'
        WHEN lastName = 'Demolition' THEN '["Démolition","Gros œuvre","Déconstruction"]'
        
        -- Artisans disponibles (sans chantier)
        WHEN lastName = 'Carpentier' THEN '["Charpente","Menuiserie","Bois"]'
        WHEN lastName = 'Carrossier' THEN '["Carrosserie","Métallerie","Soudure"]'
        WHEN lastName = 'Ferronnier' THEN '["Ferronnerie","Métallerie","Forge"]'
        WHEN lastName = 'Miroitier' THEN '["Miroiterie","Vitrerie","Menuiserie"]'
        WHEN lastName = 'Fumiste' THEN '["Fumisterie","Chauffage","Cheminées"]'
        WHEN lastName = 'Ramoneur' THEN '["Ramonage","Entretien conduits","Nettoyage"]'
        WHEN lastName = 'Zingueur' THEN '["Zinguerie","Couverture","Plomberie"]'
        WHEN lastName = 'Cordiste' THEN '["Travaux en hauteur","Façade","Sécurité"]'
        WHEN lastName = 'Soudeur' THEN '["Soudure","Métallerie","Assemblage"]'
        WHEN lastName = 'Bardeur' THEN '["Bardage","Façades","Isolation extérieure"]'
        WHEN lastName = 'Echafaudeur' THEN '["Échafaudage","Sécurité","Montage"]'
        WHEN lastName = 'Granitier' THEN '["Granit","Carrelage","Pierre"]'
        WHEN lastName = 'Paveur' THEN '["Pavage","Dallage","Aménagement extérieur"]'
        ELSE '["Polyvalent","Multi-compétences","Rénovation générale"]'
    END AS specialites,
    CASE 
        WHEN id % 3 = 0 THEN FALSE
        ELSE TRUE
    END AS disponible,
    ROUND(3 + RAND() * 2, 1) AS note_moyenne,
    CASE 
        -- Attribution des artisans aux chantiers en cours
        WHEN lastName IN ('Plombier', 'Electricien', 'Maçon') THEN '1'  -- Chantier 1: Plomberie, Électricité, Maçonnerie
        WHEN lastName IN ('Peintre', 'Platrier', 'Enduiseur') THEN '5'  -- Chantier 5: Maçonnerie, Plâtrerie, Peinture
        WHEN lastName IN ('Isolation', 'Plaquiste', 'Staffeur') THEN '11' -- Chantier 11: Plâtrerie, Peinture, Acoustique
        
        -- Attribution des artisans aux chantiers planifiés
        WHEN lastName IN ('Menuisier', 'Parqueteur') THEN '3'  -- Chantier 3: Plâtrerie, Peinture, Menuiserie
        WHEN lastName IN ('Domoticien', 'Charpentier') THEN '9'  -- Chantier 9: Menuiserie, Électricité, Peinture
        WHEN lastName IN ('Chauffagiste', 'Vitrier') THEN '10' -- Chantier 10: Plomberie, Électricité, Menuiserie
        WHEN lastName IN ('Carreleur', 'Terrassement', 'Mosaiste') THEN '12' -- Chantier 12: Gros œuvre, Plomberie, Carrelage
        WHEN lastName IN ('Metallier', 'Solier', 'Serrurier') THEN '13' -- Chantier 13: Menuiserie, Peinture, Électricité
        
        -- Artisans ayant travaillé sur des chantiers terminés
        WHEN lastName IN ('Couvreur', 'Ascensoriste', 'Paysagiste') THEN NULL
        WHEN lastName IN ('Facade', 'Etancheite', 'Demolition') THEN NULL
        
        -- Autres artisans disponibles
        ELSE NULL
    END AS current_worksite,
    CASE 
        WHEN lastName IN ('Couvreur', 'Ascensoriste', 'Paysagiste') THEN '["7"]'
        WHEN lastName IN ('Facade', 'Etancheite', 'Demolition') THEN '["8"]'
        WHEN lastName IN ('Plombier', 'Peintre', 'Isolation') THEN '["7","8"]'
        ELSE NULL
    END AS history_worksite
FROM `users`
WHERE role = 'artisan';