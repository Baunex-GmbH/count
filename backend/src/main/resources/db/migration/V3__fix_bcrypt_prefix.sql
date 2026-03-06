-- Fix bcrypt prefix: jBCrypt requires $2a$ instead of $2b$
UPDATE app_user SET password_hash = REPLACE(password_hash, '$2b$', '$2a$');
