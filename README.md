# VendeloTodo

Aplicación web responsive para el proyecto académico de Quality Assurance de VendeloTodo. Incluye catálogo público, servicios handyman y AC, cotizador, solicitudes, pagos SINPE, reseñas moderadas, inventario, órdenes, administración y portal técnico.

## Tecnología

- React 18 + Vite
- Supabase PostgreSQL, Auth y Storage
- React Router
- CSS responsive sin framework
- Preparado para Vercel

## 1. Probar inmediatamente en modo demostración

El proyecto funciona sin conectar Supabase. En ese modo usa datos QA guardados en el navegador; sirve para revisar pantallas y ejecutar pruebas de caja negra preliminares.

```powershell
npm install
npm run dev
```

Abra `http://localhost:5173`.

Credenciales de demostración:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@vendelotodo.test` | `AdminQA2026!` |
| Técnico 1 | `tecnico1@vendelotodo.test` | `TecnicoQA2026!` |
| Técnico 2 | `tecnico2@vendelotodo.test` | `TecnicoQA2026!` |

El modo demostración se activa cuando no existe una `VITE_SUPABASE_ANON_KEY` válida. Sus cambios quedan en `localStorage`; puede restaurarlos borrando los datos del sitio en el navegador.

## 2. Conectar el proyecto real de Supabase

Proyecto ya definido:

```text
https://spkjbhzutrnjnebemutl.supabase.co
```

1. Copie `.env.example` como `.env`.
2. En Supabase abra **Project Settings → API**.
3. Pegue la clave `anon/public` en `VITE_SUPABASE_ANON_KEY`.
4. Nunca coloque la clave `service_role` en una variable que empiece por `VITE_`.

En **SQL Editor**, ejecute en este orden:

1. `supabase/schema.sql`
2. `supabase/policies.sql`

Esto crea tablas, relaciones, validaciones, funciones atómicas, políticas RLS y los buckets privados `payment-proofs` y `order-evidence`.

## 3. Crear los tres usuarios QA

La creación de cuentas de Supabase Auth requiere temporalmente la `service_role`. Se usa solo desde su computadora, nunca desde React ni Vercel.

1. Agregue `SUPABASE_SERVICE_ROLE_KEY` al archivo local `.env`.
2. Ejecute:

```powershell
npm run create:test-users
```

3. Compruebe las cuentas en **Supabase → Authentication → Users**.
4. Puede retirar la `service_role` del `.env` al terminar.
5. Ejecute `supabase/seed.sql` en SQL Editor.

El seed es repetible e incluye:

- stock normal, stock exactamente en mínimo, stock cero y bajo pedido;
- un artículo inactivo que no aparece públicamente;
- equipos AC, repuestos, electrodomésticos y ferretería;
- proveedores activos e inactivos;
- órdenes `Pending`, `Assigned`, `OnTheWay`, `InProgress` y `Completed`;
- pagos `Pending`, `Confirmed` y `Rejected`;
- reseñas `Pending` y `Approved`;
- cotizaciones y elementos con precios reproducibles.

## 4. Configuración de autenticación

En **Authentication → URL Configuration** agregue:

```text
Site URL: http://localhost:5173
Redirect URL: http://localhost:5173/restablecer-clave
```

Después del despliegue agregue también la URL de Vercel y:

```text
https://SU-PROYECTO.vercel.app/restablecer-clave
```

## 5. Verificar antes del despliegue

```powershell
npm run lint
npm run build
npm run preview
```

## 6. Subir a GitHub y Vercel

Repositorio previsto: `https://github.com/luisferucat/vendelotodo`.

Después del primer push:

1. Entre a Vercel y seleccione **Add New → Project**.
2. Importe `luisferucat/vendelotodo`.
3. Framework: Vite; build: `npm run build`; salida: `dist`.
4. Configure solamente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Despliegue y agregue la URL final en Supabase Auth.

`vercel.json` ya incluye la reescritura necesaria para que las rutas de React funcionen al recargar.

## 7. Correos de confirmación de cotizaciones y órdenes

Los correos de autenticación (confirmación de cuenta y recuperación de contraseña) salen desde el SMTP configurado en Supabase. Las confirmaciones de cotizaciones y solicitudes de servicio usan una función privada de Vercel, siguiendo el mismo patrón de Herbalist.

En **Vercel → Project Settings → Environment Variables**, agregue para Production, Preview y Development:

```text
GMAIL_USER=vedelotodoucat@gmail.com
GMAIL_APP_PASSWORD=CONTRASENA_DE_APLICACION_DE_GOOGLE
```

Use una contraseña de aplicación de Google exclusiva para Vercel y nunca una contraseña normal de Gmail. No agregue el prefijo `VITE_`, no guarde el valor real en `.env.example` y no lo suba a GitHub. Después de crear o cambiar estas variables, haga un nuevo despliegue.

El correo es obligatorio en los formularios públicos de cotización y orden. El registro se guarda primero en Supabase y luego se intenta enviar la confirmación: si Gmail falla, la pantalla conserva el número generado y avisa que el correo no pudo enviarse.

## Estructura principal

```text
src/
├── components/       componentes reutilizables
├── context/          sesión, perfil y mensajes
├── data/             dataset de demostración
├── layouts/          sitio público y portales internos
├── lib/              cliente Supabase
├── pages/
│   ├── public/       catálogo, servicios, cotizador, SINPE y reseñas
│   ├── admin/        productos, inventario, órdenes, pagos y moderación
│   └── technician/   agenda, estados y evidencia
├── services/         acceso centralizado a datos
├── styles/           diseño responsive
└── utils/            validaciones y formatos

supabase/
├── schema.sql
├── policies.sql
└── seed.sql
```

La trazabilidad de los 53 RF está en [`docs/RF_COVERAGE.md`](docs/RF_COVERAGE.md). La introducción al sistema, arquitectura, accesos y reglas para el equipo de pruebas está en [`docs/GUIA_PRUEBAS_COMPANEROS.md`](docs/GUIA_PRUEBAS_COMPANEROS.md).

## Decisiones del Release 1

- La interfaz está en español; tablas, campos, estados y variables están en inglés.
- El cliente público no necesita registrarse.
- Administrador y Técnico requieren Auth y un perfil activo.
- WhatsApp queda explícitamente fuera del alcance. No hay botones simulados.
- Los pagos SINPE no mueven dinero: reciben un comprobante que el administrador confirma o rechaza.
- La desactivación es lógica; no se borran artículos ni usuarios con historial.
- Inventario es la única fuente de stock y las salidas se procesan de manera atómica.
- Las cotizaciones `Draft` y `Sent` pueden editarse; al aprobarlas o rechazarlas quedan como solo lectura.
- Al editar una cotización se conservan los precios históricos de sus elementos y los elementos nuevos usan el precio vigente.

Correo del proyecto: `vedelotodoucat@gmail.com`.
