-- SECURE MESSAGING SYSTEM V2
-- Implements 1-to-1 student marketplace messaging

-- 0. Clean up old schema to ensure columns are correct
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- 1. Conversations Table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.market_listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure only one conversation per buyer + seller + listing
    CONSTRAINT unique_listing_conversation UNIQUE (listing_id, buyer_id, seller_id),
    -- Prevent messaging self
    CONSTRAINT cannot_message_self CHECK (buyer_id <> seller_id)
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Basic validation
    CONSTRAINT content_or_file CHECK (content IS NOT NULL OR file_url IS NOT NULL)
);

-- 3. Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations Access
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Participants can create conversations" ON public.conversations;
CREATE POLICY "Participants can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages Access
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (auth.uid() = buyer_id OR auth.uid() = seller_id)
        )
    );

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (auth.uid() = buyer_id OR auth.uid() = seller_id)
        )
    );

DROP POLICY IF EXISTS "Participants can mark as read" ON public.messages;
CREATE POLICY "Participants can mark as read" ON public.messages
    FOR UPDATE USING (
        auth.uid() = receiver_id AND
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (auth.uid() = buyer_id OR auth.uid() = seller_id)
        )
    ) WITH CHECK (read_at IS NOT NULL);

-- 4. Automatic update of updated_at on conversations
CREATE OR REPLACE FUNCTION public.refresh_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_sent_update_conv ON public.messages;
CREATE TRIGGER on_message_sent_update_conv
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE PROCEDURE public.refresh_conversation_updated_at();

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 6. Storage Bucket for Chat (Note: Storage policies usually handled via Dashboard but including logic)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false) ON CONFLICT DO NOTHING;

-- Storage RLS: Participant access logic (Requires manual setup in dashboard or more complex SQL)
-- For now, focused on DB schema.

NOTIFY pgrst, 'reload schema';
