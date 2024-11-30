-- Up Migration: Created a trigger function for updating the "long_pause_count" when the "long_pauses" column is updated in the "results" table
CREATE OR REPLACE FUNCTION update_long_pause_count() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.long_pause_count := array_length(NEW.long_pauses, 1) FILTER (WHERE duration >= 10);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_long_pause_count
AFTER UPDATE OF long_pauses
ON results
FOR EACH ROW
EXECUTE FUNCTION update_long_pause_count();

-- Down Migration: Drop trigger and function for long_pause_count
DROP TRIGGER IF EXISTS trigger_update_long_pause_count ON results;
DROP FUNCTION IF EXISTS update_long_pause_count;
