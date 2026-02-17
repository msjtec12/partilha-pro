
-- Create encomendas table
CREATE TABLE public.encomendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cliente TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Fazer', 'Entregar', 'Entregue', 'Recebido')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.encomendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own encomendas" ON public.encomendas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own encomendas" ON public.encomendas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own encomendas" ON public.encomendas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own encomendas" ON public.encomendas FOR DELETE USING (auth.uid() = user_id);

-- Create despesas table
CREATE TABLE public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'Outros' CHECK (categoria IN ('Produtos', 'Funcionários', 'Outros')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own despesas" ON public.despesas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own despesas" ON public.despesas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own despesas" ON public.despesas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own despesas" ON public.despesas FOR DELETE USING (auth.uid() = user_id);

-- Create fechamentos table
CREATE TABLE public.fechamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  periodo TEXT NOT NULL,
  lucro_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  minha_parte NUMERIC(10,2) NOT NULL DEFAULT 0,
  parte_loja NUMERIC(10,2) NOT NULL DEFAULT 0,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fechamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fechamentos" ON public.fechamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fechamentos" ON public.fechamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fechamentos" ON public.fechamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fechamentos" ON public.fechamentos FOR DELETE USING (auth.uid() = user_id);
