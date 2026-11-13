-- ==============================================================================
-- MARIN INDUSTRIES - CANCELAR PEDIDOS ABANDONADOS DE LA TIENDA EN LÍNEA
-- ==============================================================================
-- Requiere: 20261112_pedidos_tienda.sql
-- Ejecutar en Supabase → SQL Editor. Es seguro volver a correrlo.
--
-- Un pedido se crea como 'pendiente_pago' cuando el cliente abre Mercado Pago.
-- La liga de pago caduca a los 30 minutos (CHECKOUT_EXPIRATION_MINUTES en el código).
-- Esta tarea corre cada 10 minutos y marca como 'cancelado' los pedidos que siguen en
-- 'pendiente_pago' después de 45 minutos (15 min de margen por si un pago se está procesando).
--
-- Qué NO se cancela:
--   - 'en_proceso' (p. ej. OXXO o SPEI ya generados: el cliente tiene días para pagar).
--   - 'pagado' o 'rechazado'.
-- Si por alguna razón llega después un pago aprobado de un pedido cancelado, el servidor
-- lo pasa a 'pagado' igualmente (y se descuenta la existencia).
-- ==============================================================================

-- 1. Función que hace la limpieza (también se puede llamar a mano: SELECT public.cancelar_pedidos_abandonados();)
CREATE OR REPLACE FUNCTION public.cancelar_pedidos_abandonados()
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    cancelados INTEGER;
BEGIN
    UPDATE public.pedidos_tienda
    SET estado = 'cancelado',
        mp_status_detail = COALESCE(mp_status_detail, 'checkout_expired')
    WHERE estado = 'pendiente_pago'
      AND creado_en < NOW() - INTERVAL '45 minutes';

    GET DIAGNOSTICS cancelados = ROW_COUNT;
    RETURN cancelados;
END;
$$;

-- La función solo la debe poder ejecutar el sistema, no el navegador.
REVOKE EXECUTE ON FUNCTION public.cancelar_pedidos_abandonados() FROM PUBLIC, anon, authenticated;

-- 2. Programar la tarea cada 10 minutos con pg_cron (incluido en Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Si ya existe una tarea con este nombre, cron.schedule la actualiza.
SELECT cron.schedule(
    'cancelar-pedidos-abandonados',
    '*/10 * * * *',
    $$ SELECT public.cancelar_pedidos_abandonados(); $$
);

-- Para revisar la tarea:      SELECT * FROM cron.job;
-- Para ver ejecuciones:       SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
-- Para desactivarla:          SELECT cron.unschedule('cancelar-pedidos-abandonados');
