import {ElkNode} from "elkjs";
import React, {useMemo} from 'react';
import ReactFlow, {Background, Controls, MiniMap} from "reactflow";
import 'reactflow/dist/style.css';

import {mapElkToReactFlowData} from "../../helpers/elkToReactFlow";

import './FlowGraph.css';

type FlowGraphProps = {
  layout?: ElkNode;
}

const minimapStyle = {
  height: 120,
};

function FlowGraph({ layout }: FlowGraphProps) {
  const data = useMemo(() => {
    if (!layout) {
      return { nodes: [], edges: [] };
    }

    const { nodes = [], edges = [] } = mapElkToReactFlowData(layout);
    return { nodes, edges };
  }, [layout]);

  return (
    <div className="FlowGraph">
      <ReactFlow
        key={data?.nodes?.length + data.edges.length}
        nodes={data.nodes}
        edges={data.edges}
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
