-- Fix: Ensure 'custo' column exists in 'encomendas' table
-- This was missing from the initial migration, causing saves to fail

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'encomendas' 
        AND column_name = 'custo'
    ) THEN
        ALTER TABLE public.encomendas ADD COLUMN custo NUMERIC(10,2) NOT NULL DEFAULT 0;
    END IF;
END $$;
