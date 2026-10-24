// Pantalla "Histórico" (CU-04, CU-05; artboard `MobileHistory`): periodo, y temperatura y humedad, viento, lluvia y
// presión como acordeones. Las gráficas comparten la posición del cursor; la descarga incluye las secciones
// abiertas (o todas, si no hay ninguna abierta).

import {
  type ChartHeights, type ExportFormat, HISTORY_VARIABLES, type HistoryVariable, exportHistory, historyCharts, xTickIndices,
} from '@tt/core'
import { axisLabel, historySectionSummaries, historySummaryText, periodLabel } from '@tt/i18n'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { SettingsSheet } from '@/components/shell/settings-sheet'
import { Card } from '@/components/ui/card'
import { IconButton } from '@/components/ui/icon-button'
import { SlidersIcon, StationLogo } from '@/components/ui/icons'
import { Txt } from '@/components/ui/txt'
import { useHistory } from '@/hooks/use-history'
import { shareFile } from '@/lib/share-file'
import { usePreferences } from '@/providers/app-providers'
import { DownloadSheet } from './download-sheet'
import { HistoryControls } from './history-controls'
import { PressureSection, RainSection, type SectionProps, TemperatureSection, WindSection } from './sections'
import { CHART_WIDTH } from './time-chart'

/** Altos de las gráficas del artboard móvil. */
const MOBILE_CHART_HEIGHTS: ChartHeights = { temperature: 170, humidity: 70, wind: 130, rain: 110, cumulative: 60, pressure: 130 }

type OpenSections = Record<HistoryVariable, boolean>

export function HistoryScreen() {
  const { t, format, palette } = usePreferences()
  const history = useHistory()
  const { view, showIndoor } = history
  const h = t.history
  const [open, setOpen] = useState<OpenSections>({ temperature: true, wind: false, rain: false, pressure: false })
  const [cursorIndex, setCursorIndex] = useState<number | null>(null)
  const [sheet, setSheet] = useState<'settings' | 'download' | null>(null)

  useEffect(() => setCursorIndex(null), [view])

  const prepared = useMemo(() => {
    if (view === null) return null
    const count = view.buckets.length
    return {
      charts: historyCharts(view, { showIndoor, width: CHART_WIDTH, heights: MOBILE_CHART_HEIGHTS }),
      summary: historySummaryText(view, t, format),
      headlines: historySectionSummaries(view, t, format),
      axis: xTickIndices(count, 4).map((i) => ({
        label: axisLabel(view.buckets[i]?.start as Date, view.resolution, history.days, t),
        fraction: (i + 0.5) / count,
      })),
    }
  }, [view, showIndoor, t, format, history.days])

  const openCount = Object.values(open).filter(Boolean).length
  const exported = HISTORY_VARIABLES.filter((variable) => open[variable])
  const variables = exported.length > 0 ? exported : [...HISTORY_VARIABLES]
  const points = view?.buckets.length ?? 0

  const download = async (formatName: ExportFormat) => {
    setSheet(null)
    if (view) await shareFile(exportHistory(view, { format: formatName, variables, includeIndoor: showIndoor }), h.downloadAria)
  }

  const section = (variable: HistoryVariable): SectionProps | null =>
    view && prepared
      ? {
          view,
          charts: prepared.charts,
          summary: prepared.summary,
          headline: prepared.headlines[variable],
          axis: prepared.axis,
          showIndoor,
          cursor: { index: cursorIndex, count: view.buckets.length, onChange: setCursorIndex },
          open: open[variable],
          onToggle: () => setOpen((current) => ({ ...current, [variable]: !current[variable] })),
        }
      : null

  const temperature = section('temperature')
  const wind = section('wind')
  const rain = section('rain')
  const pressure = section('pressure')

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: palette.bg }]}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <View style={[styles.logo, { backgroundColor: palette['rain-soft'] }]}>
            <StationLogo />
          </View>
          <View style={styles.titles}>
            <Txt size={16} weight="semibold" accessibilityRole="header">{t.app.navHistory}</Txt>
            <Txt size={12} mono color="t2" numberOfLines={1}>{view ? periodLabel(view.range, t) : ''}</Txt>
          </View>
        </View>
        <View style={styles.actions}>
          <IconButton label={h.downloadAria} onPress={() => setSheet('download')} disabled={view === null}>
            <Svg width={20} height={20} viewBox="0 0 16 16">
              <Path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" fill="none" stroke={palette.tx} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </IconButton>
          <IconButton label={t.settings.title} onPress={() => setSheet('settings')}>
            <SlidersIcon color={palette.tx} />
          </IconButton>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <HistoryControls history={history} />
        <Txt size={11.5} color="t2" style={styles.note}>{h.delayNote}</Txt>

        {history.status === 'loading' ? <Status text={h.loading} /> : null}
        {history.status === 'failed' ? <Status text={h.failed} action={t.live.retry} onAction={history.retry} /> : null}
        {view?.readings === 0 ? <Status text={h.empty} /> : null}

        {temperature && wind && rain && pressure && view && view.readings > 0 ? (
          <>
            <View style={styles.openRow}>
              <Txt size={12} color="t2">{h.accordion.openCount(openCount)}</Txt>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  const all = openCount < 4
                  setOpen({ temperature: all, wind: all, rain: all, pressure: all })
                }}
                style={styles.openAll}
              >
                <Txt size={13} weight="semibold" color="blue-text">{openCount === 4 ? h.accordion.collapseAll : h.accordion.expandAll}</Txt>
              </Pressable>
            </View>
            <TemperatureSection {...temperature} onToggleIndoor={() => history.setShowIndoor(!showIndoor)} />
            <WindSection {...wind} />
            <RainSection {...rain} />
            <PressureSection {...pressure} />
          </>
        ) : null}
      </ScrollView>

      <DownloadSheet
        visible={sheet === 'download'}
        summary={h.downloadSummary(points, variables.length, h.resolutions[history.resolution])}
        onPick={(formatName) => void download(formatName)}
        onClose={() => setSheet(null)}
      />
      <SettingsSheet visible={sheet === 'settings'} onClose={() => setSheet(null)} />
    </SafeAreaView>
  )
}

function Status({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  const { palette } = usePreferences()
  return (
    <Card label={text} style={styles.status}>
      <Txt size={14} color="t2" accessibilityLiveRegion="polite" style={styles.centered}>{text}</Txt>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={[styles.retry, { borderColor: palette.bd, backgroundColor: palette.sf }]}>
          <Txt size={14} weight="medium">{action}</Txt>
        </Pressable>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  logo: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titles: { gap: 2, flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: 6 },
  content: { paddingTop: 4, paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  note: { paddingHorizontal: 4 },
  openRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  openAll: { minHeight: 36, paddingHorizontal: 12, justifyContent: 'center' },
  status: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
  retry: { minHeight: 44, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, justifyContent: 'center' },
})
