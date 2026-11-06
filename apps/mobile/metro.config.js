// `hyparquet` y `hyparquet-writer` (exportación Parquet de `@tt/core`) publican una entrada para Node que importa
// `fs` y otra `browser` en JS puro. Metro no usa la condición `browser` en Android, así que solo para ellos se agrega;
// el resto de los paquetes se resuelve igual que siempre.
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)
const BROWSER_ENTRY_PACKAGES = /^hyparquet(-writer)?(\/|$)/

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (!BROWSER_ENTRY_PACKAGES.test(moduleName)) return context.resolveRequest(context, moduleName, platform)
  const unstable_conditionNames = [...context.unstable_conditionNames, 'browser']
  return context.resolveRequest({ ...context, unstable_conditionNames }, moduleName, platform)
}

module.exports = config
