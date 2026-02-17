
-- Create produtos table
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own produtos" ON public.produtos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own produtos" ON public.produtos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own produtos" ON public.produtos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own produtos" ON public.produtos FOR DELETE USING (auth.uid() = user_id);

-- Add 'custo' to encomendas if not exists (redundancy check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='encomendas' AND column_name='custo') THEN
        ALTER TABLE public.encomendas ADD COLUMN custo NUMERIC(10,2) NOT NULL DEFAULT 0;
    END IF;
END $$;
