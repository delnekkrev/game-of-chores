-- Bulk insert all 96 chore tasks
-- Copy and paste this into Supabase SQL Editor

INSERT INTO tasks (name, category, difficulty, points) VALUES
-- Self Care (10 tasks)
('Shower/Bath', 'Self Care', 'Normal', 10),
('Brush teeth (morning)', 'Self Care', 'Easy', 5),
('Brush teeth (night)', 'Self Care', 'Easy', 5),
('Floss teeth', 'Self Care', 'Normal', 10),
('Complete skincare routine', 'Self Care', 'Normal', 10),
('Take vitamins/supplements', 'Self Care', 'Easy', 5),
('Do a workout/exercise (30 min)', 'Self Care', 'Medium', 20),
('Meditation or relaxation (15 min)', 'Self Care', 'Normal', 10),
('Get a haircut', 'Self Care', 'Medium', 20),
('Wash hands properly', 'Self Care', 'Easy', 5),

-- House - Kitchen & Dining (7 tasks)
('Do the dishes', 'House - Kitchen & Dining', 'Normal', 10),
('Wipe down kitchen counters', 'House - Kitchen & Dining', 'Normal', 10),
('Wipe down dining table', 'House - Kitchen & Dining', 'Easy', 5),
('Sweep kitchen floors', 'House - Kitchen & Dining', 'Normal', 10),
('Clean inside refrigerator', 'House - Kitchen & Dining', 'Hard', 40),
('Organize kitchen cabinets', 'House - Kitchen & Dining', 'Medium', 20),
('Clean kitchen appliances (stovetop, microwave)', 'House - Kitchen & Dining', 'Medium', 20),

-- House - Bathrooms & Bedrooms (9 tasks)
('Clean toilet', 'House - Bathrooms & Bedrooms', 'Normal', 10),
('Clean sink/vanity', 'House - Bathrooms & Bedrooms', 'Normal', 10),
('Clean shower/tub', 'House - Bathrooms & Bedrooms', 'Medium', 20),
('Clean bathroom floors', 'House - Bathrooms & Bedrooms', 'Normal', 10),
('Organize bathroom cabinets', 'House - Bathrooms & Bedrooms', 'Medium', 20),
('Clean bedroom/organize', 'House - Bathrooms & Bedrooms', 'Medium', 20),
('Vacuum bedroom', 'House - Bathrooms & Bedrooms', 'Normal', 10),
('Wash bed sheets', 'House - Bathrooms & Bedrooms', 'Normal', 10),
('Organize closet', 'House - Bathrooms & Bedrooms', 'Hard', 40),

-- House - General Cleaning (10 tasks)
('Vacuum living room', 'House - General Cleaning', 'Normal', 10),
('Vacuum all bedrooms', 'House - General Cleaning', 'Medium', 20),
('Mop floors (main area)', 'House - General Cleaning', 'Hard', 40),
('Mop all floors', 'House - General Cleaning', 'Extreme', 80),
('Deep clean kitchen', 'House - General Cleaning', 'Intense', 160),
('Deep clean bathroom', 'House - General Cleaning', 'Intense', 160),
('Tidy living room', 'House - General Cleaning', 'Normal', 10),
('Do a load of laundry', 'House - General Cleaning', 'Medium', 20),
('Fold and put away laundry', 'House - General Cleaning', 'Medium', 20),
('Iron clothes', 'House - General Cleaning', 'Medium', 20),

-- House - Additional (8 tasks)
('Take out trash/recycling', 'House - Additional', 'Easy', 5),
('Clean basement/garage area', 'House - Additional', 'Hard', 40),
('Organize garage', 'House - Additional', 'Extreme', 80),
('Dust furniture and shelves', 'House - Additional', 'Normal', 10),
('Clean windows (inside)', 'House - Additional', 'Medium', 20),
('Clean windows (full - inside/outside)', 'House - Additional', 'Hard', 40),
('Wipe down light switches/doorknobs', 'House - Additional', 'Easy', 5),
('Vacuum under furniture/couch', 'House - Additional', 'Medium', 20),

