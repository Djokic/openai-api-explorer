import ELK from "elkjs";
import { GraphData } from "./graphHelpers";

const layoutOptions = {
  "elk.algorithm": "layered",
  "hierarchyHandling": "INCLUDE_CHILDREN",
  "elk.direction": "DOWN",
  "elk.alignment": "DOWN",
  "elk.portAlignment.default": "CENTER",
  "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
  "elk.layered.cycleBreaking.strategy": "MODEL_ORDER",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX", //BRANDES_KOEPF
  "elk.layered.considerModelOrder.strategy": "NONE",
  "elk.layered.nodePlacement.bk.edgeStraightening": "NONE",
  "elk.layered.nodePlacement.bk.fixedAlignment": "LEFTUP",
  "elk.layered.nodePlacement.networkSimplex.nodeFlexibility.default": "NONE",
  "elk.layered.layering.nodePromotion.strategy": "NONE",
  "elk.layered.compaction.postCompaction.strategy": "NONE",
  "elk.partitioning.activate": "true",
  "edgeRouting": "ORTHOGONAL"
};

const elk = new ELK();

export async function getLayout(graph: GraphData) {
  const data = {
    id: 'root',
    layoutOptions,
    children: graph.nodes,
    edges: graph.edges.map((edge) => ({
      ...edge,
      sources: [edge.source],
      targets: [edge.target]
    }))
  };

  console.log(data);

  return await elk.layout(data);
}
