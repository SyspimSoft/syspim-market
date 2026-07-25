-- =============================================================
-- SYSPIM MARKET - ESQUEMA DE BASE DE DATOS MULTI-TENANT (SUPABASE)
-- Sistema para Colmados (Tenants, Perfiles, Productos, Pedidos, Detalles)
-- =============================================================

-- 1. Tabla de Colmados (Tenants)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- ej: colmado-don-pedro (para el link público)
  telefono TEXT,
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabla de Usuarios / Perfiles (Admin, Cajero, Delivery)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT CHECK (rol IN ('admin', 'cajero', 'delivery')) DEFAULT 'cajero',
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabla de Productos (Inventario por Colmado)
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio NUMERIC(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  categoria TEXT,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Tabla de Pedidos (Unifica ventas de caja y delivery)
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  cliente_nombre TEXT,
  cliente_telefono TEXT,
  direccion_entrega TEXT,
  delivery_id UUID REFERENCES public.profiles(id), -- Delivery asignado
  delivery_token TEXT UNIQUE, -- Token único para el link rápido de WhatsApp
  monto_total NUMERIC(10, 2) NOT NULL,
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'transferencia')) DEFAULT 'efectivo',
  estado TEXT CHECK (estado IN ('pendiente', 'en_camino', 'entregado', 'cancelado')) DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Detalle de Pedidos
CREATE TABLE IF NOT EXISTS public.pedido_detalles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id),
  cantidad INT NOT NULL,
  precio_unitario NUMERIC(10, 2) NOT NULL
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_detalles ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para acceso anon / desarrollo rápido
DROP POLICY IF EXISTS "Permitir todo a anon tenants" ON public.tenants;
CREATE POLICY "Permitir todo a anon tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon profiles" ON public.profiles;
CREATE POLICY "Permitir todo a anon profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon productos" ON public.productos;
CREATE POLICY "Permitir todo a anon productos" ON public.productos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon pedidos" ON public.pedidos;
CREATE POLICY "Permitir todo a anon pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon pedido_detalles" ON public.pedido_detalles;
CREATE POLICY "Permitir todo a anon pedido_detalles" ON public.pedido_detalles FOR ALL USING (true) WITH CHECK (true);

-- Insertar Colmado Demo Inicial si no existe
INSERT INTO public.tenants (id, nombre, slug, telefono, direccion) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Colmado Don Pedro', 'colmado-don-pedro', '809-555-0199', 'Av. 27 de Febrero #45, Santo Domingo')
ON CONFLICT (slug) DO NOTHING;
