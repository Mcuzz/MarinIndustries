export type EstadoProducto = "activo" | "inactivo" | "agotado";

export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  creadoEn?: string;
};

export type ProductoImagen = {
  id: string;
  productoId: string;
  url: string;
  altTexto?: string;
  orden: number;
  esPortada: boolean;
};

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  existencia: number;
  estado: EstadoProducto;
  oferta?: boolean;
  categoria: string;
  categoriaId?: string;
  imagen: string; // URL de la imagen principal
  imagenes?: ProductoImagen[];
  creadoEn?: string;
  actualizadoEn?: string;
};

export type FiltroProductos = {
  categoria?: string;
  busqueda?: string;
  soloOfertas?: boolean;
  soloActivos?: boolean;
};
