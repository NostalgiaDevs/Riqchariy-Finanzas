# Sprint 3 — frontend (demostración con mocks)

Fecha de implementación: 15 de octubre de 2026. Rama: `feat/juegos-tienda-qori`.

## Entregado para demostración con mocks

- `S3.FE.01`: Invierte o Pierde, seis rondas con capital inicial de ⵊ100, cuatro opciones, crisis en la ronda 3, pérdida del negocio del primo en la ronda 5, comparación gráfica y envío de resultado. La lógica usa un reducer puro con variación inyectable; las pruebas fijan esa variación para obtener resultados reproducibles.
- `S3.FE.02`: Mercado Rápido (cinco rondas de 30 segundos, seis productos, investigación al mantener presionado, producto trampa y margen) y Qori Quiz (diez situaciones, feedback inmediato, puntuación y tema a reforzar).
- `S3.FE.03`: página y burbuja flotante de Qori, chat accesible, preguntas sugeridas, estado de espera e historial temporal mientras la app permanece abierta. En modo mock responde con reglas educativas simples y algunos datos del estado de la partida; **no es un modelo de IA ni RAG**.
- `S3.FE.04`: hub con cinco juegos disponibles y tienda de doce artículos, compra al contado o en cuotas, comparación del costo total y actualización simulada de billetera y deuda.

## Pendiente de integración

La base de datos y el backend reales aún no están disponibles. Los endpoints `POST /games/results`, `GET /shop/items`, `POST /shop/buy` y `POST /chatbot/message` están preparados en el cliente, pero las pruebas actuales utilizan MSW. Cuando el backend esté listo, validar el contrato de los resultados de los juegos 3–5, el saldo y las cuotas de la tienda, las respuestas de Qori y el manejo de errores reales. El historial del chat no se persiste, según el alcance del piloto.

No se deben presentar las recompensas, las compras ni las respuestas de Qori de esta demo como datos persistidos o generados por IA.

## Verificación

`npm run build`, `npm run lint` y `npm run test` (65 pruebas); además, recorridos manuales de compra en cuotas, chat, quiz y pantallas a 375 px y en escritorio.
