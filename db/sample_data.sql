-- Insert sample books
INSERT INTO books (title, author, genre, created_at) VALUES
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '2025-05-24 07:30:28.032476'),
('1984', 'George Orwell', 'Dystopian', '2025-05-24 07:30:28.032476'),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', '2025-05-25 03:15:43.140702'),
('The Alchemist', 'Paulo Coelho', 'Fiction', '2025-05-25 03:29:42.753577'),
('To Kill a Mockingbird', 'Harper Lee', 'Classic', '2025-05-25 04:15:00.000000');

-- Insert reviews for The Hobbit 
INSERT INTO reviews (book_id, user_id, rating, comment) VALUES
(1, 1, 5, 'A masterpiece of fantasy literature. The world-building is incredible and the characters are unforgettable.'),
(1, 2, 4, 'Great adventure story, though some parts were a bit slow. Bilbo is such a relatable character!');

-- Insert reviews for 1984 
INSERT INTO reviews (book_id, user_id, rating, comment) VALUES
(2, 1, 5, 'One of the most important books ever written. A stark warning about totalitarianism.'),
(2, 2, 4, 'Brilliant writing and world-building. The atmosphere of constant surveillance is terrifyingly real.');

-- Insert reviews for The Great Gatsby and The Alchemist
INSERT INTO reviews (book_id, user_id, rating, comment) VALUES
(3, 1, 4, 'A brilliant portrayal of the American Dream and its dark side. Fitzgerald''s prose is beautiful.'),
(3, 2, 5, 'The symbolism and character development are masterful. A true American classic.'),
(4, 1, 5, 'A spiritual journey that resonates with readers. Simple yet profound.');

-- Insert reviews for To Kill a Mockingbird
INSERT INTO reviews (book_id, user_id, rating, comment) VALUES
(5, 1, 5, 'A powerful exploration of justice, morality, and human nature. Scout''s narrative voice is unforgettable.'),
(5, 2, 5, 'This book perfectly captures both the innocence of childhood and the harsh realities of prejudice.'),
(5, 3, 5, 'A masterpiece that remains as relevant today as when it was first published. Atticus Finch is the epitome of moral courage.');