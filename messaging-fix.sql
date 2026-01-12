-- MASTER MESSAGING FIX
-- 1. Unify Schema (Rename body to content if needed)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages' 
        AND column_name = 'body'
    ) THEN
        ALTER TABLE public.messages RENAME COLUMN body TO content;
    END IF;
END $$;

-- 2. Update Users table RLS (Allow viewing names)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view each other's profiles" ON public.users;
CREATE POLICY "Users can view each other's profiles" ON public.users
    FOR SELECT USING (true);

-- 3. Update Conversations table RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can only read conversations they are part of" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can only create conversations they are part of" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 4. Update Messages table RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can read messages from their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (auth.uid() = user1_id OR auth.uid() = user2_id)
        )
    );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can only send messages as themselves" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
CREATE POLICY "Users can mark messages as read" ON public.messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id
            AND (auth.uid() = user1_id OR auth.uid() = user2_id)
        )
    );

-- 5. Realtime (Idempotent)
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

-- 6. Trigger for updated_at (if missing)
CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql security definer;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_update_conversation') THEN
        CREATE TRIGGER on_update_conversation
            BEFORE UPDATE ON public.conversations
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    END IF;
END $$;

-- Notify
NOTIFY pgrst, 'reload schema';
