-- Up Migration: Renamed table 'question' to 'questions' for plural consistency
ALTER TABLE question RENAME TO questions;

-- Down Migration: Rolled back table name change from 'questions' to 'question'
ALTER TABLE questions RENAME TO question;
