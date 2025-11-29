-- Migration: 005_refactor_to_integer_ids
-- Description: Refactor totes and items to use integer primary keys
--              Remove name field from totes
-- Created: 2025-11-21

-- Step 0: Drop views first (they depend on constraints we need to modify)
DROP VIEW IF EXISTS totes_with_details;
DROP VIEW IF EXISTS items_with_details;

-- Step 1: Create sequence for item numbers
CREATE SEQUENCE IF NOT EXISTS item_number_seq START 1;

-- Step 2: Add item_number column to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS item_number INTEGER;

-- Backfill existing items with sequential numbers
DO $$
DECLARE
  rec RECORD;
  counter INTEGER := 1;
BEGIN
  FOR rec IN SELECT id FROM items ORDER BY created_at
  LOOP
    UPDATE items SET item_number = counter WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;

  -- Set sequence to continue from last number
  PERFORM setval('item_number_seq', counter);
END $$;

-- Make item_number NOT NULL and add unique constraint
ALTER TABLE items ALTER COLUMN item_number SET NOT NULL;
ALTER TABLE items ADD CONSTRAINT items_item_number_unique UNIQUE (item_number);

-- Step 3: Add temporary columns to store integer references
ALTER TABLE items ADD COLUMN IF NOT EXISTS tote_number_ref INTEGER;
ALTER TABLE tote_tags ADD COLUMN IF NOT EXISTS tote_number_ref INTEGER;
ALTER TABLE item_tags ADD COLUMN IF NOT EXISTS item_number_ref INTEGER;

-- Step 4: Populate the temporary columns
-- Map tote_id (string) to tote_number (integer)
UPDATE items i
SET tote_number_ref = t.tote_number
FROM totes t
WHERE i.tote_id = t.id;

-- Map tote_tags tote_id to tote_number
UPDATE tote_tags tt
SET tote_number_ref = t.tote_number
FROM totes t
WHERE tt.tote_id = t.id;

-- Map item_tags item_id to item_number
UPDATE item_tags it
SET item_number_ref = i.item_number
FROM items i
WHERE it.item_id = i.id;

-- Step 5: Drop old foreign key constraints
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_tote_id_fkey;
ALTER TABLE tote_tags DROP CONSTRAINT IF EXISTS tote_tags_tote_id_fkey;
ALTER TABLE item_tags DROP CONSTRAINT IF EXISTS item_tags_item_id_fkey;

-- Step 6: Drop old primary keys and unique constraints
ALTER TABLE totes DROP CONSTRAINT IF EXISTS totes_pkey;
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_pkey;
ALTER TABLE tote_tags DROP CONSTRAINT IF EXISTS tote_tags_pkey;
ALTER TABLE item_tags DROP CONSTRAINT IF EXISTS item_tags_pkey;

-- Step 7: Rename/drop old ID columns and rename new ones
ALTER TABLE items DROP COLUMN IF EXISTS tote_id;
ALTER TABLE items RENAME COLUMN tote_number_ref TO tote_id;

ALTER TABLE tote_tags DROP COLUMN IF EXISTS tote_id;
ALTER TABLE tote_tags RENAME COLUMN tote_number_ref TO tote_id;

ALTER TABLE item_tags DROP COLUMN IF EXISTS item_id;
ALTER TABLE item_tags RENAME COLUMN item_number_ref TO item_id;

-- Drop old string-based id columns and use integer columns as primary keys
ALTER TABLE totes DROP COLUMN IF EXISTS id;
ALTER TABLE totes ADD PRIMARY KEY (tote_number);
ALTER TABLE totes RENAME COLUMN tote_number TO id;

ALTER TABLE items DROP COLUMN IF EXISTS id;
ALTER TABLE items ADD PRIMARY KEY (item_number);
ALTER TABLE items RENAME COLUMN item_number TO id;

-- Step 8: Add new foreign key constraints with integer references
ALTER TABLE items
  ADD CONSTRAINT items_tote_id_fkey
  FOREIGN KEY (tote_id)
  REFERENCES totes(id)
  ON DELETE SET NULL;

ALTER TABLE tote_tags
  ADD CONSTRAINT tote_tags_tote_id_fkey
  FOREIGN KEY (tote_id)
  REFERENCES totes(id)
  ON DELETE CASCADE;

ALTER TABLE item_tags
  ADD CONSTRAINT item_tags_item_id_fkey
  FOREIGN KEY (item_id)
  REFERENCES items(id)
  ON DELETE CASCADE;

-- Step 9: Re-create primary keys for junction tables
ALTER TABLE tote_tags ADD PRIMARY KEY (tote_id, tag_id);
ALTER TABLE item_tags ADD PRIMARY KEY (item_id, tag_id);

-- Step 10: Drop the name column from totes
ALTER TABLE totes DROP COLUMN IF EXISTS name;

-- Step 11: Update indexes
DROP INDEX IF EXISTS idx_totes_tote_number;
CREATE INDEX IF NOT EXISTS idx_totes_id ON totes(id);
CREATE INDEX IF NOT EXISTS idx_items_id ON items(id);
CREATE INDEX IF NOT EXISTS idx_items_tote_id ON items(tote_id);
CREATE INDEX IF NOT EXISTS idx_tote_tags_tote_id ON tote_tags(tote_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);

-- Step 12: Recreate views with updated schema
DROP VIEW IF EXISTS totes_with_details;
CREATE OR REPLACE VIEW totes_with_details AS
SELECT
  t.id,
  t.location,
  t.location_id,
  t.description,
  t.color,
  t.photos,
  t.user_id,
  t.created_at,
  t.updated_at,
  l.name AS location_name,
  l.room AS location_room,
  l.position AS location_position,
  l.specific_reference AS location_reference,
  COUNT(DISTINCT i.id) AS item_count,
  ARRAY_AGG(DISTINCT tag.name) FILTER (WHERE tag.name IS NOT NULL) AS tag_names
FROM totes t
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN items i ON i.tote_id = t.id
LEFT JOIN tote_tags tt ON tt.tote_id = t.id
LEFT JOIN tags tag ON tag.id = tt.tag_id
GROUP BY t.id, t.location, t.location_id, t.description, t.color, t.photos,
         t.user_id, t.created_at, t.updated_at,
         l.name, l.room, l.position, l.specific_reference;

DROP VIEW IF EXISTS items_with_details;
CREATE OR REPLACE VIEW items_with_details AS
SELECT
  i.id,
  i.name,
  i.description,
  i.category,
  i.tote_id,
  i.quantity,
  i.condition,
  i.tags,
  i.photos,
  i.user_id,
  i.created_at,
  i.updated_at,
  t.id AS tote_number,
  t.location_id AS tote_location_id,
  l.name AS location_name,
  ARRAY_AGG(DISTINCT tag.name) FILTER (WHERE tag.name IS NOT NULL) AS tag_names
FROM items i
LEFT JOIN totes t ON i.tote_id = t.id
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN item_tags it ON it.item_id = i.id
LEFT JOIN tags tag ON tag.id = it.tag_id
GROUP BY i.id, i.name, i.description, i.category, i.tote_id, i.quantity,
         i.condition, i.tags, i.photos, i.user_id, i.created_at, i.updated_at,
         t.id, t.location_id, l.name;

-- Step 13: Update column comments
COMMENT ON COLUMN totes.id IS 'Integer primary key for the tote';
COMMENT ON COLUMN items.id IS 'Integer primary key for the item';
COMMENT ON COLUMN items.tote_id IS 'Foreign key to totes.id (integer)';
