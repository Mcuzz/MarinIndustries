-- ==============================================================================
-- MARIN INDUSTRIES - ESQUEMA DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Este script define la estructura de tablas, relaciones, restricciones,
-- índices, políticas de seguridad RLS y datos iniciales (seed) analizados
-- a partir del código del proyecto Marin Industries.
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLAS DEL CATÁLOGO DE PRODUCTOS (E-COMMERCE / TIENDA)
-- ==============================================================================

-- 2.1 Categorías de productos
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.categorias IS 'Categorías para clasificar productos y servicios en el catálogo';

-- 2.2 Productos
CREATE TABLE IF NOT EXISTS public.productos (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
    existencia INTEGER NOT NULL DEFAULT 0 CHECK (existencia >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'agotado')),
    oferta BOOLEAN NOT NULL DEFAULT FALSE,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    categoria VARCHAR(100) NOT NULL, -- Nombre de categoría denormalizado para consultas rápidas
    imagen_url TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.productos IS 'Inventario de productos físicos comercializados por Marin Industries';
COMMENT ON COLUMN public.productos.existencia IS 'Cantidad de ejemplares disponibles en stock';
COMMENT ON COLUMN public.productos.estado IS 'Estado del producto: activo, inactivo o agotado';

-- 2.3 Galería de imágenes adicionales de productos
CREATE TABLE IF NOT EXISTS public.producto_imagenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id VARCHAR(50) NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_texto VARCHAR(255),
    orden INTEGER NOT NULL DEFAULT 0,
    es_portada BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.producto_imagenes IS 'Imágenes secundarias o de detalle para la tarjeta expandida del producto';

-- ==============================================================================
-- 3. TABLAS DE SERVICIOS Y COTIZACIONES (MÓDULO DE SERVICIOS)
-- ==============================================================================

-- 3.1 Servicios ofrecidos
CREATE TABLE IF NOT EXISTS public.servicios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    precio_base VARCHAR(100),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Solicitudes de contacto y cotización
CREATE TABLE IF NOT EXISTS public.solicitudes_contacto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_contacto VARCHAR(150) NOT NULL,
    empresa VARCHAR(150),
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    servicio_solicitado VARCHAR(150),
    mensaje TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'atendida', 'en_revision', 'cancelada')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLAS DE CLIENTES, SUCURSALES Y VENTAS (MÓDULO POS / GESTIÓN DE VENTAS)
-- ==============================================================================

-- 4.1 Sucursales
CREATE TABLE IF NOT EXISTS public.sucursales (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) DEFAULT 'Mexicali',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(30),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Órdenes de venta
CREATE TABLE IF NOT EXISTS public.ordenes_venta (
    id VARCHAR(50) PRIMARY KEY, -- ej: VEN-00241
    cliente_id VARCHAR(50) REFERENCES public.clientes(id) ON DELETE RESTRICT,
    cliente_nombre VARCHAR(255) NOT NULL,
    rfc VARCHAR(20) NOT NULL,
    sucursal_id VARCHAR(50) REFERENCES public.sucursales(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Producto', 'Servicio', 'Mixto')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    iva NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Completado', 'Pendiente', 'Anulado')),
    metodo_pago VARCHAR(50),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 Detalles de órdenes de venta
CREATE TABLE IF NOT EXISTS public.orden_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id VARCHAR(50) NOT NULL REFERENCES public.ordenes_venta(id) ON DELETE CASCADE,
    producto_id VARCHAR(50) REFERENCES public.productos(id) ON DELETE SET NULL,
    item_nombre VARCHAR(255) NOT NULL,
    item_tipo VARCHAR(20) NOT NULL CHECK (item_tipo IN ('producto', 'servicio')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0)
);

-- ==============================================================================
-- 5. TABLAS DE BOLSA DE TRABAJO (CONVOCATORIAS) Y PERFILES
-- ==============================================================================

-- 5.1 Convocatorias laborales
CREATE TABLE IF NOT EXISTS public.convocatorias (
    id VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    area VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Convocatoria base',
    descripcion TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.2 Perfiles de usuarios (vinculados a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255),
    rol VARCHAR(30) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'vendedor', 'cliente')),
    telefono VARCHAR(30),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. ÍNDICES DE RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_productos_estado ON public.productos(estado);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_oferta ON public.productos(oferta);
CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto_id ON public.producto_imagenes(producto_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_venta_cliente_id ON public.ordenes_venta(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orden_detalles_orden_id ON public.orden_detalles(orden_id);

-- ==============================================================================
-- 7. TRIGGER PARA ACTUALIZAR 'actualizado_en'
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_productos ON public.productos;
CREATE TRIGGER trigger_actualizar_productos
    BEFORE UPDATE ON public.productos
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

-- ==============================================================================
-- 8. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocatorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orden_detalles ENABLE ROW LEVEL SECURITY;

-- Lectura pública para la tienda (cualquiera puede ver categorías, productos activos e imágenes)
CREATE POLICY "Lectura pública de categorías"
    ON public.categorias FOR SELECT
    USING (true);

CREATE POLICY "Lectura pública de productos activos"
    ON public.productos FOR SELECT
    USING (estado = 'activo' OR auth.role() = 'authenticated');

CREATE POLICY "Lectura pública de imágenes de producto"
    ON public.producto_imagenes FOR SELECT
    USING (true);

CREATE POLICY "Lectura pública de servicios"
    ON public.servicios FOR SELECT
    USING (true);

CREATE POLICY "Inserción pública de cotizaciones"
    ON public.solicitudes_contacto FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Lectura de convocatorias para usuarios autenticados"
    ON public.convocatorias FOR SELECT
    USING (auth.role() = 'authenticated');

-- Gestión de productos (solo personal autenticado)
CREATE POLICY "Gestión de productos para personal autenticado"
    ON public.productos FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Perfiles: el usuario puede ver y editar su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON public.perfiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON public.perfiles FOR UPDATE
    USING (auth.uid() = id);

-- ==============================================================================
-- 9. DATOS INICIALES (SEED DATA DEL PROYECTO MARIN INDUSTRIES)
-- ==============================================================================

-- 9.1 Insertar categorías
INSERT INTO public.categorias (id, nombre, slug, descripcion)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Herramientas', 'herramientas', 'Herramientas técnicas y de precisión'),
    ('a0000000-0000-0000-0000-000000000002', 'Seguridad', 'seguridad', 'Equipo de protección y seguridad industrial'),
    ('a0000000-0000-0000-0000-000000000003', 'Accesorios', 'accesorios', 'Accesorios de instalación y repuestos'),
    ('a0000000-0000-0000-0000-000000000004', 'Consumibles', 'consumibles', 'Materiales y consumibles para operaciones técnicas')
ON CONFLICT (nombre) DO NOTHING;

-- 9.2 Insertar los productos existentes en el catálogo de la tienda
INSERT INTO public.productos (id, nombre, precio, descripcion, existencia, estado, oferta, categoria_id, categoria, imagen_url)
VALUES
    (
        'P001',
        'Herramienta de precisión',
        850.00,
        'Herramienta de precisión para trabajos de mantenimiento y operaciones técnicas.',
        12,
        'activo',
        TRUE,
        'a0000000-0000-0000-0000-000000000001',
        'Herramientas',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSbFAOO6BmRCf20_t6KPqwIHTrJWJ56Zjz-j35sYvC6bN-bdwwPxooQBSm&s=10'
    ),
    (
        'P002',
        'Equipo de protección',
        420.00,
        'Equipo de protección para actividades de trabajo industrial.',
        20,
        'activo',
        FALSE,
        'a0000000-0000-0000-0000-000000000002',
        'Seguridad',
        'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80'
    ),
    (
        'P003',
        'Accesorios industriales',
        630.00,
        'Accesorios para tareas generales de instalación y mantenimiento.',
        8,
        'activo',
        FALSE,
        'a0000000-0000-0000-0000-000000000003',
        'Accesorios',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80'
    ),
    (
        'P004',
        'Kit de mantenimiento',
        1250.00,
        'Conjunto de herramientas para trabajos de revisión y mantenimiento.',
        5,
        'activo',
        FALSE,
        'a0000000-0000-0000-0000-000000000001',
        'Herramientas',
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80'
    ),
    (
        'P005',
        'Consumibles técnicos',
        280.00,
        'Materiales de consumo para actividades de mantenimiento.',
        30,
        'activo',
        FALSE,
        'a0000000-0000-0000-0000-000000000004',
        'Consumibles',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80'
    )
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    descripcion = EXCLUDED.descripcion,
    existencia = EXCLUDED.existencia,
    estado = EXCLUDED.estado,
    oferta = EXCLUDED.oferta,
    categoria_id = EXCLUDED.categoria_id,
    categoria = EXCLUDED.categoria,
    imagen_url = EXCLUDED.imagen_url;

-- 9.3 Insertar sucursales de ejemplo
INSERT INTO public.sucursales (id, nombre, ciudad)
VALUES
    ('central', 'Sucursal Central', 'Mexicali'),
    ('norte', 'Sucursal Norte', 'Mexicali'),
    ('industrial', 'Sucursal Industrial', 'Mexicali')
ON CONFLICT (id) DO NOTHING;

-- 9.4 Insertar clientes del catálogo de ventas
INSERT INTO public.clientes (id, nombre, rfc)
VALUES
    ('ino', 'Industrias del Norte S.A.', 'INO980412KH2'),
    ('clo', 'Comercializadora López', 'CLO120511890'),
    ('gtp', 'Grupo Tecnológico del Pacífico', 'GTP0901019A1'),
    ('mostrador', 'Cliente General (Venta Mostrador)', 'XAXX010101000')
ON CONFLICT (id) DO NOTHING;

-- 9.5 Insertar convocatorias
INSERT INTO public.convocatorias (id, titulo, area, estado, descripcion)
VALUES
    ('web-intern', 'Practicante de desarrollo web', 'Software', 'Convocatoria base', 'Apoyo en interfaces, formularios, documentación y mantenimiento de proyectos internos.'),
    ('automation-support', 'Apoyo en automatización', 'Ingeniería', 'Por definir', 'Participación en levantamiento de procesos, pruebas y documentación técnica.'),
    ('graphic-designer', 'Diseñador gráfico colaborador', 'Marca', 'Por definir', 'Soporte visual para identidad, piezas digitales, iconografía y presentación comercial.')
ON CONFLICT (id) DO NOTHING;
