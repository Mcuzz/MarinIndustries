"use client";

import type { Producto } from "@/src/domain/products/product.entity";
import { useLanguage } from "../../i18n/LanguageProvider";
export type { Producto };

type TarjetaProductoProps = {
  producto: Producto;
  expandida?: boolean;
  onExpandir: () => void;
  onAgregarCarrito: (producto: Producto) => void;
  onCerrar?: () => void;
  onVerCarrito?: () => void;
  onCompartir: (producto: Producto) => void;
};

const moneda = (precio: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(precio);

export function TarjetaProducto({
  producto,
  expandida = false,
  onExpandir,
  onAgregarCarrito,
  onCerrar,
  onVerCarrito,
  onCompartir,
}: TarjetaProductoProps) {
  const { translations } = useLanguage();
  const t = translations.store;
  return (
    <article
      className={`producto-card ${expandida ? "producto-card--expandida" : ""}`}
    >
      <button
        type="button"
        className="producto-imagen"
        onClick={expandida ? undefined : onExpandir}
        aria-label={`${t.details} ${producto.nombre}`}
        tabIndex={expandida ? -1 : 0}
      >
        <img src={producto.imagen} alt={producto.nombre} />
        {producto.oferta && <span className="producto-oferta">{t.offer}</span>}
      </button>

      <div className="producto-contenido">
        <span className="producto-categoria">{producto.categoria}</span>
        <h2 className="producto-titulo">{producto.nombre}</h2>
        <p className="producto-precio">{moneda(producto.precio)}</p>

        {expandida && (
          <>
            <p className="producto-descripcion">{producto.descripcion}</p>
            <p className="producto-existencia">
              {t.availability}{" "}
              <strong>
                {producto.existencia > 0
                  ? `${producto.existencia} ${t.units}`
                  : t.outOfStock}
              </strong>
            </p>
          </>
        )}

        <div className="producto-acciones">
          <button
            type="button"
            className="btn btn-primary"
            disabled={producto.existencia < 1}
            onClick={() => onAgregarCarrito(producto)}
          >
            {t.add}
          </button>

          {expandida && (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onVerCarrito}
              >
                {t.viewCart}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCerrar}
              >
                {t.back}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onCompartir(producto)}
                aria-label={`${t.share} ${producto.nombre}`}
              >
                {t.share}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
