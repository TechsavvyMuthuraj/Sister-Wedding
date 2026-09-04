-- ==============================================================================
-- SISTER WEDDING GALLERY - COMPLETE & UPDATED SUPABASE SQL SCHEMA
-- Bride: M. Manju, B.Sc., B.Ed. | Groom: Dr. M. Muniraj, (PT)., MIAP., D.ACU., CPT.
-- Wedding Date: 17/09/2026 | Venue: Jayam Mahal, Dharmapuri
-- Developer: Muthuraj C, B.E., CSE.
-- Cloud Image Storage: Cloudinary (Cloud: sjfuvq1u)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE: photos (Wedding Gallery Photos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'siblings',
    caption TEXT,
    uploader TEXT NOT NULL,
    image_url TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_category ON public.photos(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts when re-running
DROP POLICY IF EXISTS "Public photos are viewable by everyone" ON public.photos;
DROP POLICY IF EXISTS "Public can upload photos" ON public.photos;
DROP POLICY IF EXISTS "Public can update photo likes" ON public.photos;
DROP POLICY IF EXISTS "Public can update photos" ON public.photos;
DROP POLICY IF EXISTS "Public can delete photos" ON public.photos;

-- RLS Policies for photos:
CREATE POLICY "Public photos are viewable by everyone" 
ON public.photos FOR SELECT 
USING (true);

CREATE POLICY "Public can upload photos" 
ON public.photos FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update photos" 
ON public.photos FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete photos" 
ON public.photos FOR DELETE 
USING (true);


-- ==============================================================================
-- 3. TABLE: wishes (Guestbook Blessings & Wishes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    relation TEXT,
    message TEXT NOT NULL,
    blessing_emoji TEXT DEFAULT '💐',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for wishes
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON public.wishes(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public wishes are viewable by everyone" ON public.wishes;
DROP POLICY IF EXISTS "Public can submit wishes" ON public.wishes;
DROP POLICY IF EXISTS "Public can update wishes" ON public.wishes;
DROP POLICY IF EXISTS "Public can delete wishes" ON public.wishes;

-- RLS Policies for wishes:
CREATE POLICY "Public wishes are viewable by everyone" 
ON public.wishes FOR SELECT 
USING (true);

CREATE POLICY "Public can submit wishes" 
ON public.wishes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update wishes" 
ON public.wishes FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete wishes" 
ON public.wishes FOR DELETE 
USING (true);


-- ==============================================================================
-- 4. TABLE: wedding_settings (Online Sync for Bride & Groom Photos & Details)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wedding_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    bride_name TEXT DEFAULT 'M. Manju',
    bride_qualification TEXT DEFAULT 'B.Sc., B.Ed.',
    bride_photo TEXT,
    groom_name TEXT DEFAULT 'Dr. M. Muniraj',
    groom_qualification TEXT DEFAULT '(PT)., MIAP., D.ACU., CPT.',
    groom_photo TEXT,
    hashtag TEXT DEFAULT '#MunirajWedsManju2026',
    brother_message TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wedding_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.wedding_settings;
DROP POLICY IF EXISTS "Settings can be updated by anyone" ON public.wedding_settings;
DROP POLICY IF EXISTS "Settings can be inserted by anyone" ON public.wedding_settings;
DROP POLICY IF EXISTS "Settings can be updated" ON public.wedding_settings;

-- RLS Policies for wedding_settings:
CREATE POLICY "Settings are viewable by everyone" 
ON public.wedding_settings FOR SELECT 
USING (true);

CREATE POLICY "Settings can be updated by anyone" 
ON public.wedding_settings FOR UPDATE 
USING (true);

CREATE POLICY "Settings can be inserted by anyone" 
ON public.wedding_settings FOR INSERT 
WITH CHECK (true);

-- Insert initial default row if not present
INSERT INTO public.wedding_settings (id, bride_name, groom_name, hashtag)
VALUES ('current', 'M. Manju', 'Dr. M. Muniraj', '#MunirajWedsManju2026')
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 5. STORAGE BUCKET: wedding-photos
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wedding-photos',
    'wedding-photos',
    true,
    52428800, -- 50 MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies:
DROP POLICY IF EXISTS "Public Access to Wedding Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload to Wedding Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete from Wedding Photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Update in Wedding Photos" ON storage.objects;

CREATE POLICY "Public Access to Wedding Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-photos');

CREATE POLICY "Public Upload to Wedding Photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wedding-photos');

CREATE POLICY "Public Delete from Wedding Photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'wedding-photos');

CREATE POLICY "Public Update in Wedding Photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'wedding-photos');


-- ==============================================================================
-- 6. REALTIME SUBSCRIPTIONS (Instant live updates across all family devices)
-- ==============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
    EXCEPTION WHEN duplicate_object THEN
        -- already added
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.wishes;
    EXCEPTION WHEN duplicate_object THEN
        -- already added
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.wedding_settings;
    EXCEPTION WHEN duplicate_object THEN
        -- already added
    END;
END $$;
