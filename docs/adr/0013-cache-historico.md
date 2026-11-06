# ADR-0013 · Caché persistente del histórico por día

- **Estado:** Aceptada (2026-11-05)

## Contexto
La pantalla "Histórico" guardaba en memoria cada periodo ya pedido, pero la caché se perdía al recargar la web o al
salir de la pestaña en móvil, y era por periodo exacto: 24 h, 7 días y 30 días comparten días y los volvían a pedir.
Un periodo de 90 días son 9 consultas a la Cloud Function. Casi todo el histórico ya no cambia: solo los últimos días
pueden completarse, porque los datos llegan con un día de retraso (D7).

## Decisión
- `CachedHistoryRepository` en `@tt/core` decora el `HistoryRepository` de HTTP y lo arma `createCore`, así web y
  móvil lo usan igual. Guarda **por día de CDMX** y solo pide los días que faltan, agrupados en tramos contiguos de
  10 días o menos.
- Vigencia: un día que se pidió más de 48 h después de cerrar es definitivo y no vence; uno más reciente vence a la
  hora. También se guardan los días sin lecturas (huecos conocidos). Si la fuente falla no se guarda nada.
- Persiste en el mismo almacén clave-valor de las preferencias (`localStorage` en web, AsyncStorage en móvil), en
  claves `wx-history-v1:YYYY-MM-DD` con una fila de valores por muestra (≈ 7 KB por día). Tope de 200 días; al pasarse
  se borran los usados hace más tiempo.
- Un almacén que falla o una entrada dañada cuentan como "no guardado": se vuelve a pedir. Un rango que no empieza y
  termina a medianoche de CDMX pasa directo a la fuente.

## Consecuencias
- Cambiar de periodo, volver a la pantalla o reabrir la app casi no consulta la Cloud Function; los 200 días del
  histórico completo caben en ≈ 1.4 MB, debajo del límite de `localStorage` (~5 MB).
- Si se corrige un dato viejo en el pipeline (p. ej. D5), los clientes no lo ven hasta borrar la caché: cambiar el
  prefijo de versión (`wx-history-v2:`) la invalida.
- La caché devuelve el rango medio abierto `[inicio, fin)`: ya no llega la muestra de la medianoche final, que
  `aggregateDays` contaba como un día extra con una sola lectura.
