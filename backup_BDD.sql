-- creation des tables utilisateurs et responses (backup si jamais vous avez tous casser, bande de gros méchants pas beaux)

CREATE TABLE IF NOT EXISTS `utilisateurs` (
                                              `player_id` varchar(10) NOT NULL,
                                              `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
                                              PRIMARY KEY (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `responses` (
                                           `id` int(11) NOT NULL AUTO_INCREMENT,
                                           `player_id` varchar(10) DEFAULT NULL,
                                           `scene` varchar(255) DEFAULT NULL,
                                           `choix` text DEFAULT NULL,
                                           `run_id` varchar(50) DEFAULT NULL,
                                           `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
                                           PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;