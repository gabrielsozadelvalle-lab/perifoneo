
-- Ciudades table
CREATE TABLE public.ciudades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ciudades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ciudades" ON public.ciudades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ciudades" ON public.ciudades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ciudades" ON public.ciudades FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete ciudades" ON public.ciudades FOR DELETE TO authenticated USING (true);

-- Seed Matagalpa
INSERT INTO public.ciudades (nombre) VALUES ('Matagalpa');

-- Clientes table
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  ciudad_id UUID NOT NULL REFERENCES public.ciudades(id) ON DELETE RESTRICT,
  monto_mensual NUMERIC(10,2) NOT NULL DEFAULT 0,
  dia_pago INTEGER NOT NULL DEFAULT 1 CHECK (dia_pago >= 1 AND dia_pago <= 31),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clientes" ON public.clientes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clientes" ON public.clientes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clientes" ON public.clientes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Servicios contratados per client
CREATE TABLE public.servicios_contratados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('activacion', 'perifoneo')),
  cantidad_mensual INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.servicios_contratados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own servicios_contratados" ON public.servicios_contratados FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes WHERE clientes.id = servicios_contratados.cliente_id AND clientes.user_id = auth.uid()));
CREATE POLICY "Users can insert own servicios_contratados" ON public.servicios_contratados FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.clientes WHERE clientes.id = servicios_contratados.cliente_id AND clientes.user_id = auth.uid()));
CREATE POLICY "Users can update own servicios_contratados" ON public.servicios_contratados FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes WHERE clientes.id = servicios_contratados.cliente_id AND clientes.user_id = auth.uid()));
CREATE POLICY "Users can delete own servicios_contratados" ON public.servicios_contratados FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes WHERE clientes.id = servicios_contratados.cliente_id AND clientes.user_id = auth.uid()));

-- Servicios realizados (log of each service performed)
CREATE TABLE public.servicios_realizados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('activacion', 'perifoneo')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.servicios_realizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own servicios_realizados" ON public.servicios_realizados FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes WHERE clientes.id = servicios_realizados.cliente_id AND clientes.user_id = auth.uid()));
CREATE POLICY "Users can insert own servicios_realizados" ON public.servicios_realizados FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.clientes WHERE clientes.id = servicios_realizados.cliente_id AND clientes.user_id = auth.uid()));
CREATE POLICY "Users can update own servicios_realizados" ON public.servicios_realizados FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes WHERE clientes.id = servicios_realizados.cliente_id AND clientes.user_id = auth.uid()));
CREATE POLICY "Users can delete own servicios_realizados" ON public.servicios_realizados FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes WHERE clientes.id = servicios_realizados.cliente_id AND clientes.user_id = auth.uid()));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
