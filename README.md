# Estación meteorológica · TT 2026-B033

Monorepo con la app web (Next.js) y la app móvil (Expo) de la Plataforma de Monitoreo y Visualización
Meteorológica (IPN, ESCOM). Comparten dominio y lógica desde `packages/`.

```bash
npm install
npm run web      # http://localhost:3000
npm run mobile   # Expo dev server
```

Arquitectura, convenciones, fuentes de datos y avance por fases: [AGENTS.md](AGENTS.md).
