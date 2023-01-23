import React, {useMemo} from 'react';
import ReactFlow, {Background, Controls, MiniMap} from "reactflow";
import 'reactflow/dist/style.css';

import {getLayout} from "../../helpers/cytoscape.helper";


import './FlowGraph.css';

type FlowGraphProps = {
  layout?: ReturnType<typeof getLayout>;
}

const minimapStyle = {
  height: 120,
};

function mapToReactFlowLayout(layout?: ReturnType<typeof getLayout>) {
  return {
    nodes: layout?.nodes.map((node) => ({
      ...node,
      type: 'default',
      className: `node-${node.type}`,
      position: { x: node.x || 0, y: node.y || 0},
      data: { label: node.label, ...node.data },
      style: { width: node.width, height: node.height }
    })),
    edges: layout?.edges.map((edge) => ({
      ...edge,
      animated: true,
      arrowHeadType: 'arrowclosed',
    }))
  };
}

function FlowGraph({ layout }: FlowGraphProps) {
  const { nodes = [], edges = [] } = mapToReactFlowLayout(layout)

  return (
    <div className="FlowGraph">
      <ReactFlow
        key={nodes?.length + edges.length}
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="top-right"
      >
        <MiniMap style={minimapStyle} zoomable pannable/>
        <Controls showInteractive={false} position="top-right"/>
        <Background color="#aaa" gap={16}/>
      </ReactFlow>
    </div>
  )
}

export default React.memo(FlowGraph);
