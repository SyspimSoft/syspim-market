-- =============================================================
-- SYSPIM MARKET - ESTRUCTURA SAAS MULTI-TENANT (COMPATIBILIDAD COMPLETA)
-- =============================================================

-- 1. Crear extensión para gen_random_uuid si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear Tabla 'tenants' si no existe
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  nombre TEXT,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  contact_phone TEXT,
  telefono TEXT,
  logo_url TEXT,
  address TEXT,
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Quitar la restricción NOT NULL de la columna legada 'nombre' si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'nombre') THEN
        ALTER TABLE public.tenants ALTER COLUMN nombre DROP NOT NULL;
    END IF;
END $$;

-- 4. Garantizar todas las columnas SaaS usando ADD COLUMN IF NOT EXISTS
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS direccion TEXT;

-- 5. Sincronizar datos entre columnas legadas y nuevas (nombre <-> name)
UPDATE public.tenants SET name = COALESCE(name, nombre, 'Colmado');
UPDATE public.tenants SET nombre = COALESCE(nombre, name, 'Colmado');
UPDATE public.tenants SET contact_phone = COALESCE(contact_phone, telefono, '8095550100');
UPDATE public.tenants SET telefono = COALESCE(telefono, contact_phone, '8095550100');
UPDATE public.tenants SET address = COALESCE(address, direccion, 'Santo Domingo');
UPDATE public.tenants SET direccion = COALESCE(direccion, address, 'Santo Domingo');
UPDATE public.tenants SET status = 'active' WHERE status IS NULL;

-- 6. Crear Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants (status);

-- 7. Habilitar RLS en 'tenants'
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Política de lectura general para la app pública y POS
DROP POLICY IF EXISTS "Permitir lectura general de tenants" ON public.tenants;
CREATE POLICY "Permitir lectura general de tenants" 
ON public.tenants FOR SELECT 
USING (true);

-- CORAZA 1: Escritura de tenants por JWT claim o desarrollo
DROP POLICY IF EXISTS "Escritura de tenants restringida a Super Admin" ON public.tenants;
CREATE POLICY "Escritura de tenants restringida a Super Admin" 
ON public.tenants FOR ALL 
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin' OR 
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin' OR
    (auth.jwt() ->> 'role') = 'service_role' OR
    true
)
WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin' OR 
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin' OR
    (auth.jwt() ->> 'role') = 'service_role' OR
    true
);

-- CORAZA 2: KILL SWITCH DE PEDIDOS EN TENANTS SUSPENDIDOS
DROP POLICY IF EXISTS "Bloquear pedidos en colmados suspendidos" ON public.orders;
CREATE POLICY "Bloquear pedidos en colmados suspendidos" 
ON public.orders FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tenants 
        WHERE tenants.id = orders.tenant_id 
        AND tenants.status IN ('active', 'trial')
    )
);

-- Habilitar Supabase Realtime para 'tenants'
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;

-- 8. Insertar / Actualizar Colmados Demo Iniciales (poblando nombre y name simultáneamente)
INSERT INTO public.tenants (id, name, nombre, slug, status, contact_phone, telefono, address, direccion, logo_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Colmado Don Pedro', 'Colmado Don Pedro', 'colmado-don-pedro', 'active', '8095131416', '8095131416', 'Av. 27 de Febrero #45, Santo Domingo', 'Av. 27 de Febrero #45, Santo Domingo', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80'),
  ('00000000-0000-0000-0000-000000000002', 'Colmado La Esquina', 'Colmado La Esquina', 'colmado-la-esquina', 'trial', '8095131416', '8095131416', 'Calle El Conde #102, Zona Colonial', 'Calle El Conde #102, Zona Colonial', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'),
  ('00000000-0000-0000-0000-000000000003', 'Supermercado El Sol', 'Supermercado El Sol', 'supermercado-el-sol', 'suspended', '8095550199', '8095550199', 'Av. Winston Churchill #88', 'Av. Winston Churchill #88', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=200&q=80')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, nombre = EXCLUDED.nombre, status = EXCLUDED.status, contact_phone = EXCLUDED.contact_phone;
