# Weather Dashboard - Estación Meteorológica

TDashboard de monitoreo meteorologico en tiempo real, desarrollado con [Next.js 16](https://nextjs.org/), [React 19](https://react.dev/), y [Tailwind CSS 4](https://tailwindcss.com/).

## Tabla de Contenidos

- [Inicio Rapido](#inicio-rapido)
- [Uso de la Aplicacion](#uso-de-la-aplicacion)

## Inicio rápido

### Requisitos previos

Para poder ejecutar el presente sitio web, se requiere tener instalado en el sistema operativo las siguientes dependencias:

- [Node.js](https://nodejs.org/en/download) 18.x o superior.
- PNPM (recomendado) o NPM / Yarn.
- [Git](https://git-scm.com/install/).

### Instalación

Para poder correr el programa, primero se requiere clonar el repositorio, posteriormente instalar dependencias, e iniciar el servidor de desarrollo.

```bash
# Clonar el repositorio
git clone https://github.com/Samu31Nd/weather-dashboard.git
cd weather-dashboard
# Instalar dependencias
pnpm install
# Iniciar servidor de desarrollo
pnpm dev
```

Si la consola no muestra ningún error, entonces la aplicación estará disponible en `https://localhost:3000`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Scripts Disponibles

Los siguientes scripts son ejecutables para poder hacer que el programa funcione de cierta forma:

| Comando      | Descripcion                                     |
| ------------ | ----------------------------------------------- |
| `pnpm dev`   | Inicia el servidor de desarrollo con Hot Reload |
| `pnpm build` | Genera build de produccion                      |
| `pnpm start` | Ejecuta la aplicacion en modo produccion        |
| `pnpm lint`  | Ejecuta ESLint para analisis de codigo          |

## Uso de la Aplicacion

### Vista Principal (Dashboard)

El dashboard principal muestra datos meteorologicos en tiempo real obtenidos de la estacion Davis WeatherLink ubicada en `http://148.204.57.118/wflexp.json`.

**Caracteristicas:**

- **Tarjeta Principal**: Temperatura exterior, humedad e indice de sensacion termica
- **Tarjeta de Viento**: Velocidad, rafagas y direccion con brujula visual
- **Tarjeta de Barometro**: Presion atmosferica con indicador de tendencia
- **Tarjeta de Lluvia**: Tasa de lluvia y acumulados
- **Tarjeta Interior**: Condiciones dentro del edificio
- **Tarjeta de Astronomia**: Horas de amanecer y atardecer

**Auto-actualizacion:** Los datos se refrescan automaticamente cada 60 segundos.

### Vista de Datos Historicos

Permite consultar y visualizar datos historicos mediante graficas interactivas.

**Controles de Consulta:**

1. **Seleccion de Vistas de Datos** (multi-seleccion):

- Temperatura (Humedad exterior)
- Viento (Velocidad y rafagas)
- Lluvia (Acumulado)
- Presion (Barometrica normalizada)

2. **Modos de Consulta**:

- **Dia Especifico**: Selecciona una fecha del calendario
- **Rango de Fechas**: Define fecha/hora inicio y fin
- **Ultimos N Dias**: Slider para seleccionar de 1 a 30 dias

3. **Descarga de Datos**:

- **JSON**: Exporta los datos procesados de la API Cloud Functions
- **CSV**: Descarga directa del endpoint original con todos los parametros

**Cache Local:** Los datos se almacenan en localStorage por 24 horas para consultas rapidas. El sistema limpia automaticamente entradas mayores a 7 dias.

### Sidebar y Configuracion

- **Navegacion**: Cambio entre Dashboard y Datos Historicos
- **Idioma**: Espanol / Ingles
- **Unidades**: Imperial (°F, mph, inHg) / Metrico (°C, km/h, hPa)
- **Tema**: Modo oscuro / claro

El sidebar se colapsa por defecto en escritorio. Usa el boton de menu para expandirlo.
