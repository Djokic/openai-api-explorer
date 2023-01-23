import React from 'react';
import {GraphView} from 'react-digraph';

import './DiGraph.css';

import {getLayout} from "../../helpers/cytoscape.helper";

type DigraphProps = {
  layout?: ReturnType<typeof getLayout>;
}

export function mapToDiGraphLayout(layout?: ReturnType<typeof getLayout>) {
  const nodes = layout?.nodes?.map((node) => ({
    ...node,
    title: node.label,
    type: 'empty'
  }));

  const edges = layout?.edges?.map(edge => ({
    ...edge,
    handleText: edge.label,
    type: 'specialEdge'
  }));

  return {nodes, edges};
}

export default function Digraph({layout}: React.PropsWithChildren<DigraphProps>) {
  const { nodes = [], edges = [] } =  mapToDiGraphLayout(layout);

  return (
    <div className="DiGraph">
      <GraphView
        key={nodes.length + edges.length}
        nodeKey="id"
        readOnly={true}
        nodes={nodes}
        edges={edges}
        edgeTypes={[]}
        nodeTypes={[]}
        nodeSubtypes={[]}
        zoomDur={100}
        zoomDelay={100}
        showGraphControls={false}
      />
    </div>
  )
}
