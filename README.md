# LinkHub PWA

Esta aplicación es una Progressive Web App (PWA) para guardar enlaces web organizados por etiquetas y categorías. Permite importar y exportar copias de seguridad y puede instalarse como app en dispositivos compatibles.

## Características principales
- Guardar enlaces a páginas web
- Organización por categorías y etiquetas
- Importar y exportar copias de seguridad (JSON)
- Instalación como aplicación (PWA)
- Interfaz moderna y responsive

## Instalación y uso

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre la app en tu navegador y sigue las instrucciones para instalarla como PWA.

## Estructura del proyecto
- `index.html`: Entrada principal de la app
- `src/`: Código fuente principal

## Próximos pasos
- Implementar la lógica de importación/exportación
- Añadir soporte offline y manifest.json para PWA
- Mejorar la UI/UX

## Sincronización entre dispositivos con Dropbox (en la app)

La app permite que cada usuario conecte su cuenta de Dropbox y sincronice sus enlaces entre dispositivos. No requiere servidores: todo ocurre en el navegador mediante OAuth 2.0 con PKCE.

### Configuración (solo desarrollador)
- Crea una app en Dropbox (Scoped App) y copia el App Key.
- En desarrollo/producción define la variable `VITE_DROPBOX_APP_KEY` (por ejemplo en `.env`):
  - `.env`: `VITE_DROPBOX_APP_KEY=TU_APP_KEY`
- En la consola de Dropbox, añade como Redirect URI la URL de la app (por ejemplo, `http://localhost:5173/` y tu dominio de producción) apuntando a la raíz donde se sirve `index.html`.

### Uso (usuario final)
- Abre la app y pulsa “Conectar Dropbox”.
- Autoriza la app; al volver, se realizará una sincronización inicial.
- A partir de ahí:
  - Cada cambio local dispara una sync diferida (debounced).
  - Puedes forzar “Sincronizar ahora”.
  - Si cierras/abres en otro dispositivo y estás conectado, se descarga la última copia.

### Detalles técnicos
- Archivo remoto: `/linkhub/links.json` en la carpeta de la app de Dropbox.
- Estrategia: se compara `updatedAt` (marca de tiempo) y se usa el más reciente; en cambios locales se sube con `overwrite`.
- Tokens: se usa OAuth 2.0 PKCE con `token_access_type=offline` para poder refrescar tokens en el cliente. Se almacenan en `localStorage` del navegador.

Importante: esta sincronización es por-usuario. No hay sincronización “global” en CI; el contenido es privado de cada usuario en su Dropbox.
