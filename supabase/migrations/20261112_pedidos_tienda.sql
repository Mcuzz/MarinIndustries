        -- ==============================================================================
        -- MARIN INDUSTRIES - PEDIDOS DE LA TIENDA EN LÍNEA (Mercado Pago Checkout Pro)
        -- ==============================================================================
        -- Tablas separadas de ordenes_venta (punto de venta) para no afectar ese módulo.
        -- Ejecutar una sola vez en Supabase → SQL Editor. Es seguro volver a correrlo.
        --
        -- Seguridad: RLS activado SIN políticas → el navegador (publishable key) no puede
        -- leer ni escribir. Solo el servidor, con SUPABASE_SECRET_KEY, accede a estas tablas.
        -- ==============================================================================

        -- 1. Pedidos
        CREATE TABLE IF NOT EXISTS public.pedidos_tienda (
            id VARCHAR(50) PRIMARY KEY,                       -- ej: MI-1794525030776-64e8ec57 (external_reference en MP)
            estado VARCHAR(20) NOT NULL DEFAULT 'pendiente_pago'
                CHECK (estado IN ('pendiente_pago', 'en_proceso', 'pagado', 'rechazado', 'cancelado')),
            metodo_pago VARCHAR(30) NOT NULL DEFAULT 'mercadopago',

            -- Importes calculados en el servidor (MXN)
            subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),   -- productos sin IVA
            iva NUMERIC(12, 2) NOT NULL CHECK (iva >= 0),
            envio NUMERIC(12, 2) NOT NULL CHECK (envio >= 0),
            total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),         -- lo que se cobra en Mercado Pago
            moneda CHAR(3) NOT NULL DEFAULT 'MXN',

            -- Datos de entrega
            destinatario VARCHAR(150) NOT NULL,
            telefono VARCHAR(30),
            calle VARCHAR(150) NOT NULL,
            numero_exterior VARCHAR(20) NOT NULL,
            numero_interior VARCHAR(20),
            colonia VARCHAR(150) NOT NULL,
            codigo_postal VARCHAR(10) NOT NULL,
            ciudad VARCHAR(100) NOT NULL,
            entidad VARCHAR(100) NOT NULL,                    -- estado de la República
            referencias TEXT,

            -- Mercado Pago
            mp_preference_id VARCHAR(100),
            mp_payment_id VARCHAR(50),
            mp_status VARCHAR(30),                            -- approved, in_process, rejected...
            mp_status_detail VARCHAR(80),
            pagado_en TIMESTAMPTZ,

            creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        COMMENT ON TABLE public.pedidos_tienda IS 'Pedidos de la tienda en línea pagados con Mercado Pago';

        -- 2. Productos de cada pedido
        CREATE TABLE IF NOT EXISTS public.pedidos_tienda_detalles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            pedido_id VARCHAR(50) NOT NULL REFERENCES public.pedidos_tienda(id) ON DELETE CASCADE,
            producto_id VARCHAR(50) REFERENCES public.productos(id) ON DELETE SET NULL,
            nombre VARCHAR(255) NOT NULL,                     -- copia del nombre al momento de la compra
            cantidad INTEGER NOT NULL CHECK (cantidad > 0),
            precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),  -- sin IVA
            total NUMERIC(12, 2) NOT NULL CHECK (total >= 0)                       -- cantidad × precio_unitario
        );

        -- 3. Índices
        CREATE INDEX IF NOT EXISTS idx_pedidos_tienda_estado ON public.pedidos_tienda(estado);
        CREATE INDEX IF NOT EXISTS idx_pedidos_tienda_creado_en ON public.pedidos_tienda(creado_en DESC);
        CREATE INDEX IF NOT EXISTS idx_pedidos_tienda_detalles_pedido ON public.pedidos_tienda_detalles(pedido_id);

        -- 4. actualizado_en automático (reutiliza la función del esquema principal)
        DROP TRIGGER IF EXISTS trigger_actualizar_pedidos_tienda ON public.pedidos_tienda;
        CREATE TRIGGER trigger_actualizar_pedidos_tienda
            BEFORE UPDATE ON public.pedidos_tienda
            FOR EACH ROW
            EXECUTE FUNCTION public.actualizar_timestamp();

        -- 5. Seguridad: solo el servidor (secret key) puede acceder
        ALTER TABLE public.pedidos_tienda ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.pedidos_tienda_detalles ENABLE ROW LEVEL SECURITY;
