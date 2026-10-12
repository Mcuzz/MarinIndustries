"use client";

import type { Producto } from "./TarjetaProducto";

type CarritoItemProps = {
  producto: Producto;
  cantidad: number;
  onCambiarCantidad: (cantidad: number) => void;
  onEliminar: () => void;
};

const moneda = (precio: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(precio);

export function CarritoItem({
  producto,
  cantidad,
  onCambiarCantidad,
  onEliminar,
}: CarritoItemProps) {
  return (
    <article className="carrito-item">
      <img className="carrito-item-imagen" src={producto.imagen} alt="" />
      <div className="carrito-item-info">
        <span className="producto-categoria">{producto.categoria}</span>
        <h3>{producto.nombre}</h3>
        <p>{moneda(producto.precio)} por unidad</p>
        <div className="carrito-item-controles">
          <div className="carrito-cantidad-control" aria-label={`Cantidad de ${producto.nombre}`}>
            <button
              type="button"
              aria-label={`Reducir cantidad de ${producto.nombre}`}
              onClick={() => onCambiarCantidad(cantidad - 1)}
            >
              −
            </button>
            <span aria-live="polite">{cantidad}</span>
            <button
              type="button"
              aria-label={`Aumentar cantidad de ${producto.nombre}`}
              disabled={cantidad >= producto.existencia}
              onClick={() => onCambiarCantidad(cantidad + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="carrito-item-eliminar"
            onClick={onEliminar}
          >
            Eliminar
          </button>
        </div>
      </div>
      <strong className="carrito-item-total">
        {moneda(producto.precio * cantidad)}
      </strong>
    </article>
  );
}
