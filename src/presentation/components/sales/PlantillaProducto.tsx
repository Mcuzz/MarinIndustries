"use client";

import type { CSSProperties } from "react";
import type { Producto } from "./TarjetaProducto";

type PlantillaProductoEditorialProps = {
  producto: Producto;
};

const moneda = (precio: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(precio);

export function PlantillaProductoEditorial({
  producto,
}: PlantillaProductoEditorialProps) {
  const estilo = {
    "--editorial-accent": "#ffb000",
  } as CSSProperties;

  return (
    <article className="editorial-producto" style={estilo}>
      <header className="editorial-producto__header">
        <div className="editorial-producto__marca">
          <span className="editorial-producto__marca-punto" />
          MARIN INDUSTRIES
        </div>
        <span className="editorial-producto__serie">PRODUCT SERIES / 001</span>
      </header>

      <section className="editorial-producto__titulo">
        <span className="editorial-producto__etiqueta">
          {producto.categoria || "SOLUCIONES INDUSTRIALES"}
        </span>
        <h2>{producto.nombre}</h2>
        <div className="editorial-producto__regla">
          <span />
        </div>
      </section>

      <div className="editorial-producto__imagen">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="editorial-producto__sin-imagen">
            IMAGEN NO DISPONIBLE
          </div>
        )}
        <span className="editorial-producto__indice">M / PRODUCT</span>
      </div>

      <footer className="editorial-producto__footer">
        <div className="editorial-producto__descripcion">
          <span className="editorial-producto__etiqueta">DESCRIPCIÓN</span>
          <p>
            {producto.descripcion ||
              "Consulta con nuestro equipo para conocer más detalles."}
          </p>
        </div>

        <div className="editorial-producto__precio">
          <span className="editorial-producto__etiqueta">PRECIO</span>
          <strong>{moneda(producto.precio)}</strong>
          <span className="editorial-producto__moneda">
            MXN · IVA según condiciones de venta
          </span>
        </div>
      </footer>

      <div className="editorial-producto__base">
        <span>INGENIERÍA · TECNOLOGÍA · SUMINISTRO</span>
        <span>MARIN INDUSTRIES / MÉXICO</span>
      </div>
    </article>
  );
}
