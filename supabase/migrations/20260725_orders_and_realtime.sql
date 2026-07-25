-- =============================================================
-- SYSPIM MARKET - ESTRUCTURA DE PEDIDOS EN TIEMPO REAL Y TRIGGER DE TOKENS
-- =============================================================

-- 1. Crear extensión para gen_random_uuid si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Función PL/pgSQL para generar un delivery_token único de 6 caracteres (ej: DEL-8F3A29)
CREATE OR REPLACE FUNCTION generate_unique_delivery_token()
RETURNS TRIGGER AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    new_token TEXT;
    done BOOL := FALSE;
    i INT;
BEGIN
    -- Solo generar token si no viene uno definido
    IF NEW.delivery_token IS NULL OR NEW.delivery_token = '' THEN
        WHILE NOT done LOOP
            new_token := 'DEL-';
            FOR i IN 1..6 LOOP
                new_token := new_token || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
            END LOOP;
            
            -- Comprobar si el token ya existe en la tabla orders
            IF NOT EXISTS (SELECT 1 FROM public.orders WHERE delivery_token = new_token) THEN
                done := TRUE;
            END IF;
        END LOOP;
        NEW.delivery_token := new_token;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear la Tabla 'orders'
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_info JSONB NOT NULL, -- { nombre, telefono, direccion, notas }
  items JSONB NOT NULL,         -- [ { id, nombre, cantidad, precio_unitario } ]
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL CHECK (status IN ('pendiente', 'preparando', 'en_camino', 'entregado', 'cancelado')) DEFAULT 'pendiente',
  delivery_token VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Asociar el Trigger a la tabla 'orders' (BEFORE INSERT)
DROP TRIGGER IF EXISTS trg_generate_delivery_token ON public.orders;
CREATE TRIGGER trg_generate_delivery_token
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION generate_unique_delivery_token();

-- 5. Crear Índices para Optimización de Consultas en Alto Tráfico
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON public.orders (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_token ON public.orders (delivery_token);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acceso completo a pedidos" ON public.orders;
CREATE POLICY "Permitir acceso completo a pedidos" 
ON public.orders FOR ALL 
USING (true) 
WITH CHECK (true);

-- 7. Habilitar Supabase Realtime para la tabla 'orders'
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
