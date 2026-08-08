# Defectos intencionales para prácticas de QA

Estos defectos fueron sembrados deliberadamente para diseñar y ejecutar casos de prueba educativos. Son de severidad baja o media y no impiden iniciar sesión, consultar el catálogo, registrar cotizaciones u órdenes, administrar inventario ni revisar pagos.

> Este documento funciona como clave de respuestas. No debe entregarse a quien vaya a descubrir los defectos mediante pruebas exploratorias.

## QA-BUG-001 — Enlace de Facebook con destino incorrecto

- **Área:** pie de página público.
- **Precondición:** abrir cualquier página pública.
- **Pasos:** localizar el enlace `Facebook` y abrirlo.
- **Resultado esperado:** abrir la página oficial de Facebook de VendeloTodo.
- **Resultado actual:** abre la página principal de Meta (`https://www.meta.com/`).
- **Tipo sugerido:** navegación / enlace roto.
- **Severidad:** baja.

## QA-BUG-002 — El nombre acepta únicamente números

- **Área:** cotizador y solicitud de servicio.
- **Precondición:** completar el resto de los campos con datos válidos.
- **Pasos:** escribir `12345` como nombre y enviar el formulario.
- **Resultado esperado:** mostrar una validación porque un nombre no debería estar compuesto únicamente por números.
- **Resultado actual:** el formulario y la base de datos aceptan el valor como nombre.
- **Tipo sugerido:** validación de datos.
- **Severidad:** media.

## QA-BUG-003 — La búsqueda distingue mayúsculas de minúsculas

- **Área:** catálogo público.
- **Precondición:** tener el producto `Taladro inalámbrico 20V` en el catálogo.
- **Pasos:** buscar primero `Taladro` y después `taladro`.
- **Resultado esperado:** ambas búsquedas deben devolver el mismo producto.
- **Resultado actual:** `Taladro` encuentra el producto, pero `taladro` no devuelve resultados.
- **Tipo sugerido:** búsqueda / equivalencia de entradas.
- **Severidad:** baja.

## QA-BUG-004 — Las reseñas muestran una estrella menos

- **Área:** página pública de reseñas.
- **Precondición:** existir una reseña aprobada con calificación conocida.
- **Pasos:** comparar la calificación almacenada con la cantidad de estrellas visibles.
- **Resultado esperado:** una reseña de 5 debe mostrar 5 estrellas.
- **Resultado actual:** una reseña de 5 muestra 4 estrellas; una de 4 muestra 3.
- **Tipo sugerido:** presentación / límite inferior.
- **Severidad:** baja.

## QA-BUG-005 — Asunto incorrecto en la confirmación de una orden

- **Área:** correo transaccional de solicitud de servicio.
- **Precondición:** Gmail configurado en Vercel y una dirección válida.
- **Pasos:** registrar una nueva solicitud de servicio y revisar el asunto del correo recibido.
- **Resultado esperado:** `Solicitud recibida - OT-AAAA-NNNN`.
- **Resultado actual:** `Cotización recibida - OT-AAAA-NNNN`, aunque el contenido del correo corresponde correctamente a la orden.
- **Tipo sugerido:** contenido / notificación.
- **Severidad:** baja.

## Sugerencia para los casos de prueba

Para cada defecto documente: identificador, requisito relacionado, prioridad, precondiciones, datos de entrada, pasos numerados, resultado esperado, resultado obtenido, evidencia y estado. Después agregue al menos una prueba positiva y una negativa alrededor de la misma regla.
