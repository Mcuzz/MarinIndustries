
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TarjetaProducto,
  type Producto,
} from "./TarjetaProducto";
import { CarritoItem } from "./CarritoItem";

const CARRITO_STORAGE_KEY = "marin.store.cart";
const TASA_IVA = 0.16;

//PENDIENTE CREAR UN SERVICIO PARA OBTENER EL INVENTARIO DESDE EL BACKEND, POR AHORA SE USAN PRODUCTOS ESTATICOS
const productosIniciales: Producto[] = [ //esto lo tengo que quitar, ya mandaron el inventario
  {
    id: "P001",
    nombre: "Herramienta de precisión",
    precio: 850,
    descripcion:
      "Herramienta de precisión para trabajos de mantenimiento y operaciones técnicas.",
    existencia: 12,
    imagen:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSbFAOO6BmRCf20_t6KPqwIHTrJWJ56Zjz-j35sYvC6bN-bdwwPxooQBSm&s=10",
    categoria: "Herramientas",
    oferta: true,
  },
  {
    id: "P002",
    nombre: "Equipo de protección",
    precio: 420,
    descripcion:
      "Equipo de protección para actividades de trabajo industrial.",
    existencia: 20,
    imagen:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80",
    categoria: "Seguridad",
  },
  {
    id: "P003",
    nombre: "Accesorios industriales",
    precio: 630,
    descripcion:
      "Accesorios para tareas generales de instalación y mantenimiento.",
    existencia: 8,
    imagen:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    categoria: "Accesorios",
  },
  {
    id: "P004",
    nombre: "Kit de mantenimiento",
    precio: 1250,
    descripcion:
      "Conjunto de herramientas para trabajos de revisión y mantenimiento.",
    existencia: 5,
    imagen:
      "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80",
    categoria: "Herramientas",
  },
  {
    id: "P005",
    nombre: "Consumibles técnicos",
    precio: 280,
    descripcion:
      "Materiales de consumo para actividades de mantenimiento.",
    existencia: 30,
    imagen:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80",
    categoria: "Consumibles",
  },
];

