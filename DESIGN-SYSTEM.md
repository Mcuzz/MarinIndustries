# Sistema visual de Marin Industries

## Auditoría y arquitectura

La identidad existente ya combina Archivo, IBM Plex Sans, IBM Plex Mono y Electrolize con superficies claras, azul marino y amarillo industrial. El problema era que el tema claro era el único definido como paleta global; el CSS de ventas contenía estados HEX con excepciones `.dark`, las pantallas de acceso y contacto usaban varios tonos Slate directamente y las variables de producto editorial repetían colores propios.

La organización actual tiene tres niveles, sin mover los selectores específicos que sustentan páginas y flujos existentes:

1. `app/design-tokens.css`: paletas semánticas para los dos temas, alias de compatibilidad, familias tipográficas, escala de texto, espaciado y geometría compartida.
2. `app/globals.css`: estilos base y componentes/áreas compartidas o heredadas de páginas, incluido el catálogo, la tienda, las secciones editoriales y sus ajustes responsivos.
3. `app/ventas/ventas.css`: estilos particulares de ventas y checkout; carga desde el layout raíz junto a las reglas globales.
4. `tailwind.config.ts`: expone los tokens a utilidades Tailwind y define las familias de fuente; `darkMode: "class"` se conserva.
5. `app/layout.tsx` y `src/presentation/components/layout/ThemeToggle.tsx`: inicialización sin destello del tema guardado o del sistema y control persistente del modo, disponible en el encabezado y en las pantallas de acceso y registro.

La auditoría encontró reglas de tienda y producto editorial acumuladas dentro de la hoja global, colores de estado repetidos y un espaciado de contenedor declarado aparte del sistema. Se conserva el CSS de página en sus selectores actuales para no desasociar estilos de componentes funcionales; `section-shell` ahora toma su ancho y margen lateral de los tokens.

## Modificar el sistema

- **Colores institucionales:** editar la paleta clara en `:root` de `app/design-tokens.css` (`--color-background`, superficies, bordes, texto, acento e interacción). Los `--brand-*` son alias que permiten migrar componentes gradualmente.
- **Colores del tema oscuro:** editar el bloque `:root.dark` del mismo archivo. La paleta oscura define sus superficies y contrastes por separado.
- **Fuentes:** cambiar `--font-display`, `--font-body`, `--font-technical` o `--font-mono` en `app/design-tokens.css`; actualizar el `@import` de Google Fonts en `app/globals.css` si se cambia la familia cargada.
- **Tamaños tipográficos:** ajustar `--type-display`, `--type-h1`, `--type-h2`, `--type-h3`, tamaños funcionales y alturas de línea en `app/design-tokens.css`. Las clases `.type-*` consumen esta escala.
- **Fondos y variantes de sección:** editar `[data-tone="base|alt|contrast|featured|editorial|dark"]` en `app/design-tokens.css`. Una página usa la variante asignando el atributo `data-tone`.
- **Variantes de componentes:** editar las clases compartidas en `app/globals.css` (por ejemplo `.btn-*`, `.card`, `.theme-toggle`) o los bloques de módulo en `app/ventas/ventas.css` para elementos exclusivos de ventas.
- **Espaciado global:** ajustar `--space-*`, `--content-width` y `--section-gutter` en `app/design-tokens.css`; el ancho y el padding de `.section-shell` se derivan de los dos últimos.
- **Tema:** la preferencia se guarda como `marin-theme` en `localStorage`; el script inicial y el control del encabezado deben conservar la misma clave.

## Tipografía y geometría

Archivo es la voz de exhibición; IBM Plex Sans mantiene lectura, navegación y formularios; Electrolize se conserva para identificadores y pequeños rótulos técnicos; IBM Plex Mono queda para códigos. La escala usa valores fluidos en display y encabezados, con texto funcional compacto. Los radios Tailwind siguen en cero para preservar la composición ortogonal existente.

## Validación

La validación realizada con `npx tsc --noEmit` y `npm run build` terminó correctamente. `npm run lint` queda pendiente: `next lint` abrió el asistente para crear una configuración ESLint porque el proyecto no tiene una. El tema oscuro debe revisarse visualmente en páginas con variantes y superficies antiguas; los paneles decorativos de previsualización mantienen su propio contraste por diseño.
