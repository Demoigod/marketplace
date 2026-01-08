-- Campus Market Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Marketplace Items table
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('electronics', 'books', 'furniture', 'services', 'clothing')),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deleted')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace items
CREATE POLICY "Anyone can view active items" ON public.marketplace_items
  FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can insert items" ON public.marketplace_items
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own items" ON public.marketplace_items
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own items" ON public.marketplace_items
  FOR DELETE USING (auth.uid() = seller_id);

-- Free Resources table
CREATE TABLE public.free_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exam', 'textbook', 'notes')),
  course TEXT NOT NULL,
  year INTEGER CHECK (year >= 2000 AND year <= 2030),
  description TEXT,
  file_url TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.free_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resources
CREATE POLICY "Anyone can view resources" ON public.free_resources
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload resources" ON public.free_resources
  FOR INSERT WITH CHECK (auth.uid() = uploader_id);

-- Purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.marketplace_items(id) ON DELETE SET NULL,
  item_title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchases
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Downloads table
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.free_resources(id) ON DELETE CASCADE,
  download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for downloads
CREATE POLICY "Users can view own downloads" ON public.downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create downloads" ON public.downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved Items table
CREATE TABLE public.saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved items
CREATE POLICY "Users can manage own saved items" ON public.saved_items
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_marketplace_items_seller ON public.marketplace_items(seller_id);
CREATE INDEX idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX idx_marketplace_items_status ON public.marketplace_items(status);
CREATE INDEX idx_free_resources_type ON public.free_resources(type);
CREATE INDEX idx_free_resources_course ON public.free_resources(course);
CREATE INDEX idx_purchases_buyer ON public.purchases(buyer_id);
CREATE INDEX idx_downloads_user ON public.downloads(user_id);
CREATE INDEX idx_saved_items_user ON public.saved_items(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to marketplace_items
CREATE TRIGGER update_marketplace_items_updated_at BEFORE UPDATE ON public.marketplace_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_item_views(item_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.marketplace_items
  SET views = views + 1
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_resource_downloads(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.free_resources
  SET downloads = downloads + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
