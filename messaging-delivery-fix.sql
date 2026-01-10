-- SILENT MESSAGING DELIVERY FIX
-- This script safely configures Realtime without throwing "already member" errors.

-- 1. Ensure Replica Identity is FULL
-- Critical for receiving data in Realtime events
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- 2. Safely add tables to Realtime Publication
-- This DO block avoids the "already a member" error
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'conversations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    END IF;
END $$;

-- 3. Optimized RLS for Realtime Performance
DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.messages;
CREATE POLICY "Users can read messages in their conversations"
ON public.messages FOR SELECT
USING (
    auth.uid() = sender_id OR 
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = messages.conversation_id 
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

-- 4. Refresh Cache
NOTIFY pgrst, 'reload schema';
