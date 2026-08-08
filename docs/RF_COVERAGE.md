# Cobertura funcional — Release 1

Esta matriz enlaza los 53 comportamientos funcionales del documento maestro con la implementación. Los nombres se condensan para facilitar la ejecución de pruebas; el documento académico sigue siendo la fuente de verdad para la redacción formal.

| RF | Comportamiento comprobable | Ruta o capa | Estado R1 |
|---|---|---|---|
| RF-001 | Registrar una solicitud de servicio pública | `/solicitar-servicio` | Implementado |
| RF-002 | Validar datos del cliente, teléfono y cobertura | `/solicitar-servicio` + función SQL | Implementado |
| RF-003 | Consultar órdenes de servicio | `/admin/ordenes` | Implementado |
| RF-004 | Asignar un técnico activo | `/admin/ordenes` | Implementado |
| RF-005 | Programar fecha y hora de visita | `/admin/ordenes` | Implementado |
| RF-006 | Consultar trabajos asignados al técnico | `/tecnico/trabajos` | Implementado |
| RF-007 | Actualizar estados en secuencia válida | Detalle de trabajo + trigger SQL | Implementado |
| RF-008 | Impedir transiciones de estado inválidas | Trigger `validate_order_transition` | Implementado |
| RF-009 | Cargar evidencia antes de completar | Detalle técnico + Storage | Implementado |
| RF-010 | Consultar catálogo público activo | `/catalogo` | Implementado |
| RF-011 | Buscar productos | `/catalogo` | Implementado |
| RF-012 | Filtrar catálogo por categoría | `/catalogo` | Implementado |
| RF-013 | Filtrar por disponibilidad | `/catalogo` | Implementado |
| RF-014 | Consultar detalle y precio de producto | `/catalogo/:id` | Implementado |
| RF-015 | Distinguir disponible, agotado y bajo pedido | Tarjetas y detalle | Implementado |
| RF-016 | Consultar equipos de aire acondicionado | Catálogo, filtro AC | Implementado |
| RF-017 | Mostrar marca, BTU, precio y disponibilidad AC | Detalle de producto | Implementado |
| RF-018 | Solicitar instalación de AC | `/solicitar-servicio` | Implementado |
| RF-019 | Solicitar reparación de AC | `/solicitar-servicio` | Implementado |
| RF-020 | Validar descripción de falla o trabajo AC | Formulario + función SQL | Implementado |
| RF-021 | Gestionar órdenes AC con flujo común | Admin y técnico | Implementado |
| RF-022 | Consultar servicios handyman | `/servicios` | Implementado |
| RF-023 | Solicitar fontanería | `/solicitar-servicio` | Implementado |
| RF-024 | Solicitar electricidad | `/solicitar-servicio` | Implementado |
| RF-025 | Solicitar instalación rápida | `/solicitar-servicio` | Implementado |
| RF-026 | Gestionar handyman con agenda y técnico | Admin y técnico | Implementado |
| RF-027 | Registrar artículo de inventario | `/admin/productos` | Implementado |
| RF-028 | Validar código único y campos numéricos | Formulario + restricciones SQL | Implementado |
| RF-029 | Consultar y buscar inventario | `/admin/inventario` | Implementado |
| RF-030 | Actualizar información del artículo | `/admin/productos` | Implementado |
| RF-031 | Registrar entrada de inventario | `/admin/inventario` + RPC atómica | Implementado |
| RF-032 | Registrar salida de inventario | `/admin/inventario` + RPC atómica | Implementado |
| RF-033 | Impedir salida mayor al stock | RPC `record_inventory_movement` | Implementado |
| RF-034 | Desactivar y reactivar artículos | `/admin/productos` | Implementado |
| RF-035 | Gestionar proveedores, costo y disponibilidad | `/admin/proveedores` + tablas relacionadas | Implementado |
| RF-036 | Consultar reseñas aprobadas | `/resenas` | Implementado |
| RF-037 | Registrar reseña pendiente | `/resenas` + función SQL | Implementado |
| RF-038 | Aprobar una reseña | `/admin/resenas` | Implementado |
| RF-039 | Rechazar una reseña | `/admin/resenas` | Implementado |
| RF-040 | Registrar comprobante SINPE | `/pago-sinpe` | Implementado |
| RF-041 | Validar monto y referencia | Formulario + restricciones SQL | Implementado |
| RF-042 | Validar tipo y tamaño del archivo | Servicio de carga + Storage | Implementado |
| RF-043 | Confirmar pago pendiente | `/admin/pagos` | Implementado |
| RF-044 | Rechazar pago con motivo obligatorio | `/admin/pagos` | Implementado |
| RF-045 | Autenticar personal interno | `/ingresar` + Supabase Auth | Implementado |
| RF-046 | Recuperar y restablecer contraseña | Rutas de recuperación | Implementado |
| RF-047 | Autorizar funciones por rol | Rutas protegidas + RLS | Implementado |
| RF-048 | Consultar usuarios internos | `/admin/usuarios` | Implementado |
| RF-049 | Desactivar y reactivar usuarios | `/admin/usuarios` | Implementado |
| RF-050 | Seleccionar productos y servicios para cotizar | `/cotizador` | Implementado |
| RF-051 | Cambiar cantidades y eliminar elementos | Cotizador público y edición administrativa | Implementado |
| RF-052 | Calcular subtotal, adicionales y total | UI + funciones SQL transaccionales | Implementado |
| RF-053 | Generar, editar y consultar cotización con vigencia | `/cotizador`, `/admin/cotizaciones` | Implementado |

## Fuera de alcance confirmado

- Continuación o notificaciones por WhatsApp (planificada para Release 2).
- Aplicación móvil nativa y notificaciones push.
- Cobro bancario automático: SINPE registra comprobantes para revisión manual.
