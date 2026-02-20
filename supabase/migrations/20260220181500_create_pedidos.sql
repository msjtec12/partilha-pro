
-- Create pedidos table
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cliente TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  custo NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Create policies (safe check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'Users can view own pedidos') THEN
        CREATE POLICY "Users can view own pedidos" ON public.pedidos FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'Users can create own pedidos') THEN
        CREATE POLICY "Users can create own pedidos" ON public.pedidos FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'Users can update own pedidos') THEN
        CREATE POLICY "Users can update own pedidos" ON public.pedidos FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'Users can delete own pedidos') THEN
        CREATE POLICY "Users can delete own pedidos" ON public.pedidos FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
