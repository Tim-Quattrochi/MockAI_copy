-- Up Migration: Rename column 'question' to 'question_text' in the 'questions' table
ALTER TABLE questions RENAME COLUMN question TO question_text;

-- Down Migration: Rename column 'question_text' back to 'question' in the 'questions' table
ALTER TABLE questions RENAME COLUMN question_text TO question;
