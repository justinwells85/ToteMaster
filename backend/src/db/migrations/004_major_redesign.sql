-- Migration: 004_major_redesign
-- Description: Add Tote IDs, Locations, Tags, and Photos
-- Created: 2025-11-19

-- Step 1: Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  room VARCHAR(100),
  position VARCHAR(100),
  specific_reference VARCHAR(200),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- Step 2: Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Step 3: Create tote_tags junction table
CREATE TABLE IF NOT EXISTS tote_tags (
  tote_id VARCHAR(255) REFERENCES totes(id) ON DELETE CASCADE,
  tag_id VARCHAR(255) REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tote_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_tote_tags_tote_id ON tote_tags(tote_id);
CREATE INDEX IF NOT EXISTS idx_tote_tags_tag_id ON tote_tags(tag_id);

-- Step 4: Create item_tags junction table
CREATE TABLE IF NOT EXISTS item_tags (
  item_id VARCHAR(255) REFERENCES items(id) ON DELETE CASCADE,
  tag_id VARCHAR(255) REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (item_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);

-- Step 5: Create sequence for tote numbers
CREATE SEQUENCE IF NOT EXISTS tote_number_seq START 1;

-- Step 6: Alter totes table
-- Add tote_number column
ALTER TABLE totes ADD COLUMN IF NOT EXISTS tote_number INTEGER;

-- Backfill existing totes with sequential numbers
DO $$
DECLARE
  rec RECORD;
  counter INTEGER := 1;
BEGIN
  FOR rec IN SELECT id FROM totes ORDER BY created_at
  LOOP
    UPDATE totes SET tote_number = counter WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;

  -- Set sequence to continue from last number
  PERFORM setval('tote_number_seq', counter);
END $$;

-- Make tote_number NOT NULL and add unique constraint
ALTER TABLE totes ALTER COLUMN tote_number SET NOT NULL;
ALTER TABLE totes ADD CONSTRAINT totes_tote_number_unique UNIQUE (tote_number);

-- Make name optional (can be NULL)
ALTER TABLE totes ALTER COLUMN name DROP NOT NULL;

-- Add location_id foreign key
ALTER TABLE totes ADD COLUMN IF NOT EXISTS location_id VARCHAR(255) REFERENCES locations(id) ON DELETE SET NULL;

-- Add photos array column for totes
ALTER TABLE totes ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Create index for location_id
CREATE INDEX IF NOT EXISTS idx_totes_location_id ON totes(location_id);
CREATE INDEX IF NOT EXISTS idx_totes_tote_number ON totes(tote_number);

-- Step 7: Alter items table
-- Add photos array column for items (replace single photo_url)
ALTER TABLE items ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Step 8: Create triggers for new tables
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create views
CREATE OR REPLACE VIEW totes_with_details AS
SELECT
  t.*,
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
GROUP BY t.id, l.name, l.room, l.position, l.specific_reference;

CREATE OR REPLACE VIEW items_with_details AS
SELECT
  i.*,
  t.tote_number AS tote_number,
  t.name AS tote_name,
  t.location_id AS tote_location_id,
  l.name AS location_name,
  ARRAY_AGG(DISTINCT tag.name) FILTER (WHERE tag.name IS NOT NULL) AS tag_names
FROM items i
LEFT JOIN totes t ON i.tote_id = t.id
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN item_tags it ON it.item_id = i.id
LEFT JOIN tags tag ON tag.id = it.tag_id
GROUP BY i.id, t.tote_number, t.name, t.location_id, l.name;

-- Comments
COMMENT ON TABLE locations IS 'Physical locations where totes are stored';
COMMENT ON TABLE tags IS 'Reusable tags for categorizing totes and items';
COMMENT ON TABLE tote_tags IS 'Junction table linking totes to tags';
COMMENT ON TABLE item_tags IS 'Junction table linking items to tags';
COMMENT ON COLUMN totes.tote_number IS 'Sequential integer ID for the tote';
COMMENT ON COLUMN totes.photos IS 'Array of photo URLs for the tote';
COMMENT ON COLUMN items.photos IS 'Array of photo URLs for the item';
