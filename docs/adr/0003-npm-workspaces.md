# ADR-0003 · npm workspaces en vez de pnpm

- **Estado:** Aceptada (2026-10-20). Reemplaza la propuesta inicial de usar pnpm.

## Contexto
El plan proponía pnpm, pero no está instalado en la máquina de desarrollo. Expo y Next funcionan con npm
workspaces sin configuración extra, y Metro ya detecta el monorepo.

## Decisión
Usar npm workspaces, con un solo `package-lock.json` en la raíz. React, `@types/react` y TypeScript quedan en la
misma versión en las dos apps para que no se dupliquen.

## Consecuencias
- No hay que instalar nada global y el CI usa la caché nativa de `actions/setup-node`.
- npm hace *hoisting*: una dependencia no declarada en un workspace puede funcionar por accidente. El typecheck en
  CI y las revisiones de PR lo vigilan.
