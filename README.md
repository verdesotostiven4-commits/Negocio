# Barrio MAX TV

Sistema de cartelería digital para la TV de Barrio MAX. Incluye:

- reproductor horizontal a pantalla completa en `/tv`;
- panel privado en `/admin`;
- carga de videos, imágenes y audios grandes mediante Vercel Blob;
- playlist editable, orden, duración, transiciones y publicación automática;
- música de fondo y voz en off por anuncio;
- programación por fechas, días y horarios;
- modo PWA, pantalla completa, Wake Lock y recuperación sin conexión;
- contenido inicial basado en las fotos reales del local.

## Enlaces

- TV: `https://TU-PROYECTO.vercel.app/tv`
- Administración: `https://TU-PROYECTO.vercel.app/admin`
- Salud/configuración: `https://TU-PROYECTO.vercel.app/api/health`

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. En **Storage**, crea un almacén **Blob público** y conéctalo al proyecto. Vercel añadirá `BLOB_READ_WRITE_TOKEN`.
3. En **Settings → Environment Variables**, agrega:
   - `ADMIN_PIN`: PIN de 4 o más dígitos.
   - `AUTH_SECRET`: una cadena larga y aleatoria.
4. Vuelve a desplegar.
5. Abre `/admin`, sube videos, imágenes o audios y pulsa **Publicar cambios**.
6. En la TV abre `/tv`, activa sonido una vez y entra en pantalla completa.

## Música y voces

- La música debe ser propia, con licencia o libre de derechos.
- Puedes generar voces en ElevenLabs, descargar el MP3, subirlo desde el panel y pegar su URL en “Voz en off”.
- Los navegadores bloquean audio automático hasta una primera interacción; por eso la TV muestra un botón para activar música y voces.

## Flujo recomendado

1. Crear una pieza en Canva, CapCut, Gemini u otra herramienta.
2. Exportar en MP4 horizontal 1920×1080.
3. Subir desde `/admin`.
4. Ordenar, definir duración y transición.
5. Publicar. La TV se actualiza automáticamente.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sin Vercel Blob, el reproductor funciona en modo demostración con el contenido incluido, pero el panel no puede guardar ni subir archivos.
