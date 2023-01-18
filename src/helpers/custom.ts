import {GraphData, NodeData } from "./graphHelpers";

function getParentId(nodeId: string) {
  return nodeId?.split('.')?.slice(0, -1)?.join();
}
type Params = {
  cx: number;
  cy: number;
  startAngle: number;
  endAngle: number;
}

function calculateNodesPosition(rootNode: NodeData, nodes: NodeData[], params: Params, level = 0) {
  const { cx, cy, startAngle, endAngle } = params;
  rootNode.x = cx;
  rootNode.y = cy;
  const children = nodes.filter((node) => getParentId(node.id) === rootNode.id);
  console.log("CL", children.length);
  const radius = (children.length * 55) / 2;

  const angle = endAngle - startAngle;
  const anglePerChild = angle / children.length;

  children.forEach((child, index) => {
    calculateNodesPosition(child, nodes, {
      cx: cx + radius * Math.cos(startAngle + anglePerChild * index),
      cy: cy + radius * Math.sin(startAngle + anglePerChild * index),
      startAngle: startAngle + anglePerChild * index,
      endAngle: startAngle + anglePerChild * (index + 1),
    }, level + 1);
  });
}
export function getNodesWithPosition(graphData: GraphData) {
  const { nodes, edges } = graphData;

  calculateNodesPosition(nodes[0], nodes, {
    cx: 1000,
    cy: 1000,
    startAngle: 0,
    endAngle: 2 * Math.PI,
  });

  return { nodes: nodes.filter(({ x = NaN, y = NaN }) => !isNaN(x) && !isNaN(y)), edges };
}
