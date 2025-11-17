-- Migration: 001_initial_schema
-- Description: Create initial database schema for Tote Master
-- Created: 2025-11-17

-- Create totes table
CREATE TABLE IF NOT EXISTS totes (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  description TEXT,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tote_id VARCHAR(255),
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor', 'damaged')),
  tags TEXT[], -- PostgreSQL array for tags
  photo_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tote_id) REFERENCES totes(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_tote_id ON items(tote_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_tags ON items USING GIN(tags); -- GIN index for array searching
CREATE INDEX IF NOT EXISTS idx_totes_location ON totes(location);
CREATE INDEX IF NOT EXISTS idx_totes_name ON totes(name);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_totes_updated_at
  BEFORE UPDATE ON totes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for items with tote information
CREATE OR REPLACE VIEW items_with_totes AS
SELECT
  i.*,
  t.name AS tote_name,
  t.location AS tote_location,
  t.color AS tote_color
FROM items i
LEFT JOIN totes t ON i.tote_id = t.id;

-- Comments for documentation
COMMENT ON TABLE totes IS 'Storage containers/totes for organizing items';
COMMENT ON TABLE items IS 'Individual items stored in totes';
COMMENT ON COLUMN items.tags IS 'Array of tags for categorizing and searching items';
COMMENT ON COLUMN items.condition IS 'Physical condition of the item';
COMMENT ON VIEW items_with_totes IS 'Items joined with their tote information for easier querying';
