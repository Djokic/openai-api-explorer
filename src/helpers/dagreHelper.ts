import dagre from 'dagre';
import {GraphData} from "./graphHelpers";

const layoutOptions = {
  rankdir: 'LR',
  ranker: 'tight-tree',
  align: 'UL',
  nodesep: 10,
}
export function getLayout(graph: GraphData) {
  const g = new dagre.graphlib.Graph(({ directed: true, compound: true, multigraph: true }));
  g.setGraph({});
  g.setDefaultEdgeLabel(() => ({}));

  graph.nodes.forEach((node) => {
    g.setNode(node.id, node);
  });


  graph.edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g, layoutOptions);

  return {
    nodes: graph.nodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      return {
        ...node,
        x: nodeWithPosition.x,
        y: nodeWithPosition.y
      };
    }),
    edges: graph.edges
  };
}
