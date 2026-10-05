import { Alert, AlertTitle, Box, Skeleton, Stack, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  useExecutions,
  useExecutionTimeline,
  useGraph,
  useIngestionHealth,
  useIngestionThroughput,
  useOverview,
  useVersions,
} from '../api/catalog';
import { AttributeCompare } from '../analytics/AttributeCompare';
import { ExecutionCompare } from '../analytics/ExecutionCompare';
import { formatCount, formatSeconds } from '../analytics/format';
import { Throughput } from '../analytics/Throughput';
import { Timeline } from '../analytics/Timeline';
import { Chip, StudioCard, Tile } from '../components/primitives';
import { CheckIcon, WarningIcon } from '../layout/icons';
import { SectionSwitch, type DataflowSection } from '../layout/SectionSwitch';
import { MONO } from '../theme/tokens';

/** A tela de analytics. */
export function AnalyticsPage({
  dataflowId,
  dataflowTag,
  onBack,
  section,
  onNavigateSection,
}: {
  dataflowId: number;
  dataflowTag: string;
  onBack: () => void;
  section: DataflowSection;
  onNavigateSection: (section: DataflowSection) => void;
}) {
  const { studio } = useTheme();

  const versions = useVersions(dataflowId);
  const overview = useOverview();
  const ingestion = useIngestionHealth(dataflowId);
  const throughput = useIngestionThroughput(dataflowId);
  const graphDatasets = useGraph(dataflowId, 'dataset');
  const compareDatasets = useMemo(
    () =>
      (graphDatasets.data?.nodes ?? [])
        .filter((n) => n.kind === 'DATASET' && (n.attributes?.length ?? 0) > 0)
        .map((n) => ({ tag: n.tag, attributes: n.attributes ?? [] })),
    [graphDatasets.data],
  );

  const [versionOverride, setVersionOverride] = useState<number | null>(null);
  const effectiveVersion = versionOverride ?? versions.data?.[0]?.version ?? null;
  const versionSummary = versions.data?.find((v) => v.version === effectiveVersion) ?? null;

  const executions = useExecutions(dataflowId, effectiveVersion);

  const [execAOverride, setExecAOverride] = useState<number | null>(null);
  const [execBOverride, setExecBOverride] = useState<number | null>(null);
  const [comparing, setComparing] = useState(false);

  // Trocar de versão invalida as execucoes escolhidas: elas sao de outra versao.
  useEffect(() => {
    setExecAOverride(null);
    setExecBOverride(null);
  }, [effectiveVersion]);

  const effectiveExecA = execAOverride ?? executions.data?.[0]?.id ?? null;
  const effectiveExecB = execBOverride ?? executions.data?.[1]?.id ?? null;

  const timelineA = useExecutionTimeline(dataflowId, effectiveExecA);
  const timelineB = useExecutionTimeline(dataflowId, comparing ? effectiveExecB : null);

  const execASummary = executions.data?.find((e) => e.id === effectiveExecA) ?? null;
  const execBSummary = executions.data?.find((e) => e.id === effectiveExecB) ?? null;

  const avgDuration = useMemo(() => {
    const durations = (executions.data ?? [])
      .map((e) => e.durationSeconds)
      .filter((d): d is number => d != null);
    if (durations.length === 0) return null;
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }, [executions.data]);

  const avgProcessing =
    overview.data && overview.data.transactionsProcessed > 0
      ? overview.data.transactionProcessingSeconds / overview.data.transactionsProcessed
      : null;
  const avgQueueMs =
    overview.data && overview.data.transactionsProcessed > 0
      ? overview.data.queueTotalTimeMs / overview.data.transactionsProcessed
      : null;

  const loading = versions.isPending;
  const errored = versions.isError;
  const empty = !loading && !errored && (versions.data?.length ?? 0) === 0;

  return (
    <>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.75}
        alignItems={{ xs: 'stretch', md: 'flex-end' }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              component="button"
              type="button"
              onClick={onBack}
              sx={{
                border: 0, bgcolor: 'transparent', p: 0, color: studio.muted,
                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                '&:hover': { color: studio.ink },
              }}
            >
              Dataflows
            </Box>
            <Box sx={{ color: studio.muted, fontSize: 13 }}>/</Box>
            <Box sx={{ fontFamily: MONO, fontSize: 13, fontWeight: 600 }}>{dataflowTag}</Box>
            <Box sx={{ color: studio.muted, fontSize: 13 }}>/</Box>
            <Box sx={{ fontSize: 13 }}>Analytics</Box>
          </Stack>
          <Box component="h1" sx={{ m: 0, mt: 0.5, fontSize: 21, fontWeight: 600, letterSpacing: '-.01em' }}>
            Execuções e desempenho
          </Box>
          <Box sx={{ mt: 0.5, fontSize: 12.5, color: studio.muted }}>
            {versionSummary
              ? `${formatCount(versionSummary.executions)} execuções · ${formatCount(versionSummary.tasks)} tasks · versão ${versionSummary.version}`
              : 'Sem execuções registradas'}
          </Box>
        </Box>

        <Box sx={{ flex: 'none' }}>
          <SectionSwitch section={section} onNavigate={onNavigateSection} />
        </Box>
      </Stack>

      {errored && (
        <Alert severity="error">
          <AlertTitle>Não foi possível carregar as versões</AlertTitle>
          {versions.error instanceof Error ? versions.error.message : 'Erro desconhecido.'}
        </Alert>
      )}

      {loading && <Skeleton variant="rounded" height={120} />}

      {empty && (
        <StudioCard sx={{ p: 6, alignItems: 'center', textAlign: 'center' }}>
          <Box sx={{ fontSize: 15, fontWeight: 600, mb: 0.75 }}>Nenhuma execução ainda</Box>
          <Box sx={{ fontSize: 12.5, color: studio.muted, maxWidth: 420 }}>
            Este dataflow tem definição salva, mas nenhuma task foi ingerida. Os
            números aparecem aqui assim que a primeira execução rodar.
          </Box>
        </StudioCard>
      )}

      {!loading && !errored && !empty && (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            flexWrap="wrap"
            useFlexGap
          >
            <PickerSelect
              label="Versão"
              value={effectiveVersion}
              onChange={setVersionOverride}
              options={(versions.data ?? []).map((v) => ({
                value: v.version,
                label: `versão ${v.version} · ${formatCount(v.executions)} execuções`,
              }))}
            />
            <PickerSelect
              label="Execução"
              value={effectiveExecA}
              onChange={setExecAOverride}
              options={(executions.data ?? []).map((e) => ({
                value: e.id,
                label: `#${e.id} · ${e.tag}`,
              }))}
            />
            <Box
              component="button"
              type="button"
              onClick={() => setComparing((c) => !c)}
              disabled={(executions.data?.length ?? 0) < 2}
              sx={{
                height: 34, borderRadius: '9px', border: `1px solid ${studio.border}`,
                bgcolor: comparing ? studio.blueDim : studio.elev,
                color: comparing ? studio.blue : studio.ink,
                borderColor: comparing ? studio.blue : studio.border,
                fontSize: 13, fontWeight: 500, fontFamily: 'inherit', px: 1.5,
                cursor: 'pointer', '&:disabled': { opacity: 0.5, cursor: 'default' },
              }}
            >
              Comparar execuções
            </Box>
            {comparing && (
              <PickerSelect
                label="com"
                value={effectiveExecB}
                onChange={setExecBOverride}
                options={(executions.data ?? [])
                  .filter((e) => e.id !== effectiveExecA)
                  .map((e) => ({ value: e.id, label: `#${e.id} · ${e.tag}` }))}
              />
            )}
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            <Tile label="Execuções · versão" value={formatCount(versionSummary?.executions)} />
            <Tile label="Duração média" value={formatSeconds(avgDuration)} />
            <Tile label="Tasks ingeridas" value={formatCount(versionSummary?.tasks)} />
            <Tile
              label="Fila de ingestão"
              value={formatCount(overview.data?.queuePending)}
              footer={
                overview.data && (
                  <Chip tone={overview.data.queuePending === 0 ? 'good' : 'warn'}>
                    {overview.data.queuePending === 0 ? (
                      <>
                        <CheckIcon size={12} /> sem pendências
                      </>
                    ) : (
                      'processando'
                    )}
                  </Chip>
                )
              }
            />
          </Box>

          {/* alignItems: o padrão do Stack é 'stretch', que força os dois cards à MESMA altura -- a do mais curto (Saúde da ingestão). */}
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', lg: 'flex-start' }}
            sx={{ minHeight: 0 }}
          >
            <StudioCard sx={{ flexGrow: 1, p: 2, minWidth: 0 }}>
              <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
                <Box sx={{ fontSize: 13, fontWeight: 600 }}>
                  Linha do tempo das tasks {execASummary && `· execução #${execASummary.id}`}
                </Box>
                <Box sx={{ fontSize: 11.5, color: studio.muted }}>
                  a partir de performance.starttime / endtime
                </Box>
                {(timelineA.data?.anomalies.length ?? 0) > 0 && (
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 'auto', color: studio.crit, fontSize: 11 }}>
                    <WarningIcon size={14} />
                    {timelineA.data!.anomalies.length} task(s) com erro ou ainda em execução
                  </Stack>
                )}
              </Stack>

              <Box sx={{ mt: 2 }}>
                {timelineA.isPending && <Skeleton variant="rounded" height={140} />}
                {timelineA.isError && (
                  <Alert severity="error">Não foi possível carregar a linha do tempo.</Alert>
                )}
                {timelineA.data && <Timeline rows={timelineA.data.rows} />}
              </Box>
            </StudioCard>

            <StudioCard sx={{ width: { xs: '100%', lg: 320 }, flex: 'none', p: 2 }}>
              <Box sx={{ fontSize: 13, fontWeight: 600 }}>Saúde da ingestão</Box>
              <Box sx={{ fontSize: 11, color: studio.muted, mt: 0.375 }}>
                Fila assíncrona do ProvenanceQueue
              </Box>

              <Stack sx={{ mt: 1 }}>
                <HealthRow label="Transações processadas" value={formatCount(overview.data?.transactionsProcessed)} />
                <HealthRow label="Tempo médio de processamento" value={avgProcessing != null ? formatSeconds(avgProcessing) : '—'} />
                <HealthRow label="Tempo médio em fila" value={avgQueueMs != null ? `${avgQueueMs.toFixed(0)} ms` : '—'} />
                {overview.data && overview.data.ingestionErrors > 0 && (
                  <HealthRow
                    label="Falhas de ingestão"
                    value={formatCount(overview.data.ingestionErrors)}
                    tone="crit"
                    icon={<WarningIcon size={14} />}
                  />
                )}
                {ingestion.data && (
                  <HealthRow
                    label="Tasks com erro / em execução"
                    value={`${formatCount(ingestion.data.errorTasks)} / ${formatCount(ingestion.data.runningTasks)}`}
                    tone={ingestion.data.errorTasks + ingestion.data.runningTasks === 0 ? 'good' : 'crit'}
                    icon={
                      ingestion.data.errorTasks + ingestion.data.runningTasks === 0 ? (
                        <CheckIcon size={14} />
                      ) : (
                        <WarningIcon size={14} />
                      )
                    }
                  />
                )}
                {(ingestion.data?.alerts ?? []).map((alert) => (
                  <HealthRow
                    key={alert.executionId}
                    label={`Execução #${alert.executionId} · ${alert.executionTag}`}
                    value={
                      [
                        alert.errorTasks > 0 ? `${alert.errorTasks} com erro` : null,
                        alert.runningTasks > 0 ? `${alert.runningTasks} em execução` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')
                    }
                    tone="crit"
                    icon={<WarningIcon size={14} />}
                  />
                ))}
              </Stack>
            </StudioCard>
          </Stack>

          <StudioCard sx={{ width: { xs: '100%', lg: 320 }, p: 2 }}>
            <Box sx={{ fontSize: 13, fontWeight: 600 }}>Vazão de ingestão</Box>
            <Box sx={{ fontSize: 11, color: studio.muted, mt: 0.375 }}>
              tasks concluídas por hora · últimas 24h
            </Box>
            {throughput.isPending && <Skeleton variant="rounded" height={110} sx={{ mt: 1.5 }} />}
            {throughput.isError && (
              <Alert severity="error" sx={{ mt: 1.5 }}>Não foi possível carregar a vazão.</Alert>
            )}
            {throughput.data && <Throughput data={throughput.data} />}
          </StudioCard>

          {comparing && execASummary && execBSummary && (
            <StudioCard sx={{ p: 2, minWidth: 0 }}>
              <Box sx={{ fontSize: 13, fontWeight: 600, mb: 1.25 }}>
                Comparação de execuções
              </Box>
              <ExecutionCompare
                a={execASummary}
                b={execBSummary}
                timelineA={timelineA.data}
                timelineB={timelineB.data}
              />
            </StudioCard>
          )}

          {comparing && execASummary && execBSummary && (
            <StudioCard sx={{ p: 2, minWidth: 0 }}>
              <Box sx={{ fontSize: 13, fontWeight: 600, mb: 0.375 }}>
                Atributos por dataset
              </Box>
              <Box sx={{ fontSize: 11, color: studio.muted, mb: 1.25 }}>
                Resumo agregado — não linha a linha (ver nota no componente)
              </Box>
              <AttributeCompare
                dataflowId={dataflowId}
                datasets={compareDatasets}
                execA={execASummary}
                execB={execBSummary}
              />
            </StudioCard>
          )}
        </>
      )}
    </>
  );
}

