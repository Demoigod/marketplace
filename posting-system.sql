-- STANDARDIZED POSTING SYSTEM SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. ITEMS TABLE
-- Stores user marketplace listings
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    images TEXT[] DEFAULT '{}', -- Array of image URLs or storage references
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. SAVED ITEMS TABLE
-- Tracks user bookmarks
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, item_id)
);

-- 3. SECURITY (Row Level Security)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Items Policies
CREATE POLICY "Anyone can view items"
    ON public.items FOR SELECT
    USING (true);

CREATE POLICY "Users can only create items for themselves"
    ON public.items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their own items"
    ON public.items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their own items"
    ON public.items FOR DELETE
    USING (auth.uid() = user_id);

-- Saved Items Policies
CREATE POLICY "Users can view their own saved items"
    ON public.saved_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only save items for themselves"
    ON public.saved_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only unsave their own items"
    ON public.saved_items FOR DELETE
    USING (auth.uid() = user_id);

-- 4. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
