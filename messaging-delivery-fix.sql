-- MESSAGING DELIVERY & REALTIME ROBUSTNESS FIX
-- Run this in your Supabase SQL Editor

-- 1. Ensure Replica Identity is FULL for messaging
-- This ensures that Supabase Realtime has all the data it needs for events
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- 2. Ensure tables are in the Realtime Publication
-- We drop and re-add to be 100% sure
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.messages;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- 3. Simplified but secure RLS for Messages
-- Using a direct join for faster RLS evaluation in Realtime
DROP POLICY IF EXISTS "Users can read convos messages" ON public.messages;
CREATE POLICY "Users can read messages in their conversations"
ON public.messages FOR SELECT
USING (
    sender_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = messages.conversation_id 
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

-- 4. Enable Realtime on the table itself (Postgres Level)
-- Some older Supabase projects need this
ALTER TABLE public.messages SET (replica_identity = 'full');

-- 5. Reload cache
NOTIFY pgrst, 'reload schema';
