import Springy from 'springy';
import {GraphData} from "./graphHelpers";

export function getLayout(graph: GraphData) {
  const springy = new Springy.Graph();

  const nodeIds = graph.nodes.map((node) => node.id)
  console.log('Ni', nodeIds);

  const edges = graph.edges.map((edge) => [edge.source, edge.target]);

  console.log('E', edges);

  springy.addNodes(nodeIds);
  springy.addEdges(...edges);

  const layout = new Springy.Layout.ForceDirected(
    springy,
    400.0, // Spring stiffness
    400.0, // Node repulsion
    0.5 // Damping
  );

  console.log('LL', layout)



  return {
    ...graph
  };
}
