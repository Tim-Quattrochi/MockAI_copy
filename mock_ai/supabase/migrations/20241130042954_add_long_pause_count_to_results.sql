-- Up Migration: Add "long_pause_count" column to the "results" table
ALTER TABLE results
ADD COLUMN long_pause_count INT DEFAULT 0;

-- Up Migration: Delete long_pauses column from results table
ALTER TABLE results DROP COLUMN long_pauses;


-- Down Migration: Add long_pauses column back to results table
ALTER TABLE results
ADD COLUMN long_pauses INT[];


-- Down Migration: Drop long_pause_count from results
ALTER TABLE results DROP COLUMN long_pause_count;
