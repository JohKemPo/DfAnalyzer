import dagre from 'dagre';
import { Position, type Edge, type Node } from '@xyflow/react';

/** Layout automático da esquerda para a direita. */
export const NODE_WIDTH = 190;
export const NODE_HEIGHT = 56;

export function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: 'LR',
    // Folga suficiente para o rótulo da aresta não encostar nos nós.
    ranksep: 90,
    nodesep: 34,
    marginx: 24,
    marginy: 24,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const placed = graph.node(node.id);
    return {
      ...node,
      // Dagre devolve o CENTRO do nó; o React Flow posiciona pelo canto.
      position: { x: placed.x - NODE_WIDTH / 2, y: placed.y - NODE_HEIGHT / 2 },
      // Declarar o tamanho é obrigatório quando a culling de viewport está ligada: o React Flow não mede um nó que nunca desenhou, e sem medida o fitView não tem o que enquadrar -- a tela abre vazia.
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    };
  });
}
