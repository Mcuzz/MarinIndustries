"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TarjetaProducto, type Producto } from "./TarjetaProducto";
import { CarritoItem } from "./CarritoItem";

import { CompartirProductoModal } from "./CompartirProductoModal";

const CARRITO_STORAGE_KEY = "marin.store.cart";
const TASA_IVA = 0.16;



import { container } from "@/src/infrastructure/composition/root-container";
import { productosEstaticos } from "@/src/infrastructure/products/static-product.repository";

import { useRouter } from "next/navigation";
import { saveStoreCheckout } from "@/src/infrastructure/sales/store-checkout.storage";
import { useLanguage } from "../../i18n/LanguageProvider";

const moneda = (precio: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(precio);

type GridProductosProps = {
  productosInicialesProp?: Producto[];
};

export function GridProductos({
  productosInicialesProp,
}: GridProductosProps = {}) {
  const { translations } = useLanguage();
  const t = translations.store;
  const [productos, setProductos] = useState<Producto[]>(
    productosInicialesProp && productosInicialesProp.length > 0
      ? productosInicialesProp
      : productosEstaticos,
  );

  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [soloOfertas, setSoloOfertas] = useState(false);
  const [productoExpandido, setProductoExpandido] = useState<string | null>(
    null,
  );
  const [carrito, setCarrito] = useState<Record<string, number>>({});
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carritoCargado, setCarritoCargado] = useState(false);
  const router = useRouter();

  const [productoParaCompartir, setProductoParaCompartir] =
  useState<Producto | null>(null);

  // Cargar productos desde la base de datos (Supabase o respaldo estático)
  useEffect(() => {
    let activo = true;
    setCargando(true);
    container.products
      .listProducts({ soloActivos: true })
      .then((items) => {
        if (activo && items.length > 0) {
          setProductos(items);
        }
      })
      .catch((err) => {
        console.warn(
          "No se pudieron cargar productos de la base de datos:",
          err,
        );
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CARRITO_STORAGE_KEY);
      if (guardado) {
        const cantidades = JSON.parse(guardado) as Record<string, number>;
        setCarrito(
          Object.fromEntries(
            Object.entries(cantidades).filter(
              ([id, cantidad]) =>
                productos.some((producto) => producto.id === id) &&
                Number.isInteger(cantidad) &&
                cantidad > 0,
            ),
          ),
        );
      }
    } catch {
      window.localStorage.removeItem(CARRITO_STORAGE_KEY);
    }
    setCarritoCargado(true);
  }, [productos]);

  useEffect(() => {
    if (!carritoCargado) return;

    try {
      window.localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
    } catch {}
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
      ...new Set(productos.map((producto) => producto.categoria)),
    ],
    [productos],
  );

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideTexto =
        producto.nombre.toLowerCase().includes(termino) ||
        producto.descripcion.toLowerCase().includes(termino);

      const coincideCategoria =
        categoria === "Todas" || producto.categoria === categoria;

      const coincideOferta = !soloOfertas || producto.oferta === true;

      return coincideTexto && coincideCategoria && coincideOferta;
    });
  }, [productos, busqueda, categoria, soloOfertas]);

  const totalArticulos = Object.values(carrito).reduce(
    (total, cantidad) => total + cantidad,
    0,
  );
  const articulosCarrito = productos.flatMap((producto) => {
    const cantidad = carrito[producto.id] ?? 0;
    return cantidad > 0 ? [{ producto, cantidad }] : [];
  });
  const subtotal = articulosCarrito.reduce(
    (total, articulo) => total + articulo.producto.precio * articulo.cantidad,
    0,
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

  const productoSeleccionado = productos.find(
    (producto) => producto.id === productoExpandido,
  );

  return (
    <section className="tienda-section">
      <div className="section-shell">
        <header className="tienda-encabezado">
          <div>
            <span className="eyebrow">MARIN INDUSTRIES / {t.catalog.toUpperCase()}</span>
            <h1 className="tienda-titulo">{t.catalog}</h1>
            <p className="tienda-descripcion">
              {t.description}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary tienda-carrito"
            onClick={() => setCarritoAbierto(true)}
            aria-label={`${t.viewCart}, ${totalArticulos} ${t.articles}`}
          >
            {t.cart}{" "}
            <span className="tienda-carrito-cantidad">{totalArticulos}</span>
          </button>
        </header>

        <div className="tienda-controles">
          <label className="tienda-busqueda">
            <span>{t.search}</span>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder={t.searchPlaceholder}
            />
          </label>

          <label className="tienda-categoria">
            <span>{t.category}</span>
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
            {soloOfertas ? t.showAll : t.offers}
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
                onCompartir={setProductoParaCompartir}
              />
            ))}
          </div>
        ) : (
          <p className="tienda-vacio">
            {t.emptyResults}
          </p>
        )}

        <footer className="tienda-pie">
          <span>{productosFiltrados.length} {t.productsFound}</span>
          <Link href="/cotizacion">{t.requestQuote}</Link>
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
            aria-label={`${t.details} ${productoSeleccionado.nombre}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="tienda-modal-cerrar"
              aria-label={t.closeDetails}
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
              onCompartir={setProductoParaCompartir}
            />
          </section>
        </div>
      )}

      {productoParaCompartir && (
        <CompartirProductoModal
          producto={productoParaCompartir}
          onCerrar={() => setProductoParaCompartir(null)}
        />
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
                <span className="eyebrow">{t.order}</span>
                <h2 id="carrito-titulo">{t.cart}</h2>
                <p>{totalArticulos} {t.articles}</p>
              </div>
              <button
                type="button"
                className="tienda-modal-cerrar"
                aria-label={t.closeCart}
                onClick={() => setCarritoAbierto(false)}
              >
                ×
              </button>
            </header>

            {articulosCarrito.length > 0 ? (
              <div className="carrito-cuerpo">
                <div
                  className="carrito-articulos"
                  aria-label={t.cartItems}
                >
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

                <aside
                  className="carrito-resumen"
                  aria-label={t.priceSummary}
                >
                  <h3>{t.summary}</h3>
                  <dl>
                    <div>
                      <dt>{t.subtotal}</dt>
                      <dd>{moneda(subtotal)}</dd>
                    </div>
                    <div>
                      <dt>{t.tax}</dt>
                      <dd>{moneda(iva)}</dd>
                    </div>
                    <div className="carrito-total">
                      <dt>{t.total}</dt>
                      <dd>{moneda(total)}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="btn btn-ghost carrito-vaciar"
                    onClick={() => setCarrito({})}
                  >
                    {t.clear}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary carrito-continuar"
                    disabled={articulosCarrito.length === 0}
                    onClick={() => {
                      if (articulosCarrito.length === 0) return;

                      saveStoreCheckout({
                        items: articulosCarrito.map(
                          ({ producto, cantidad }) => ({
                            id: producto.id,
                            nombre: producto.nombre,
                            precio: producto.precio,
                            cantidad,
                          }),
                        ),
                        subtotal,
                        iva,
                        total,
                      });

                      setCarritoAbierto(false);
                      router.push("/tienda/pago");
                    }}
                  >
                    {t.checkout}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary carrito-continuar"
                    onClick={() => setCarritoAbierto(false)}
                  >
                    {t.continue}
                  </button>
                </aside>
              </div>
            ) : (
              <div className="carrito-vacio">
                <p>{t.emptyCart}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCarritoAbierto(false)}
                >
                  {t.explore}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
