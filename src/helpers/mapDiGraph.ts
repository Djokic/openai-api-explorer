import {ElkNode} from "elkjs";

import {getLabelFromId} from "./graphHelpers";

export function mapElkToDiGraphData(layout: ElkNode) {
  const nodes = layout.children?.map((node: Record<string, any>) => ({
    ...node,
    id: node.id,
    title: getLabelFromId(node.id),
    type: 'empty'
  }));

  const edges = layout.edges?.map(edge => ({
    ...edge,
    id: edge.id,
    source: edge.sources[0],
    target: edge.targets[0],
    handleText: "lav",
    type: 'specialEdge'
  }));

  return {nodes, edges};
}
