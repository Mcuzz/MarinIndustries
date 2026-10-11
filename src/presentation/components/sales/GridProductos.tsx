
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TarjetaProducto,
  type Producto,
} from "./TarjetaProducto";

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

type GridProductosProps = {
  onVerCarrito?: () => void;
};

export function GridProductos({
  onVerCarrito,
}: GridProductosProps) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [productoExpandido, setProductoExpandido] = useState<string | null>(
    null
  );
  const [carrito, setCarrito] = useState<Record<string, number>>({});

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
            onClick={onVerCarrito}
            aria-label={`Ver carrito, ${totalArticulos} artículos`}
          >
            Carrito ({totalArticulos})
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

        {productoExpandido ? (
          <div className="producto-expandido-contenedor">
            {productosIniciales
              .filter((producto) => producto.id === productoExpandido)
              .map((producto) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                  expandida
                  onExpandir={() => {}}
                  onAgregarCarrito={agregarAlCarrito}
                  onCerrar={() => setProductoExpandido(null)}
                  onVerCarrito={onVerCarrito}
                />
              ))}
          </div>
        ) : productosFiltrados.length > 0 ? (
          <div className="productos-grid">
            {productosFiltrados.map((producto) => (
              <TarjetaProducto
                key={producto.id}
                producto={producto}
                onExpandir={() => setProductoExpandido(producto.id)}
                onAgregarCarrito={agregarAlCarrito}
                onVerCarrito={onVerCarrito}
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
    </section>
  );
}
