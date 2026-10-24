# Fixtures

Respuestas reales de las fuentes, capturadas para que las pruebas usen datos verdaderos y no inventados.

| Archivo | Origen | Capturado | Notas |
|---------|--------|-----------|-------|
| `wflexp-2026-10-24.json` | `GET http://148.204.57.118/wflexp.json` (consola Davis) | 2026-10-24 ~09:00 CDMX | `mac`, `ip` y `ssid` reemplazados por valores ficticios. Sin lluvia, pronóstico regla 1, `bartr = 20` |
| `clean-weather-2026-10-19.json` | `GET obtener-datos-clima?vista=vw_clean_weather&date_start=2026-10-19&date_end=2026-10-20` | 2026-10-24 | 96 filas de un día completo, de la más nueva a la más vieja, números como texto y presión en mmHg |

Valores de referencia que usan las pruebas, verificados a mano contra el archivo:

- `wflexp`:
  - `tempout = 64.1 °F`.
  - `hltempout = [50.0, 64.9, "4:58", "9:48", 82.8, 46.1, 91.8, 37.1]`, es decir: mín. y máx. de hoy, horas, máx. y mín. del mes, máx. y mín. del año.
  - `loctime − utctime = −5 h`: el reloj de la consola va una hora adelantado respecto a CDMX (UTC−6).
- `clean-weather`:
  - Máxima de 25 °C a las 16:00 y mínima de 12 °C a las 06:15.
  - Presión de la última fila: `770.9` mmHg.

Si una fuente cambia de forma, se captura un fixture nuevo con su fecha y se conserva el anterior.
