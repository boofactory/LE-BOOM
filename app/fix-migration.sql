-- Script pour résoudre la migration échouée
-- À exécuter dans le container boom-postgres via psql

-- Option 1: Marquer la migration comme terminée (si les tables existent déjà)
UPDATE "_prisma_migrations"
SET finished_at = NOW(),
    applied_steps_count = 1,
    logs = NULL
WHERE migration_name = '20251026000000_init'
  AND finished_at IS NULL;

-- Option 2: Si Option 1 ne marche pas, supprimer et nettoyer
-- DELETE FROM "_prisma_migrations" WHERE migration_name = '20251026000000_init';
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;
