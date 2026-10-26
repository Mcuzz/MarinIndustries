
"use client";

import { useEffect, useRef, useState } from "react";
import type { Producto } from "./TarjetaProducto";
import { PlantillaProductoEditorial } from "./PlantillaProducto";

type CompartirProductoModalProps = {
  producto: Producto;
  onCerrar: () => void;
};

const moneda = (precio: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(precio);

export function CompartirProductoModal({
  producto,
  onCerrar,
}: CompartirProductoModalProps) {
  const plantillaRef = useRef<HTMLDivElement>(null);

  const [procesando, setProcesando] = useState(false);
  const [estado, setEstado] = useState("");
  const [enlace, setEnlace] = useState("");

  const texto = [
    producto.nombre,
    producto.descripcion,
    `Precio: ${moneda(producto.precio)} MXN`,
    "Conoce más en Marin Industries.",
  ].join("\n\n");

  useEffect(() => {
    setEnlace(
      `${window.location.origin}/tienda/producto/${encodeURIComponent(
        producto.id,
      )}`,
    );
  }, [producto.id]);

  useEffect(() => {
    const cerrarEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCerrar();
    };

    window.addEventListener("keydown", cerrarEscape);

    return () => {
      window.removeEventListener("keydown", cerrarEscape);
    };
  }, [onCerrar]);

  const generarImagen = async (): Promise<Blob> => {
    const contenedor = plantillaRef.current;

    if (!contenedor) {
      throw new Error("La vista previa no está disponible.");
    }

    const plantilla = contenedor.querySelector<HTMLElement>(
      ".editorial-producto",
    );

    if (!plantilla) {
      throw new Error("No se encontró la plantilla editorial.");
    }

    await document.fonts.ready;

    const imagenes = Array.from(plantilla.querySelectorAll("img"));

    await Promise.all(
      imagenes.map(async (imagen) => {
        if (!imagen.complete || imagen.naturalWidth === 0) {
          await new Promise<void>((resolve, reject) => {
            imagen.addEventListener("load", () => resolve(), {
              once: true,
            });

            imagen.addEventListener(
              "error",
              () =>
                reject(
                  new Error("No se pudo cargar la imagen del producto."),
                ),
              { once: true },
            );
          });
        }

        if (imagen.decode) {
          await imagen.decode();
        }
      }),
    );

    const { toCanvas } = await import("html-to-image");

    const dimensiones = plantilla.getBoundingClientRect();
    const ancho = dimensiones.width;
    const alto = dimensiones.height;

    if (!ancho || !alto) {
      throw new Error("La plantilla no tiene dimensiones visibles.");
    }

    const canvas = await toCanvas(plantilla, {
      width: ancho,
      height: alto,
      pixelRatio: 2,
      backgroundColor: "#f0f0ec",
      cacheBust: true,
    });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      throw new Error("No se pudo convertir la vista previa a PNG.");
    }

    return blob;
  };

  const descargarBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const enlaceDescarga = document.createElement("a");

    enlaceDescarga.href = url;
    enlaceDescarga.download = `marin-${producto.id}-producto.png`;

    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    enlaceDescarga.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const descargarImagen = async () => {
    setProcesando(true);
    setEstado("");

    try {
      const blob = await generarImagen();
      descargarBlob(blob);
      setEstado("Imagen PNG generada y descargada.");
    } catch (error) {
      setEstado(
        error instanceof Error
          ? error.message
          : "No se pudo generar la imagen.",
      );
    } finally {
      setProcesando(false);
    }
  };

  const copiarTexto = async () => {
    if (!enlace) {
      setEstado("El enlace del producto todavía no está disponible.");
      return;
    }

    try {
      await navigator.clipboard.writeText(`${texto}\n\n${enlace}`);
      setEstado("Texto comercial y enlace copiados.");
    } catch {
      setEstado("No se pudo copiar el texto en este navegador.");
    }
  };

  const copiarEnlace = async () => {
    if (!enlace) {
      setEstado("El enlace del producto todavía no está disponible.");
      return;
    }

    try {
      await navigator.clipboard.writeText(enlace);
      setEstado("Enlace del producto copiado.");
    } catch {
      setEstado(
        "No se pudo copiar el enlace. Intenta desde una conexión segura.",
      );
    }
  };

  const compartirDispositivo = async () => {
    setProcesando(true);
    setEstado("");

    try {
      const blob = await generarImagen();
      const archivo = new File(
        [blob],
        `marin-${producto.id}-producto.png`,
        { type: "image/png" },
      );

      if (
        navigator.share &&
        navigator.canShare?.({ files: [archivo] })
      ) {
        await navigator.share({
          title: producto.nombre,
          text: `${texto}\n\n${enlace}`,
          files: [archivo],
        });

        setEstado("Se abrió el menú para compartir.");
      } else {
        descargarBlob(blob);

        if (enlace) {
          await navigator.clipboard.writeText(`${texto}\n\n${enlace}`);
          setEstado(
            "Imagen descargada y texto copiado. Adjunta la imagen en la aplicación deseada.",
          );
        } else {
          setEstado(
            "Imagen descargada. Comparte el texto y el enlace cuando estén disponibles.",
          );
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setEstado("Se canceló el menú de compartir.");
      } else {
        setEstado(
          error instanceof Error
            ? error.message
            : "No se pudo compartir el producto.",
        );
      }
    } finally {
      setProcesando(false);
    }
  };

  const abrirRedSocial = (
    red: "facebook" | "x" | "whatsapp",
  ) => {
    if (!enlace) {
      setEstado("El enlace del producto todavía no está disponible.");
      return;
    }

    const destinos = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        enlace,
      )}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${producto.nombre} — ${moneda(producto.precio)} MXN`,
      )}&url=${encodeURIComponent(enlace)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        `${texto}\n\n${enlace}`,
      )}`,
    };

    window.open(destinos[red], "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="tienda-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <section
        className="compartir-producto-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compartir-producto-titulo"
      >
        <header className="compartir-producto-modal__header">
          <div>
            <span className="eyebrow">
              MARIN INDUSTRIES / SOCIAL ASSETS
            </span>

            <h2 id="compartir-producto-titulo">
              Compartir producto
            </h2>

            <p>{producto.nombre}</p>
          </div>

          <button
            type="button"
            className="compartir-producto-modal__cerrar"
            aria-label="Cerrar"
            onClick={onCerrar}
          >
            ×
          </button>
        </header>

        <div className="compartir-producto-modal__preview">
          <div className="compartir-producto-modal__lienzo">
            <div ref={plantillaRef}>
              <PlantillaProductoEditorial producto={producto} />
            </div>
          </div>
        </div>

        <footer className="compartir-producto-modal__acciones">
          <button
            type="button"
            className="btn btn-primary"
            disabled={procesando}
            onClick={descargarImagen}
          >
            {procesando ? "Procesando..." : "Descargar PNG"}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={procesando}
            onClick={compartirDispositivo}
          >
            Compartir imagen
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={!enlace || procesando}
            onClick={copiarTexto}
          >
            Copiar texto
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={!enlace || procesando}
            onClick={() => abrirRedSocial("whatsapp")}
          >
            WhatsApp
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={!enlace || procesando}
            onClick={() => abrirRedSocial("facebook")}
          >
            Facebook
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={!enlace || procesando}
            onClick={() => abrirRedSocial("x")}
          >
            X
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            disabled={!enlace || procesando}
            onClick={copiarEnlace}
          >
            Copiar enlace
          </button>

          {estado && (
            <p
              className="compartir-producto-modal__estado"
              role="status"
              aria-live="polite"
            >
              {estado}
            </p>
          )}
        </footer>
      </section>
    </div>
  );
}
