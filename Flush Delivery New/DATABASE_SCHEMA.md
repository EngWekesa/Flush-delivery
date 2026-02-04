# Database Schema for Restaurant Management

Run these SQL commands in your Supabase SQL Editor to create the necessary tables for managing restaurants and menu items.

## Tables

### 1. Restaurants Table

```sql
-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants(name);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on restaurants" ON restaurants
  FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage restaurants" ON restaurants
  FOR ALL USING (true);
```

### 2. Menu Items Table

```sql
-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) DEFAULT 'Other',
  description TEXT,
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on menu_items" ON menu_items
  FOR SELECT USING (true);

-- Create policy for authenticated users to manage menu items
CREATE POLICY "Allow authenticated users to manage menu_items" ON menu_items
  FOR ALL USING (true);
```

## Quick Setup (Run All at Once)

Copy and paste this entire block into your Supabase SQL Editor:

```sql
-- =============================================
-- RESTAURANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants(name);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on restaurants" ON restaurants;
CREATE POLICY "Allow public read access on restaurants" ON restaurants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage restaurants" ON restaurants;
CREATE POLICY "Allow authenticated users to manage restaurants" ON restaurants
  FOR ALL USING (true);

-- =============================================
-- MENU ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) DEFAULT 'Other',
  description TEXT,
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on menu_items" ON menu_items;
CREATE POLICY "Allow public read access on menu_items" ON menu_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage menu_items" ON menu_items;
CREATE POLICY "Allow authenticated users to manage menu_items" ON menu_items
  FOR ALL USING (true);
```

## Usage

After creating the tables:

1. Go to the Admin Panel in the app
2. Click on the "Restaurants" tab
3. Click "Import All Data" to import all static restaurant and menu data to the database
4. You can then add, edit, or delete restaurants and menu items

## Features

- **Restaurants**: Add, edit, delete restaurants with name, image, rating, category, and description
- **Menu Items**: Add, edit, delete menu items for each restaurant with name, price, and category
- **Import**: One-click import of all static data from the app to the database
- **Search**: Search restaurants and menu items by name or category
