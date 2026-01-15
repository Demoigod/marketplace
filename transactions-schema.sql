-- Create transactions table to track purchases
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) NOT NULL,
    listing_id UUID REFERENCES public.market_listings(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    payment_method TEXT DEFAULT 'card', 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Buyers can view their own transactions
CREATE POLICY "Buyers can view their transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = buyer_id);

-- Sellers can view transactions for their items
CREATE POLICY "Sellers can view their sales" 
ON public.transactions FOR SELECT 
USING (auth.uid() = seller_id);

-- Buyers can insert new transactions (purchase)
CREATE POLICY "Buyers can create transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- Only system/triggers or admins might update status normally, but for MVP we might allow buyer to init?
-- Actually, usually status is updated by backend. For MVP simulation:
-- Let's allow buyer/seller to update for now if needed, or rely on insert 'completed' for MVP.

-- Add Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_transaction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_timestamp
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE update_transaction_timestamp();

-- Create View for easier querying if needed (Optional)
