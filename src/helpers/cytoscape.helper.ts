import Cytoscape from "cytoscape";
import COSEBilkent from 'cytoscape-cose-bilkent';
import {RDFSGraph} from "../helpers/jsonSchema.helper";
import {LayoutData} from "../hooks/useGraphLayout";


Cytoscape.use(COSEBilkent);

export function getLayout(graph: RDFSGraph, nodeSize: { width: number, height: number }): LayoutData {
  const { nodes, edges } = graph;
  const elements = [
    ...nodes.map((node) => ({ data: node })),
    ...edges.map((edge) => ({ data: edge}))
  ]

  const cy = Cytoscape({
    container: undefined,
    elements,
    headless: true,
    layout: { name: 'breadthfirst', animate: false, spacingFactor: 250},
    style: [{
      selector: 'node',
      style: {
        ...nodeSize,
        shape: 'rectangle'
      }
    }]
  });

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
