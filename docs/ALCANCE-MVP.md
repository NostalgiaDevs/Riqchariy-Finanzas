# Alcance del Piloto — Riqchariy v0.1

> 2 semanas · 3 personas · 5 minijuegos · 1 chatbot · Deploy en Vercel + Render

## ✅ ENTRA en el piloto

### Motor Pacha (core)
- Ticks manuales (botón "Avanzar día")
- Pipeline completo: income → expense → credit → savings → goals → stress → scoring → events → persist
- PlayerEconomy con wallet, 3 frascos de ahorro, loans, credit score, stress, score, league
- 3 trabajos (ayudante, kiosquero titular, repartidor)
- Gastos fijos (comida, celular, pasajes)
- Sistema de crédito (banco, cuotas de tienda, prestamista)
- Credit score (300–850) con subidas y bajadas
- Estrés (0–1) como termómetro emocional
- Score financiero (0–1000) con 5 componentes
- 4 ligas (Chaski → Qollqa → Amauta → Apu)
- 15 eventos (6 emergencias, 3 tentaciones, 5 oportunidades, 3 macro, 3 social)
- Preview de decisiones (mostrar impacto antes de elegir)
- Tienda con 12 items y rotación semanal
- Sistema de misiones semanales (3 activas)
- RNG determinista con semilla por jugador

### Minijuegos (5)
1. **Kiosco** — gestión de inventario, compra/venta rápida
2. **La Trampa** — identificar estafas y ofertas engañosas
3. **Qori Quiz** — preguntas de educación financiera
4. **Invierte o Pierde** — simulación simplificada de inversión
5. **Mercado Rápido** — negociación bajo presión de tiempo

### Chatbot Qori
- RAG con pgvector sobre 20 conceptos financieros
- Claude Sonnet como modelo base
- System prompt adaptado para menores
- Contexto del estado del jugador en cada pregunta
- Guardrails: seguridad, redireccionamiento, límite de largo

### Frontend
- Auth (registro + login)
- Dashboard principal con estado económico
- Vista de evento con opciones y preview
- Acceso a cada minijuego
- Chat con Qori
- Leaderboard del aula
- Vista de misiones
- Tienda
- Gestión de frascos de ahorro
- Responsive (mobile-first)

### Infraestructura
- Backend: FastAPI en Render
- BD: PostgreSQL en Render (con pgvector)
- Cache: Upstash Redis
- Frontend: Vercel
- CI básico: lint + format check

---

## ❌ NO ENTRA en el piloto

| Feature | Razón | Cuándo |
|---------|-------|--------|
| Auto-ticks (avance automático) | Complejidad de workers | v0.2 |
| Qhatu (mercado entre jugadores) | P2P requiere sincronización | v0.2 |
| Dashboard docente | Foco en experiencia del alumno primero | v0.2 |
| Multi-tenancy (múltiples aulas) | Un aula es suficiente para validar | v0.3 |
| Inversiones completas | Se desbloquean en semana 5 del GDD | v0.2 |
| Eventos estacionales | Temporada corta del piloto | v0.2 |
| Reinicio con herencia | Requiere cierre de temporada | v0.3 |
| Panel banco central docente avanzado | Prioridad baja para piloto | v0.3 |
| Eventos macro compartidos de aula | Simplificación de alcance | v0.2 |
| Notificaciones push reales | Complejidad, no esencial | v0.2 |
| Integración con SBS/BCRP (datos reales) | Piloto usa datos internos | v0.3 |
| Accesibilidad avanzada (WCAG AA) | Iteración post-piloto | v0.2 |
| i18n (quechua, aymara) | Post-validación del concepto | v0.4 |
| Tests automatizados completos | Sprint 4 tiene tests básicos | v0.2 |

---

## Definición de "listo" (piloto entregable)

- [ ] Un alumno puede registrarse, entrar, y avanzar días
- [ ] El pipeline Pacha corre sin errores por 28 ticks (1 mes virtual)
- [ ] Al menos 3 de 5 minijuegos funcionan correctamente
- [ ] Qori responde preguntas con contexto del jugador
- [ ] El leaderboard muestra rankings del aula
- [ ] Deploy estable en Vercel + Render por 48h sin caídas
- [ ] No hay datos personales reales almacenados (solo alias del juego)

## Métricas de éxito del piloto

1. ≥60% de alumnos entra al menos 3 veces en la semana
2. Sesión promedio ≥ 5 minutos
3. ≥50% usa previews antes de decidir
4. 0 alumnos atrapados en espiral de deuda sin salida
5. Qori responde ≥80% de preguntas de forma relevante
6. 0 errores críticos que impidan jugar
