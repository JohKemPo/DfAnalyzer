import { Box, useTheme } from '@mui/material';
import type { IngestionThroughput } from '../api/catalog';
import { Chip } from '../components/primitives';

const WIDTH = 288;
const HEIGHT = 64;

/** Derivado só de performance.endtime; sem coluna nova. */
export function Throughput({ data }: { data: IngestionThroughput }) {
  const { studio } = useTheme();
  const points = polylinePoints(data.hourlyTaskCounts);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1.25 }}>
        <Box sx={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.02em' }}>
          {data.tasksPerMinute.toFixed(1).replace('.', ',')}
        </Box>
        <Box sx={{ fontSize: 12.5, color: studio.muted }}>tasks/min</Box>
        {data.changePercent != null && (
          <Chip tone={data.changePercent >= 0 ? 'good' : 'warn'}>
            {data.changePercent >= 0 ? '+' : ''}
            {data.changePercent.toFixed(0)}% vs. 12h antes
          </Chip>
        )}
      </Box>

      <Box component="svg" width={WIDTH} height={HEIGHT} sx={{ mt: 1.5, overflow: 'visible' }}>
        <polyline
          points={points}
          fill="none"
          stroke={studio.blue}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points && (
          <circle
            cx={points.split(' ').at(-1)?.split(',')[0]}
            cy={points.split(' ').at(-1)?.split(',')[1]}
            r={4}
            fill={studio.blue}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex', justifyContent: 'space-between', fontSize: 10.5,
          color: studio.muted, mt: 0.75, fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span>24h atrás</span>
        <span>12h atrás</span>
        <span>agora</span>
      </Box>
    </Box>
  );
}

function polylinePoints(hourly: number[]): string {
  if (hourly.length === 0) return '';
  const max = Math.max(...hourly, 1);
  const stepX = WIDTH / (hourly.length - 1 || 1);
  return hourly
    .map((value, i) => {
      const x = Math.round(i * stepX);
      const y = Math.round(HEIGHT - (value / max) * (HEIGHT - 8) - 4);
      return `${x},${y}`;
    })
    .join(' ');
}
