-- ==============================================================================
-- MARIN INDUSTRIES - DESCONTAR EXISTENCIA AL PAGAR UN PEDIDO EN LÍNEA
-- ==============================================================================
-- Requiere: 20261112_pedidos_tienda.sql
-- Ejecutar en Supabase → SQL Editor. Es seguro volver a correrlo.
--
-- Cuando un pedido de pedidos_tienda cambia a estado 'pagado', descuenta de
-- productos.existencia la cantidad comprada de cada producto.
--
-- - Se ejecuta UNA sola vez por pedido: solo en la transición de "no pagado" → "pagado"
--   (el servidor además nunca vuelve a modificar un pedido ya pagado).
-- - Va dentro de la misma transacción que el cambio de estado: o se hacen las dos cosas o ninguna.
-- - Nunca deja existencia negativa (la tabla tiene CHECK existencia >= 0). Si dos clientes pagan
--   la última pieza al mismo tiempo, queda en 0 y el pedido se marca con stock_insuficiente = TRUE
--   para que el equipo lo revise.
-- - Si un producto llega a 0, su estado cambia a 'agotado' y deja de mostrarse en la tienda.
-- ==============================================================================

-- 1. Marca para pedidos que se pagaron sin existencia suficiente
ALTER TABLE public.pedidos_tienda
    ADD COLUMN IF NOT EXISTS stock_insuficiente BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Función del trigger
CREATE OR REPLACE FUNCTION public.descontar_existencia_pedido_tienda()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    detalle RECORD;
    existencia_actual INTEGER;
    faltante BOOLEAN := FALSE;
BEGIN
    IF NEW.estado = 'pagado' AND OLD.estado IS DISTINCT FROM 'pagado' THEN
        FOR detalle IN
            SELECT producto_id, SUM(cantidad)::INTEGER AS cantidad
            FROM public.pedidos_tienda_detalles
            WHERE pedido_id = NEW.id AND producto_id IS NOT NULL
            GROUP BY producto_id
        LOOP
            -- FOR UPDATE bloquea la fila del producto mientras se descuenta (evita carreras).
            SELECT existencia INTO existencia_actual
            FROM public.productos
            WHERE id = detalle.producto_id
            FOR UPDATE;

            IF NOT FOUND THEN
                CONTINUE; -- el producto fue eliminado; no hay nada que descontar
            END IF;

            IF existencia_actual < detalle.cantidad THEN
                faltante := TRUE;
            END IF;

            UPDATE public.productos
            SET existencia = GREATEST(existencia_actual - detalle.cantidad, 0),
                estado = CASE
                    WHEN existencia_actual - detalle.cantidad <= 0 AND estado = 'activo' THEN 'agotado'
                    ELSE estado
                END
            WHERE id = detalle.producto_id;
        END LOOP;

        IF faltante THEN
            NEW.stock_insuficiente := TRUE;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 3. Trigger (BEFORE para poder marcar stock_insuficiente en el mismo UPDATE)
DROP TRIGGER IF EXISTS trigger_descontar_existencia_pedido_tienda ON public.pedidos_tienda;
CREATE TRIGGER trigger_descontar_existencia_pedido_tienda
    BEFORE UPDATE OF estado ON public.pedidos_tienda
    FOR EACH ROW
    EXECUTE FUNCTION public.descontar_existencia_pedido_tienda();
