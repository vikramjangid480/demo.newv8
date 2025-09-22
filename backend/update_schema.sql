-- Update related_books table to include author field
-- This is an additive migration to enhance the existing schema

USE boganto_blog;

-- Add author column to related_books table if it doesn't exist
ALTER TABLE related_books 
ADD COLUMN IF NOT EXISTS author VARCHAR(255) NULL AFTER title;

-- Update existing related books with some author data
UPDATE related_books SET author = 'Susan Orlean' WHERE title LIKE '%Susan Orlean%';
UPDATE related_books SET author = 'Umberto Eco' WHERE title LIKE '%Umberto Eco%';
UPDATE related_books SET author = 'J.R.R. Tolkien' WHERE title LIKE '%Tolkien%';
UPDATE related_books SET author = 'Patrick Rothfuss' WHERE title LIKE '%Patrick Rothfuss%';
UPDATE related_books SET author = 'Roy MacLeod' WHERE title LIKE '%Roy MacLeod%';
UPDATE related_books SET author = 'Charles Darwin' WHERE title LIKE '%Darwin%';
UPDATE related_books SET author = 'Isaac Newton' WHERE title LIKE '%Newton%';
UPDATE related_books SET author = 'John Gardner' WHERE title LIKE '%John Gardner%';
UPDATE related_books SET author = 'Robert McKee' WHERE title LIKE '%Robert McKee%';