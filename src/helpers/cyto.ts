import Cytoscape from "cytoscape";
import COSEBilkent from 'cytoscape-cose-bilkent';

import {GraphData} from "./graphHelpers";

Cytoscape.use(COSEBilkent);

export function getCyLayout(graph: GraphData) {
  const { nodes, edges } = graph;
  const elements = [
    ...nodes.map(node => ({
      data: { id: node.id, label: node.label },
      // style: { width: node.width, height: node.height }
    })),
    ...edges.map(edge => ({
      data: { id: edge.id, source: edge.source, target: edge.target }
    }))
  ]

  const cy = Cytoscape({
    container: undefined,
    elements,
    headless: true,
    layout: { name: 'breadthfirst', animate: false, spacingFactor: 250},
    style: [{
      selector: 'node',
      style: {
        width: 200,
        height: 50,
        shape: 'rectangle'
      }
    }]
  });

  // @ts-ignore
  // cy.layout({
  //   name: 'cose-bilkent',
  //   // @ts-ignore
  //   animate: false,
  //   nodeDimensionsIncludeLabels: false,
  //   // number of ticks per frame; higher is faster but more jerky
  //   refresh: 30,
  //   // Whether to fit the network view after when done
  //   fit: true,
  //   // Padding on fit
  //   padding: 100,
  //   // Whether to enable incremental mode
  //   // randomize: true,
  //   // Node repulsion (non overlapping) multiplier
  //   nodeRepulsion: 4500000,
  //   // Ideal (intra-graph) edge length
  //   idealEdgeLength: 500,
  //   // Divisor to compute edge forces
  //   edgeElasticity: 45,
  //   // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  //   nestingFactor: 0.1,
  //   // Gravity force (constant)
  //   gravity: 0.00025,
  //   // Maximum number of iterations to perform
  //   numIter: 25000,
  //   // Whether to tile disconnected nodes
  //   tile: true,
  //   // Type of layout animation. The option set is {'during', 'end', false}
  //   // Duration for animate:end
  //   // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
  //   tilingPaddingVertical: 1000,
  //   // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
  //   tilingPaddingHorizontal: 1000,
  //   // Gravity range (constant) for compounds
  //   gravityRangeCompound: 10.5,
  //   // Gravity force (constant) for compounds
  //   gravityCompound: 100.0,
  //   // Gravity range (constant)
  //   gravityRange: 30000.8,
  //   // Initial cooling factor for incremental layout
  //   initialEnergyOnIncremental: 0.005
  // }).run();

  return {
    nodes: nodes.map(node => {
      const n = cy.getElementById(node.id);
      return {
        ...node,
        x: n.position('x'),
        y: n.position('y')
      }
    }),
    edges
  }
}
