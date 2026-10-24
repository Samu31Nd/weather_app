// Aplica las preferencias al documento: clase `dark`, `lang` y tamaño de texto (RF-APP-10, RNF-APP-07).
// El mismo efecto corre antes de hidratar (script de arranque) para que no parpadee el tema equivocado.

import { PREFERENCE_KEYS, type UserPreferences, resolveTheme } from '@tt/core'

export function applyPreferencesToDocument(root: HTMLElement, preferences: UserPreferences, systemPrefersDark: boolean): void {
  root.classList.toggle('dark', resolveTheme(preferences.theme, systemPrefersDark) === 'dark')
  root.lang = preferences.language
  root.dataset.textSize = preferences.textSize
}

/** Script en línea para el `<head>`: lee las claves `wx-*` y aplica lo mismo antes del primer pintado. */
export const PREFERENCES_BOOT_SCRIPT = `(function(){try{var d=document.documentElement,s=window.localStorage;var t=s.getItem(${JSON.stringify(PREFERENCE_KEYS.theme)});var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.classList.toggle('dark',dark);d.lang=s.getItem(${JSON.stringify(PREFERENCE_KEYS.language)})==='en'?'en':'es';var z=s.getItem(${JSON.stringify(PREFERENCE_KEYS.textSize)});d.dataset.textSize=z==='s'||z==='l'?z:'m'}catch(e){}})()`
