-- Delete duplicate records keeping only the most recently updated row for each user_id
WITH duplicates AS (
  SELECT user_id, 
         MAX(updated_at) as max_updated_at
  FROM user_settings
  GROUP BY user_id
  HAVING COUNT(*) > 1
)
DELETE FROM user_settings us
WHERE EXISTS (
  SELECT 1 
  FROM duplicates d 
  WHERE us.user_id = d.user_id 
  AND us.updated_at < d.max_updated_at
);

-- Now try to add the unique constraint
ALTER TABLE user_settings
ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id); 