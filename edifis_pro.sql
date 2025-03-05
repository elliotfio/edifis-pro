SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

--
-- Suppression des tables dans l'ordre (enfants d'abord)
--
DROP TABLE IF EXISTS `planification`;
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
-- Structure de la table `planification`
--

CREATE TABLE IF NOT EXISTS `planification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `worksites_id` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `affectation_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `worksites_id` (`worksites_id`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`worksites_id`) REFERENCES `worksites` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Insertion des données de test
--

-- 1. Insertion des utilisateurs
INSERT INTO `users` (`firstName`, `lastName`, `email`, `password`, `role`, `date_creation`) VALUES
('Admin', 'System', 'admin@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'admin', '2024-01-01'),
-- Employés (4)
('Emma', 'Dubois', 'emma.dubois@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'employe', '2024-01-15'),
('Lucas', 'Martin', 'lucas.martin@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'employe', '2024-01-15'),
('Léa', 'Bernard', 'lea.bernard@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'employe', '2024-01-20'),
('Hugo', 'Thomas', 'hugo.thomas@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'employe', '2024-01-20'),
-- Chefs (6)
('Sophie', 'Petit', 'sophie.petit@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'chef', '2024-01-10'),
('Thomas', 'Leroy', 'thomas.leroy@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'chef', '2024-01-10'),
('Julie', 'Moreau', 'julie.moreau@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'chef', '2024-01-15'),
('Nicolas', 'Roux', 'nicolas.roux@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'chef', '2024-01-15'),
('Marie', 'Simon', 'marie.simon@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'chef', '2024-02-01'),
('Pierre', 'Laurent', 'pierre.laurent@edifis.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs', 'chef', '2024-02-01');

-- Artisans (40)
INSERT INTO `users` (`firstName`, `lastName`, `email`, `password`, `role`, `date_creation`)
SELECT 
  CASE n % 20
    WHEN 0 THEN 'Jean' WHEN 1 THEN 'Michel' WHEN 2 THEN 'Philippe' WHEN 3 THEN 'Antoine'
    WHEN 4 THEN 'François' WHEN 5 THEN 'Paul' WHEN 6 THEN 'Jacques' WHEN 7 THEN 'Marc'
    WHEN 8 THEN 'Luc' WHEN 9 THEN 'André' WHEN 10 THEN 'Claire' WHEN 11 THEN 'Anne'
    WHEN 12 THEN 'Sophie' WHEN 13 THEN 'Marie' WHEN 14 THEN 'Isabelle' WHEN 15 THEN 'Catherine'
    WHEN 16 THEN 'Sylvie' WHEN 17 THEN 'Christine' WHEN 18 THEN 'Nathalie' ELSE 'Patrick'
  END,
  CASE n % 15
    WHEN 0 THEN 'Martin' WHEN 1 THEN 'Bernard' WHEN 2 THEN 'Dubois' WHEN 3 THEN 'Thomas'
    WHEN 4 THEN 'Robert' WHEN 5 THEN 'Richard' WHEN 6 THEN 'Petit' WHEN 7 THEN 'Durand'
    WHEN 8 THEN 'Leroy' WHEN 9 THEN 'Moreau' WHEN 10 THEN 'Simon' WHEN 11 THEN 'Laurent'
    WHEN 12 THEN 'Lefebvre' WHEN 13 THEN 'Michel' ELSE 'Garcia'
  END,
  CONCAT(
    LOWER(
      CASE n % 20
        WHEN 0 THEN 'Jean' WHEN 1 THEN 'Michel' WHEN 2 THEN 'Philippe' WHEN 3 THEN 'Antoine'
        WHEN 4 THEN 'Francois' WHEN 5 THEN 'Paul' WHEN 6 THEN 'Jacques' WHEN 7 THEN 'Marc'
        WHEN 8 THEN 'Luc' WHEN 9 THEN 'Andre' WHEN 10 THEN 'Claire' WHEN 11 THEN 'Anne'
        WHEN 12 THEN 'Sophie' WHEN 13 THEN 'Marie' WHEN 14 THEN 'Isabelle' WHEN 15 THEN 'Catherine'
        WHEN 16 THEN 'Sylvie' WHEN 17 THEN 'Christine' WHEN 18 THEN 'Nathalie' ELSE 'Patrick'
      END
    ),
    '.',
    LOWER(
      CASE n % 15
        WHEN 0 THEN 'Martin' WHEN 1 THEN 'Bernard' WHEN 2 THEN 'Dubois' WHEN 3 THEN 'Thomas'
        WHEN 4 THEN 'Robert' WHEN 5 THEN 'Richard' WHEN 6 THEN 'Petit' WHEN 7 THEN 'Durand'
        WHEN 8 THEN 'Leroy' WHEN 9 THEN 'Moreau' WHEN 10 THEN 'Simon' WHEN 11 THEN 'Laurent'
        WHEN 12 THEN 'Lefebvre' WHEN 13 THEN 'Michel' ELSE 'Garcia'
      END
    ),
    '@edifis.fr'
  ),
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFuAZb3YQu4Cs',
  'artisan',
  DATE_ADD('2024-01-01', INTERVAL n DAY)
FROM (
  SELECT a.N + b.N * 10 + c.N * 100 as n
  FROM (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
       (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3) b,
       (SELECT 0 AS N) c
  ORDER BY n
  LIMIT 40
) numbers;

-- 2. Insertion des chantiers
INSERT INTO `worksites` (`id`, `name`, `address`, `startDate`, `endDate`, `status`, `coordinates`, `cost`, `budget`, `specialities_needed`) VALUES
('1', 'Rénovation Villa Méditerranée', '123 Avenue de la Plage, Nice', '2024-03-01', '2024-06-30', 'in_progress', POINT(43.7102, 7.2620), 150000.00, 180000.00, 'Plomberie, Électricité, Maçonnerie'),
('2', 'Construction Immeuble Le Phare', '45 Rue du Port, Marseille', '2024-04-01', '2025-03-31', 'attributed', POINT(43.2965, 5.3698), 2500000.00, 3000000.00, 'Gros œuvre, Charpente, Électricité'),
('3', 'Réhabilitation Hôtel Royal', '78 Boulevard des Lices, Arles', '2024-05-15', '2024-12-31', 'planned', POINT(43.6767, 4.6277), 800000.00, 1000000.00, 'Plâtrerie, Peinture, Menuiserie'),
('4', 'Complexe Sportif Olympique', '15 Avenue des Sports, Aix-en-Provence', '2024-06-01', '2025-02-28', 'attributed', POINT(43.5297, 5.4474), 3500000.00, 4000000.00, 'Gros œuvre, Menuiserie, Plomberie, Électricité'),
('5', 'Résidence Les Oliviers', '89 Chemin des Oliviers, Toulon', '2024-04-15', '2024-11-30', 'in_progress', POINT(43.1242, 5.9280), 1200000.00, 1500000.00, 'Maçonnerie, Plâtrerie, Peinture'),
('6', 'Centre Commercial Riviera', '234 Boulevard du Commerce, Cannes', '2024-07-01', '2025-06-30', 'planned', POINT(43.5528, 7.0174), 5000000.00, 6000000.00, 'Gros œuvre, Électricité, Plomberie, Menuiserie'),
('7', 'École Primaire Jean Jaurès', "56 Rue de l\'Education, Avignon", '2024-06-15', '2024-09-30', 'completed', POINT(43.9493, 4.8055), 900000.00, 1100000.00, 'Peinture, Plâtrerie, Électricité'),
('8', 'Clinique Saint-Michel', '12 Avenue de la Santé, Saint-Tropez', '2024-05-01', '2025-01-31', 'archived', POINT(43.2727, 6.6407), 2800000.00, 3200000.00, 'Plomberie, Électricité, Climatisation'),
('9', 'Bibliothèque Municipale', '45 Place des Lettres, Antibes', '2024-08-01', '2025-04-30', 'planned', POINT(43.5808, 7.1283), 1800000.00, 2000000.00, 'Menuiserie, Électricité, Peinture'),
('10', 'Résidence Seniors Les Mimosas', '78 Avenue des Fleurs, Menton', '2024-09-01', '2025-05-31', 'planned', POINT(43.7765, 7.4989), 2200000.00, 2500000.00, 'Plomberie, Électricité, Menuiserie'),
('11', 'Théâtre Municipal', '23 Rue des Arts, Fréjus', '2024-07-15', '2025-03-31', 'in_progress', POINT(43.4332, 6.7370), 1600000.00, 1800000.00, 'Plâtrerie, Peinture, Acoustique'),
('12', 'Piscine Olympique', '90 Boulevard du Sport, Hyères', '2024-10-01', '2025-08-31', 'planned', POINT(43.1198, 6.1282), 4500000.00, 5000000.00, 'Gros œuvre, Plomberie, Carrelage'),
('13', "Musée d\'Art Contemporain", '34 Place de la Culture, Grasse', '2024-08-15', '2025-06-30', 'blocked', POINT(43.6589, 6.9223), 2000000.00, 2300000.00, 'Menuiserie, Peinture, Électricité');

-- 3. Insertion des employés
INSERT INTO `employe` (`user_id`)
SELECT id FROM `users` WHERE role = 'employe';

-- 4. Insertion des chefs (un seul chef par chantier)
INSERT INTO `chef` (`user_id`, `years_experience`, `current_worksite`)
VALUES 
((SELECT id FROM users WHERE email = 'sophie.petit@edifis.fr'), '35', '1'),
((SELECT id FROM users WHERE email = 'thomas.leroy@edifis.fr'), '42', '2'),
((SELECT id FROM users WHERE email = 'julie.moreau@edifis.fr'), '20', '3'),
((SELECT id FROM users WHERE email = 'nicolas.roux@edifis.fr'), '7', NULL),
((SELECT id FROM users WHERE email = 'marie.simon@edifis.fr'), '27', NULL),
((SELECT id FROM users WHERE email = 'pierre.laurent@edifis.fr'), '30', NULL);

-- 5. Insertion des artisans (seulement sur les chantiers qui ont un chef)
INSERT INTO `artisan` (`user_id`, `specialites`, `disponible`, `note_moyenne`, `current_worksite`)
SELECT 
    u.id,
    CASE (u.id % 5)
        WHEN 0 THEN 'Plomberie, Chauffage'
        WHEN 1 THEN 'Électricité, Domotique'
        WHEN 2 THEN 'Maçonnerie, Carrelage'
        WHEN 3 THEN 'Menuiserie, Charpente'
        ELSE 'Peinture, Plâtrerie'
    END,
    TRUE,
    ROUND(RAND() * 2 + 3, 1),  -- Note entre 3.0 et 5.0
    CASE (u.id % 3)  -- Modifié pour n'assigner que sur les chantiers 1, 2 et 3 qui ont des chefs
        WHEN 0 THEN '1'
        WHEN 1 THEN '2'
        WHEN 2 THEN '3'
        ELSE NULL
    END
FROM users u
WHERE u.role = 'artisan'
AND (
    CASE (u.id % 3)  -- Vérifie que le chantier assigné a un chef
        WHEN 0 THEN EXISTS (SELECT 1 FROM chef WHERE current_worksite = '1')
        WHEN 1 THEN EXISTS (SELECT 1 FROM chef WHERE current_worksite = '2')
        WHEN 2 THEN EXISTS (SELECT 1 FROM chef WHERE current_worksite = '3')
        ELSE FALSE
    END
);

-- 6. Insertion des planifications
INSERT INTO `planification` (`worksites_id`, `user_id`, `role`, `affectation_date`)
SELECT 
    w.id,
    u.id,
    CASE u.role
        WHEN 'chef' THEN 'Chef de chantier'
        WHEN 'artisan' THEN 'Artisan'
    END,
    DATE_ADD('2024-01-01', INTERVAL ROUND(RAND() * 30) DAY)
FROM users u
CROSS JOIN worksites w
WHERE (u.role IN ('chef', 'artisan'))
AND (
    (u.role = 'chef' AND EXISTS (
        SELECT 1 FROM chef c 
        WHERE c.user_id = u.id 
        AND c.current_worksite = w.id
    ))
    OR
    (u.role = 'artisan' AND EXISTS (
        SELECT 1 FROM artisan a 
        WHERE a.user_id = u.id 
        AND a.current_worksite = w.id
    ))
);

COMMIT;