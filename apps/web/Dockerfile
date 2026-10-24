# Imagen de la app web. Se construye desde la raíz del repo:
#   docker build -f apps/web/Dockerfile .

FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
# Los paquetes compartidos (@tt/core, @tt/i18n, @tt/tokens, @tt/sky-art) son dependencias de la web.
COPY packages/core/package.json packages/core/
COPY packages/i18n/package.json packages/i18n/
COPY packages/tokens/package.json packages/tokens/
COPY packages/sky-art/package.json packages/sky-art/
RUN npm ci --workspace=web --include-workspace-root --ignore-scripts --no-audit --no-fund
COPY packages packages
COPY apps/web apps/web
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_CLOUD_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=web

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 8080
CMD ["node", "apps/web/server.js"]
