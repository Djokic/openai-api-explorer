import {ElkNode} from "elkjs";
import {camelCase, upperFirst} from "lodash";
import {MarkerType} from "reactflow";


export function formatNodeLabelByType(label?: string, type?: string) {
  switch (type) {
    case 'object':
      return `${upperFirst(camelCase(label))}`;
    case 'array':
      return `${camelCase(label)}[]`;
    default:
      return camelCase(label);
  }
}
export function mapElkToReactFlowData(layout: ElkNode) {
  const nodes = layout.children?.map((node: Record<string, any>) => ({
    ...node,
    id: node.id,
    position: { x: node.x, y: node.y},
    className: `node-${node.type}`,
    type: 'default',
    data: {
      label: node.label,
      ...node.data
    },
    style: { width: node.width, height: node.height }
  }));

  const edges = layout.edges?.map(edge => ({
    ...edge,
    id: edge.id,
    source: edge.sources[0],
    target: edge.targets[0],
    type: 'default',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      strokeWidth: 3
    }
  }));

  return {nodes, edges};
}
