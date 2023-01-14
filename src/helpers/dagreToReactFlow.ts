import {getLayout} from "./dagreHelper";

export function mapDagreToReactFlow(params: ReturnType<typeof getLayout>) {
  return {
    nodes: params.nodes.map((node) => ({
      ...node,
      type: 'default',
      className: `node-${node.type}`,
      position: { x: node.x, y: node.y},
      data: { label: node.label, ...node.data },
      style: { width: node.width, height: node.height }
    })),
    edges: params.edges.map((edge) => ({
      ...edge,
      animated: true,
      arrowHeadType: 'arrowclosed',
    }))
  };
}
