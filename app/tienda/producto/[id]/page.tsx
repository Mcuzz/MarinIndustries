
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/src/infrastructure/composition/root-container";
import { PageShell } from "@/src/presentation/components/layout/PageShell";

type PaginaProductoProps = {
  params: Promise<{ id: string }>;
};

async function obtenerProducto(id: string) {
  return container.products.getProductById(id);
}

export async function generateMetadata({
  params,
}: PaginaProductoProps): Promise<Metadata> {
  const { id } = await params;
  const producto = await obtenerProducto(id);

  if (!producto || producto.estado !== "activo") {
    return { title: "Producto no disponible | Marin Industries" };
  }

  const descripcion =
    producto.descripcion?.trim() ||
    `Consulta el precio y los detalles de ${producto.nombre} en Marin Industries.`;

  const imagen = producto.imagen;

  return {
    title: `${producto.nombre} | Marin Industries`,
    description: descripcion,
    openGraph: {
      title: producto.nombre,
      description: `${descripcion} Precio: $${producto.precio} MXN.`,
      type: "website",
      images: imagen ? [{ url: imagen, alt: producto.nombre }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: producto.nombre,
      description: descripcion,
      images: imagen ? [imagen] : [],
    },
  };
}

export default async function PaginaProducto({
  params,
}: PaginaProductoProps) {
  const { id } = await params;
  const producto = await obtenerProducto(id);

  if (!producto || producto.estado !== "activo") {
    notFound();
  }

  const precio = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(producto.precio);

  return (
    <PageShell>
      <main className="producto-publico">
        <div className="producto-publico__contenedor">
          <Link href="/tienda" className="producto-publico__volver">
            ← Ir a la tienda
          </Link>

          <article className="producto-publico__tarjeta">
            <div className="producto-publico__imagen">
              {producto.imagen ? (
                <img src={producto.imagen} alt={producto.nombre} />
              ) : (
                <span>Imagen no disponible</span>
              )}
            </div>

            <div className="producto-publico__contenido">
              <span className="eyebrow">
                MARIN INDUSTRIES / PRODUCTOS
              </span>

              <p className="producto-publico__categoria">
                {producto.categoria}
              </p>

              <h1>{producto.nombre}</h1>

              <p className="producto-publico__precio">{precio} MXN</p>

              <p className="producto-publico__descripcion">
                {producto.descripcion}
              </p>

              <Link
                href="/tienda"
                className="btn btn-primary"
              >
                Ir a la tienda
              </Link>

              <p className="producto-publico__nota">
                Ingeniería · Tecnología · Suministro
              </p>
            </div>
          </article>
        </div>
      </main>
    </PageShell>
  );
}
