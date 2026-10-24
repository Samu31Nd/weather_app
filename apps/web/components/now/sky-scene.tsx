// Escena del cielo (RF-APP-03): arte de @tt/sky-art (extraído de los artboards `Sky*`) con su etiqueta. Las
// animaciones son CSS y se apagan con `prefers-reduced-motion`.

import type { SkyScene as SkySceneId } from '@tt/core'
import { SKY_SCENE_ART, SKY_SCENE_CSS } from '@tt/sky-art'

export function SkyScene({ scene, label, chip }: { scene: SkySceneId; label: string; chip: string }) {
  const art = SKY_SCENE_ART[scene]
  return (
    <div className="relative h-full min-h-[180px] w-full overflow-hidden">
      <style href="sky-scene-css" precedence="default">{SKY_SCENE_CSS}</style>
      <svg
        viewBox={art.viewBox}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={label}
        className={`absolute inset-0 block size-full ${art.rootClass}`}
        // El arte es contenido propio, extraído del canvas de diseño y verificado en @tt/sky-art (sin scripts).
        dangerouslySetInnerHTML={{ __html: art.body }}
      />
      <span className="absolute left-4 top-3.5 rounded-full bg-[rgba(239,241,245,0.86)] px-2.5 py-[5px] text-xs font-medium text-[#4c4f69]">
        {chip}
      </span>
    </div>
  )
}
