-- ============================================================
-- CineNova Multiplex - MySQL Schema for MySQL Workbench
-- ============================================================
-- Database: cinenova_multiplex
-- Engine: InnoDB
-- Charset: utf8mb4
-- ============================================================

USE railway;
-- ============================================================
-- Table: users (for Spring Boot / custom auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Table: movies
-- ============================================================
CREATE TABLE IF NOT EXISTS movies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  language VARCHAR(50) DEFAULT 'English',
  duration_minutes INT NOT NULL,
  rating VARCHAR(10) DEFAULT 'UA',
  description TEXT,
  cast_info TEXT,
  director VARCHAR(255),
  poster_url VARCHAR(500),
  banner_url VARCHAR(500),
  release_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Table: screens (7 screens in the multiplex)
-- ============================================================
CREATE TABLE IF NOT EXISTS screens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  screen_number INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  total_rows INT NOT NULL DEFAULT 10,
  seats_per_row INT NOT NULL DEFAULT 12,
  screen_type VARCHAR(100) DEFAULT 'Standard',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Table: shows (scheduled movie screenings)
-- ============================================================
CREATE TABLE IF NOT EXISTS shows (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  movie_id BIGINT NOT NULL,
  screen_id BIGINT NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  price_regular DECIMAL(10,2) DEFAULT 180.00,
  price_premium DECIMAL(10,2) DEFAULT 280.00,
  price_recliner DECIMAL(10,2) DEFAULT 450.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Table: seats (all seats per screen)
-- ============================================================
CREATE TABLE IF NOT EXISTS seats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  screen_id BIGINT NOT NULL,
  row_label VARCHAR(5) NOT NULL,
  seat_number INT NOT NULL,
  seat_type ENUM('regular','premium','recliner') DEFAULT 'regular',
  UNIQUE KEY uniq_seat (screen_id, row_label, seat_number),
  FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Table: bookings (master booking record)
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  show_id BIGINT NOT NULL,
  booking_ref VARCHAR(20) NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'UPI',
  payment_status VARCHAR(20) DEFAULT 'pending',
  male_count INT DEFAULT 0,
  female_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Table: booking_seats (individual seat reservations)
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_seats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  seat_id BIGINT NOT NULL,
  ticket_type ENUM('male','female') DEFAULT 'male',
  UNIQUE KEY uniq_booking_seat (booking_id, seat_id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Table: snacks (snack/refreshment catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS snacks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) DEFAULT 'Food',
  description TEXT,
  image_url VARCHAR(500),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Table: booking_snacks (snacks ordered per booking)
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_snacks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  snack_id BIGINT NOT NULL,
  quantity INT DEFAULT 1,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (snack_id) REFERENCES snacks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_shows_movie_id ON shows(movie_id);
CREATE INDEX idx_shows_screen_id ON shows(screen_id);
CREATE INDEX idx_shows_date ON shows(show_date);
CREATE INDEX idx_seats_screen_id ON seats(screen_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_show_id ON bookings(show_id);
CREATE INDEX idx_booking_seats_booking_id ON booking_seats(booking_id);
CREATE INDEX idx_booking_snacks_booking_id ON booking_snacks(booking_id);

-- ============================================================
-- Seed Data: Screens (7 screens)
-- ============================================================
INSERT INTO screens (screen_number, name, total_rows, seats_per_row, screen_type) VALUES
(1, 'Screen 1 - IMAX', 10, 14, 'IMAX'),
(2, 'Screen 2 - 4DX', 10, 12, '4DX'),
(3, 'Screen 3 - Dolby Atmos', 10, 12, 'Dolby Atmos'),
(4, 'Screen 4 - Gold Class', 8, 10, 'Gold Class'),
(5, 'Screen 5 - Standard', 10, 14, 'Standard'),
(6, 'Screen 6 - Standard', 10, 14, 'Standard'),
(7, 'Screen 7 - Premium', 10, 12, 'Premium');

-- ============================================================
-- Seed Data: Movies (20 movies)
-- ============================================================
INSERT INTO movies (title, genre, language, duration_minutes, rating, description, cast_info, director, release_date, is_active) VALUES
('Dune: Part Two', 'Sci-Fi', 'English', 166, 'UA', 'Paul Atreides unites with the Fremen while seeking revenge.', 'Timothee Chalamet, Zendaya', 'Denis Villeneuve', '2024-03-01', TRUE),
('Jawan', 'Action', 'Hindi', 169, 'UA', 'A high-octane action thriller.', 'Shah Rukh Khan, Nayanthara', 'Atlee Kumar', '2023-09-07', TRUE),
('Interstellar', 'Sci-Fi', 'English', 169, 'UA', 'Explorers travel through a wormhole in space.', 'Matthew McConaughey, Anne Hathaway', 'Christopher Nolan', '2014-11-07', TRUE),
('Pathaan', 'Action', 'Hindi', 146, 'UA', 'An Indian agent races against a former colleague.', 'Shah Rukh Khan, Deepika Padukone', 'Siddharth Anand', '2023-01-25', TRUE),
('The Dark Knight', 'Action', 'English', 152, 'UA', 'Batman faces the Joker.', 'Christian Bale, Heath Ledger', 'Christopher Nolan', '2008-07-18', TRUE),
('RRR', 'Action', 'Telugu', 187, 'UA', 'Two legendary revolutionaries journey away from home.', 'N. T. Rama Rao Jr., Ram Charan', 'S. S. Rajamouli', '2022-03-25', TRUE),
('Avatar: The Way of Water', 'Sci-Fi', 'English', 192, 'UA', 'Jake Sully lives with his family on Pandora.', 'Sam Worthington, Zoe Saldana', 'James Cameron', '2022-12-16', TRUE),
('KGF Chapter 2', 'Action', 'Kannada', 168, 'UA', 'Rockys name strikes fear into his foes.', 'Yash, Sanjay Dutt', 'Prashanth Neel', '2022-04-14', TRUE),
('Inception', 'Sci-Fi', 'English', 148, 'UA', 'A thief steals corporate secrets through dreams.', 'Leonardo DiCaprio, Joseph Gordon-Levitt', 'Christopher Nolan', '2010-07-16', TRUE),
('Baahubali 2: The Conclusion', 'Action', 'Telugu', 167, 'UA', 'Shiva learns about his heritage.', 'Prabhas, Rana Daggubati', 'S. S. Rajamouli', '2017-04-28', TRUE),
('The Avengers', 'Action', 'English', 143, 'UA', 'Earths mightiest heroes assemble.', 'Robert Downey Jr., Chris Evans', 'Joss Whedon', '2012-05-04', TRUE),
('3 Idiots', 'Comedy', 'Hindi', 170, 'UA', 'Two friends search for their lost companion.', 'Aamir Khan, R. Madhavan', 'Rajkumar Hirani', '2009-12-25', TRUE),
('Spider-Man: No Way Home', 'Action', 'English', 148, 'UA', 'Spider-Mans identity is revealed.', 'Tom Holland, Zendaya', 'Jon Watts', '2021-12-17', TRUE),
('Dangal', 'Drama', 'Hindi', 161, 'U', 'A wrestler trains his daughters for glory.', 'Aamir Khan, Fatima Sana Shaikh', 'Nitesh Tiwari', '2016-12-23', TRUE),
('Joker', 'Drama', 'English', 122, 'A', 'A comedian becomes an iconic villain.', 'Joaquin Phoenix, Robert De Niro', 'Todd Phillips', '2019-10-04', TRUE),
('PK', 'Comedy', 'Hindi', 153, 'UA', 'An alien loses his communication device.', 'Aamir Khan, Anushka Sharma', 'Rajkumar Hirani', '2014-12-19', TRUE),
('Top Gun: Maverick', 'Action', 'English', 130, 'UA', 'Maverick pushes the envelope as a naval aviator.', 'Tom Cruise, Miles Teller', 'Joseph Kosinski', '2022-05-27', TRUE),
('Vikram', 'Action', 'Tamil', 173, 'UA', 'A special investigator uncovers a mystery.', 'Kamal Haasan, Vijay Sethupathi', 'Lokesh Kanagaraj', '2022-06-03', TRUE),
('Oppenheimer', 'Drama', 'English', 180, 'UA', 'The story of J. Robert Oppenheimer.', 'Cillian Murphy, Emily Blunt', 'Christopher Nolan', '2023-07-21', TRUE),
('Pushpa: The Rise', 'Action', 'Telugu', 179, 'UA', 'A coolie rises in red sandalwood smuggling.', 'Allu Arjun, Rashmika Mandanna', 'Sukumar', '2021-12-17', TRUE);

-- ============================================================
-- Seed Data: Snacks (16 items)
-- ============================================================
INSERT INTO snacks (name, price, category, description, is_available) VALUES
('Popcorn (Regular)', 120.00, 'Snacks', 'Classic buttered popcorn', TRUE),
('Popcorn (Large)', 180.00, 'Snacks', 'Large buttered popcorn with extra butter', TRUE),
('Popcorn (Caramel)', 220.00, 'Snacks', 'Sweet caramel popcorn', TRUE),
('Coca Cola', 90.00, 'Beverages', 'Chilled 300ml', TRUE),
('Sprite', 90.00, 'Beverages', 'Chilled 300ml', TRUE),
('Masala Fries', 150.00, 'Food', 'Crispy masala fries with dip', TRUE),
('Nachos with Cheese', 200.00, 'Food', 'Loaded nachos with cheese sauce', TRUE),
('Veg Burger', 180.00, 'Food', 'Grilled veg patty with cheese', TRUE),
('Chicken Burger', 220.00, 'Food', 'Crispy chicken patty with cheese', TRUE),
('Hot Dog', 160.00, 'Food', 'Classic hot dog with mustard', TRUE),
('Ice Cream (Vanilla)', 100.00, 'Dessert', 'Vanilla bean ice cream', TRUE),
('Ice Cream (Chocolate)', 100.00, 'Dessert', 'Rich chocolate ice cream', TRUE),
('Choco Bar', 80.00, 'Dessert', 'Chocolate coated ice cream bar', TRUE),
('Coffee', 80.00, 'Beverages', 'Hot cappuccino', TRUE),
('Tea', 50.00, 'Beverages', 'Masala chai', TRUE),
('Samosa', 60.00, 'Snacks', '2 pieces with chutney', TRUE);

-- ============================================================
-- Spring Boot application.properties reference:
-- spring.datasource.url=jdbc:mysql://localhost:3306/cinenova_multiplex
-- spring.datasource.username=root
-- spring.datasource.password=yourpassword
-- spring.jpa.hibernate.ddl-auto=validate
-- ============================================================