function HealthRow({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'crit';
  icon?: React.ReactNode;
}) {
  const { studio } = useTheme();
  const color = tone === 'good' ? studio.good : tone === 'crit' ? studio.crit : studio.muted;
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ py: 1.125, borderBottom: `1px solid ${studio.border}`, fontSize: 12.5, '&:last-child': { borderBottom: 0 } }}
    >
      {icon ? <Box sx={{ color, display: 'flex', flex: 'none' }}>{icon}</Box> : <Box sx={{ width: 14, flex: 'none' }} />}
      <Box sx={{ color: tone ? color : studio.muted, minWidth: 0 }}>{label}</Box>
      <Box sx={{ ml: 'auto', fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: tone ? color : studio.ink, whiteSpace: 'nowrap' }}>
        {value}
      </Box>
    </Stack>
  );
}

function PickerSelect<T extends number>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  const { studio } = useTheme();
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ fontSize: 11.5, color: studio.muted, flex: 'none' }}>{label}</Box>
      <Box
        component="select"
        value={value ?? ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(Number(e.target.value) as T)}
        disabled={options.length === 0}
        sx={{
          height: 34, borderRadius: '9px', border: `1px solid ${studio.border}`,
          bgcolor: studio.elev, color: studio.ink, fontSize: 12.5, fontFamily: 'inherit',
          px: 1, maxWidth: 260,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Box>
    </Stack>
  );
}
