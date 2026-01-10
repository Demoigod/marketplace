-- FIXED MESSAGING DELIVERY SQL
-- This script uses standard syntax compatible with all PostgreSQL versions.

-- 1. Ensure Replica Identity is FULL
-- This is critical for real-time updates to contain all data
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- 2. Add tables to Realtime Publication
-- Note: If you get a "is already a member" error, you can safely ignore it.
-- This command ensures the tables are participating in real-time broadcasts.
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

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
