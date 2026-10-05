import { Segmented } from '../components/primitives';

export type DataflowSection = 'graph' | 'query' | 'analytics' | 'gallery';

const OPTIONS: { value: DataflowSection; label: string }[] = [
  { value: 'graph', label: 'Grafo' },
  { value: 'query', label: 'Consulta' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'gallery', label: 'Galeria' },
];

/**
 * Alterna entre as quatro telas de um dataflow escolhido (grafo, consulta, analytics, galeria).
 */
export function SectionSwitch({
  section,
  onNavigate,
}: {
  section: DataflowSection;
  onNavigate: (section: DataflowSection) => void;
}) {
  return (
    <Segmented ariaLabel="Trocar de tela" value={section} onChange={onNavigate} options={OPTIONS} />
  );
}
