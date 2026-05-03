-- Estado de factura
CREATE TYPE public.factura_estado AS ENUM ('pendiente', 'pagado', 'vencido');

CREATE TABLE public.facturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio INTEGER NOT NULL CHECK (anio BETWEEN 2020 AND 2100),
  monto NUMERIC NOT NULL DEFAULT 0,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  fecha_pago DATE,
  estado public.factura_estado NOT NULL DEFAULT 'pendiente',
  metodo_pago TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, mes, anio)
);

ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own facturas"
ON public.facturas FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM clientes WHERE clientes.id = facturas.cliente_id AND clientes.user_id = auth.uid()));

CREATE POLICY "Users can insert own facturas"
ON public.facturas FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM clientes WHERE clientes.id = facturas.cliente_id AND clientes.user_id = auth.uid()));

CREATE POLICY "Users can update own facturas"
ON public.facturas FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM clientes WHERE clientes.id = facturas.cliente_id AND clientes.user_id = auth.uid()));

CREATE POLICY "Users can delete own facturas"
ON public.facturas FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM clientes WHERE clientes.id = facturas.cliente_id AND clientes.user_id = auth.uid()));

CREATE TRIGGER update_facturas_updated_at
BEFORE UPDATE ON public.facturas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_facturas_cliente ON public.facturas(cliente_id);
CREATE INDEX idx_facturas_periodo ON public.facturas(anio, mes);