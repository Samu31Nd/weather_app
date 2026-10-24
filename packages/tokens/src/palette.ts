// Paleta del canvas de diseño: Catppuccin Latte (claro) y Mocha (oscuro), con los nombres cortos que usan los
// artboards (`--bg`, `--sf`, `--tx`…). Fuente: estilos `.wx` / `.wx.dark` de `Dashboard` y `LoadingWeb`.
//
// Ajuste de accesibilidad (RNF-APP-05): en el tema claro, `tm` y los acentos no llegan a 4.5:1 como texto. Se
// conservan los acentos para gráficos y rellenos y se agregan variantes `*-text`, más oscuras, solo para texto.
// `test/contrast.test.ts` lo verifica.

export const TOKEN_NAMES = [
  // superficies y texto
  'bg', 'sf', 'bd', 'gr', 'gs', 'tx', 't2', 'tm',
  // acentos por variable (gráficos, rellenos)
  'temp', 'hum', 'blue', 'wind', 'gust', 'pres', 'yellow', 'green', 'red', 'lav',
  // acentos como texto
  'temp-text', 'hum-text', 'blue-text', 'wind-text', 'pres-text', 'green-text',
  // fondos suaves de tarjetas
  'temp-soft', 'wind-soft', 'rain-soft', 'pres-soft', 'hum-soft', 'sun-soft', 'in-soft', 'ok-soft',
  // pantalla de carga
  'sky1', 'sky2', 'halo', 'cloud', 'hill', 'hill2',
  'dev-hi', 'dev-mid', 'dev-sh', 'dev-dark', 'win', 'line', 'pole', 'pole-hi', 'cup', 'cup-hi',
] as const

export type TokenName = (typeof TOKEN_NAMES)[number]
export type Palette = Readonly<Record<TokenName, string>>
export type ThemeName = 'light' | 'dark'

export const PALETTES: Readonly<Record<ThemeName, Palette>> = {
  light: {
    bg: '#e6e9ef', sf: '#eff1f5', bd: '#dce0e8', gr: '#dce0e8', gs: '#bcc0cc',
    tx: '#4c4f69', t2: '#5c5f77', tm: '#63667a',
    temp: '#fe640b', hum: '#209fb5', blue: '#1e66f5', wind: '#8839ef', gust: '#ea76cb', pres: '#179299',
    yellow: '#df8e1d', green: '#40a02b', red: '#d20f39', lav: '#7287fd',
    'temp-text': '#b44201', 'hum-text': '#177181', 'blue-text': '#0b59f4', 'wind-text': '#8534ef', 'pres-text': '#127278', 'green-text': '#2f7620',
    'temp-soft': '#fde3d3', 'wind-soft': '#eadcfd', 'rain-soft': '#d9e4fd', 'pres-soft': '#d2ecec', 'hum-soft': '#d3eef3',
    'sun-soft': '#fbeccf', 'in-soft': '#e2e6fb', 'ok-soft': '#dcefd8',
    sky1: '#c9daf8', sky2: '#eef1f8', halo: '#f7e6d8', cloud: '#ffffff', hill: '#cfe3d3', hill2: '#b7d6bd',
    'dev-hi': '#f7f1e6', 'dev-mid': '#e4dccd', 'dev-sh': '#c3b7a2', 'dev-dark': '#857a66', win: '#efe3cc',
    line: '#2b2a33', pole: '#b39c70', 'pole-hi': '#d4c29c', cup: '#3a3e52', 'cup-hi': '#8c8fa1',
  },
  dark: {
    bg: '#181825', sf: '#1e1e2e', bd: '#313244', gr: '#313244', gs: '#45475a',
    tx: '#cdd6f4', t2: '#bac2de', tm: '#a6adc8',
    temp: '#fab387', hum: '#74c7ec', blue: '#89b4fa', wind: '#cba6f7', gust: '#f5c2e7', pres: '#94e2d5',
    yellow: '#f9e2af', green: '#a6e3a1', red: '#f38ba8', lav: '#b4befe',
    'temp-text': '#fab387', 'hum-text': '#74c7ec', 'blue-text': '#89b4fa', 'wind-text': '#cba6f7', 'pres-text': '#94e2d5', 'green-text': '#a6e3a1',
    'temp-soft': '#3a2f3a', 'wind-soft': '#33304a', 'rain-soft': '#2a3150', 'pres-soft': '#25393d', 'hum-soft': '#233a45',
    'sun-soft': '#3b3530', 'in-soft': '#2c2f4a', 'ok-soft': '#263a2c',
    sky1: '#1b1c2c', sky2: '#2a2b45', halo: '#353456', cloud: '#3a3c58', hill: '#252b36', hill2: '#1f2430',
    'dev-hi': '#e9e2d4', 'dev-mid': '#cfc6b5', 'dev-sh': '#a99e89', 'dev-dark': '#6d6352', win: '#d9ccb3',
    line: '#11111b', pole: '#9c8760', 'pole-hi': '#bba97f', cup: '#2a2d3d', 'cup-hi': '#7f849c',
  },
}