const moneda = (precio: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(precio);

export function GridProductos() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [productoExpandido, setProductoExpandido] = useState<string | null>(
    null
  );
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carritoCargado, setCarritoCargado] = useState(false);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CARRITO_STORAGE_KEY);
      if (guardado) {
        const cantidades = JSON.parse(guardado) as Record<string, number>;
        setCarrito(
          Object.fromEntries(
            Object.entries(cantidades).filter(
              ([id, cantidad]) =>
                productosIniciales.some((producto) => producto.id === id) &&
                Number.isInteger(cantidad) &&
                cantidad > 0
            )
          )
        );
      }
    } catch {
      window.localStorage.removeItem(CARRITO_STORAGE_KEY);
    }
    setCarritoCargado(true);
  }, []);

  useEffect(() => {
    if (!carritoCargado) return;

    try {
      window.localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    } catch {
    }
  }, [carrito, carritoCargado]);

  useEffect(() => {
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProductoExpandido(null);
        setCarritoAbierto(false);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, []);

  const categorias = useMemo(
    () => [
      "Todas",
      ...new Set(productosIniciales.map((producto) => producto.categoria)),
    ],
    []
  );

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return productosIniciales.filter((producto) => {
      const coincideTexto =
        producto.nombre.toLowerCase().includes(termino) ||
        producto.descripcion.toLowerCase().includes(termino);

      const coincideCategoria =
        categoria === "Todas" || producto.categoria === categoria;

      const coincideOferta = !soloOfertas || producto.oferta === true;

      return coincideTexto && coincideCategoria && coincideOferta;
    });
  }, [busqueda, categoria, soloOfertas]);

  const totalArticulos = Object.values(carrito).reduce(
    (total, cantidad) => total + cantidad,
    0
  );
  const articulosCarrito = productosIniciales.flatMap((producto) => {
    const cantidad = carrito[producto.id] ?? 0;
    return cantidad > 0 ? [{ producto, cantidad }] : [];
  });
  const subtotal = articulosCarrito.reduce(
    (total, articulo) => total + articulo.producto.precio * articulo.cantidad,
    0
  );
  const iva = subtotal * TASA_IVA;
  const total = subtotal + iva;

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((actual) => {
      const cantidadActual = actual[producto.id] ?? 0;

      if (cantidadActual >= producto.existencia) {
        return actual;
      }

      return {
        ...actual,
        [producto.id]: cantidadActual + 1,
      };
    });
  };

  const actualizarCantidad = (producto: Producto, cantidad: number) => {
    setCarrito((actual) => {
      const siguiente = { ...actual };
      if (cantidad <= 0) {
        delete siguiente[producto.id];
      } else {
        siguiente[producto.id] = Math.min(cantidad, producto.existencia);
      }
      return siguiente;
    });
  };

  const productoSeleccionado = productosIniciales.find(
    (producto) => producto.id === productoExpandido
  );

  return (
    <section className="tienda-section">
      <div className="section-shell">
        <header className="tienda-encabezado">
          <div>
            <span className="eyebrow">MARIN INDUSTRIES / PRODUCTOS</span>
            <h1 className="tienda-titulo">Catálogo de productos</h1>
            <p className="tienda-descripcion">
              Explora los productos disponibles y consulta sus detalles.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary tienda-carrito"
            onClick={() => setCarritoAbierto(true)}
            aria-label={`Ver carrito, ${totalArticulos} artículos`}
          >
            Carrito <span className="tienda-carrito-cantidad">{totalArticulos}</span>
          </button>
        </header>

        <div className="tienda-controles">
          <label className="tienda-busqueda">
            <span>Buscar productos</span>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Nombre o descripción..."
            />
          </label>

          <label className="tienda-categoria">
            <span>Categoría</span>
            <select
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
            >
              {categorias.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className={`btn ${soloOfertas ? "btn-primary" : "btn-ghost"}`}
            aria-pressed={soloOfertas}
            onClick={() => setSoloOfertas((actual) => !actual)}
          >
            {soloOfertas ? "Mostrar todos" : "Ver ofertas"}
          </button>
        </div>

        {productosFiltrados.length > 0 ? (
          <div className="productos-grid">
            {productosFiltrados.map((producto) => (
              <TarjetaProducto
                key={producto.id}
                producto={producto}
                onExpandir={() => setProductoExpandido(producto.id)}
                onAgregarCarrito={agregarAlCarrito}
                onVerCarrito={() => setCarritoAbierto(true)}
              />
            ))}
          </div>
        ) : (
          <p className="tienda-vacio">
            No se encontraron productos con esos criterios.
          </p>
        )}

        <footer className="tienda-pie">
          <span>{productosFiltrados.length} productos encontrados</span>
          <Link href="/cotizacion">Solicitar una cotización</Link>
        </footer>
      </div>

      {productoSeleccionado && (
        <div
          className="tienda-overlay"
          onClick={() => setProductoExpandido(null)}
        >
          <section
            className="producto-dialogo"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalles de ${productoSeleccionado.nombre}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="tienda-modal-cerrar"
              aria-label="Cerrar detalles"
              onClick={() => setProductoExpandido(null)}
            >
              ×
            </button>
            <TarjetaProducto
              producto={productoSeleccionado}
              expandida
              onExpandir={() => {}}
              onAgregarCarrito={agregarAlCarrito}
              onCerrar={() => setProductoExpandido(null)}
              onVerCarrito={() => {
                setProductoExpandido(null);
                setCarritoAbierto(true);
              }}
            />
          </section>
        </div>
      )}

      {carritoAbierto && (
        <div
          className="tienda-overlay"
          onClick={() => setCarritoAbierto(false)}
        >
          <section
            className="carrito-dialogo"
            role="dialog"
            aria-modal="true"
            aria-labelledby="carrito-titulo"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="carrito-encabezado">
              <div>
                <span className="eyebrow">MARIN INDUSTRIES / PEDIDO</span>
                <h2 id="carrito-titulo">Tu carrito</h2>
                <p>{totalArticulos} artículos</p>
              </div>
              <button
                type="button"
                className="tienda-modal-cerrar"
                aria-label="Cerrar carrito"
                onClick={() => setCarritoAbierto(false)}
              >
                ×
              </button>
            </header>

            {articulosCarrito.length > 0 ? (
              <div className="carrito-cuerpo">
                <div className="carrito-articulos" aria-label="Artículos del carrito">
                  {articulosCarrito.map(({ producto, cantidad }) => (
                    <CarritoItem
                      key={producto.id}
                      producto={producto}
                      cantidad={cantidad}
                      onCambiarCantidad={(nuevaCantidad) =>
                        actualizarCantidad(producto, nuevaCantidad)
                      }
                      onEliminar={() => actualizarCantidad(producto, 0)}
                    />
                  ))}
                </div>

                <aside className="carrito-resumen" aria-label="Resumen de precios">
                  <h3>Resumen</h3>
                  <dl>
                    <div><dt>Subtotal</dt><dd>{moneda(subtotal)}</dd></div>
                    <div><dt>IVA (16%)</dt><dd>{moneda(iva)}</dd></div>
                    <div className="carrito-total"><dt>Total</dt><dd>{moneda(total)}</dd></div>
                  </dl>
                  <button
                    type="button"
                    className="btn btn-ghost carrito-vaciar"
                    onClick={() => setCarrito({})}
                  >
                    Vaciar carrito
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary carrito-continuar"
                    onClick={() => setCarritoAbierto(false)}
                  >
                    Continuar comprando
                  </button>
                </aside>
              </div>
            ) : (
              <div className="carrito-vacio">
                <p>Tu carrito está vacío.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCarritoAbierto(false)}
                >
                  Explorar productos
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
