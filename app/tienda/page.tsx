"use client";

import { useState } from "react";
import { PageShell } from "@/src/presentation/components/layout/PageShell";
import { GridProductos } from "@/src/presentation/components/sales/GridProductos";

export default function TiendaPage() {
  const [mostrarAvisoCarrito, setMostrarAvisoCarrito] = useState(false);

  return (
    <PageShell>
      <main>
        <GridProductos
          onVerCarrito={() => setMostrarAvisoCarrito(true)}
        />

        {mostrarAvisoCarrito && (
          <div
            className="tienda-modal-fondo"
            onClick={() => setMostrarAvisoCarrito(false)}
          >
            <section
              className="tienda-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="carrito-titulo"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="tienda-modal-cerrar"
                aria-label="Cerrar"
                onClick={() => setMostrarAvisoCarrito(false)}
              >
                ×
              </button>

              <span className="eyebrow">MARIN INDUSTRIES</span>

              <h2 id="carrito-titulo">Carrito de compras</h2>

              <p>
                Ventanita del carrito. Ajio ajio aqui va el carrito 
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setMostrarAvisoCarrito(false)}
              >
                Continuar explorando
              </button>
            </section>
          </div>
        )}
      </main>
    </PageShell>
  );
}