-- Yard Work (12 tasks)
('Water outdoor plants', 'Yard Work', 'Easy', 5),
('Rake leaves', 'Yard Work', 'Medium', 20),
('Mow lawn', 'Yard Work', 'Hard', 40),
('Edge lawn/trim borders', 'Yard Work', 'Normal', 10),
('Pull weeds from garden', 'Yard Work', 'Normal', 10),
('Pull weeds (large area)', 'Yard Work', 'Medium', 20),
('Trim hedges/bushes', 'Yard Work', 'Hard', 40),
('Power wash deck/patio', 'Yard Work', 'Hard', 40),
('Trim tree branches', 'Yard Work', 'Medium', 20),
('Pressure wash driveway', 'Yard Work', 'Intense', 160),
('Mulch garden beds', 'Yard Work', 'Hard', 40),
('Garden bed deep clean', 'Yard Work', 'Extreme', 80),

-- Plant Care (10 tasks)
('Water indoor plants', 'Plant Care', 'Easy', 5),
('Check soil moisture', 'Plant Care', 'Easy', 5),
('Remove dead leaves', 'Plant Care', 'Normal', 10),
('Fertilize plants', 'Plant Care', 'Normal', 10),
('Repot a plant', 'Plant Care', 'Medium', 20),
('Mist plant leaves', 'Plant Care', 'Easy', 5),
('Wipe down plant leaves', 'Plant Care', 'Normal', 10),
('Move plant to better light', 'Plant Care', 'Easy', 5),
('Check plants for pests', 'Plant Care', 'Normal', 10),
('Propagate a cutting', 'Plant Care', 'Medium', 20),

-- Cat Care (10 tasks)
('Feed cat (daily)', 'Cat Care', 'Easy', 5),
('Refill water bowl', 'Cat Care', 'Easy', 5),
('Clean litter box', 'Cat Care', 'Normal', 10),
('Brush cat', 'Cat Care', 'Normal', 10),
('Play with cat (20 min)', 'Cat Care', 'Normal', 10),
('Clean cat bedding', 'Cat Care', 'Medium', 20),
('Trim cat nails', 'Cat Care', 'Medium', 20),
('Give cat medication', 'Cat Care', 'Medium', 20),
('Cat vet appointment', 'Cat Care', 'Hard', 40),
('Deep clean litter area', 'Cat Care', 'Hard', 40),

-- Dog Care (10 tasks)
('Feed dog (daily)', 'Dog Care', 'Easy', 5),
('Refill water bowl', 'Dog Care', 'Easy', 5),
('Walk dog (30 min)', 'Dog Care', 'Normal', 10),
('Play with dog (20 min)', 'Dog Care', 'Normal', 10),
('Brush dog', 'Dog Care', 'Medium', 20),
('Clean dog bedding', 'Dog Care', 'Medium', 20),
('Give dog a bath', 'Dog Care', 'Extreme', 80),
('Dog grooming/nail trim', 'Dog Care', 'Hard', 40),
('Dog vet appointment', 'Dog Care', 'Hard', 40),
('Clean dog toys', 'Dog Care', 'Normal', 10),

-- Gecko Care (10 tasks)
('Feed gecko (dusted crickets)', 'Gecko Care', 'Easy', 5),
('Refill water (misting)', 'Gecko Care', 'Easy', 5),
('Spot clean enclosure', 'Gecko Care', 'Normal', 10),
('Check humidity levels', 'Gecko Care', 'Easy', 5),
('Check temperature', 'Gecko Care', 'Easy', 5),
('Mist enclosure', 'Gecko Care', 'Easy', 5),
('Clean decorations/hides', 'Gecko Care', 'Normal', 10),
('Full enclosure clean', 'Gecko Care', 'Medium', 20),
('Gecko vet checkup', 'Gecko Care', 'Hard', 40),
('Replace substrate/bedding', 'Gecko Care', 'Medium', 20);
