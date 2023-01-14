import React, {useMemo} from 'react';
import ReactFlow, {Background, Controls, MiniMap} from "reactflow";
import 'reactflow/dist/style.css';
import {getLayout} from "../../helpers/dagreHelper";
import {mapDagreToReactFlow} from "../../helpers/dagreToReactFlow";


import './FlowGraph.css';

type FlowGraphProps = {
  layout?: ReturnType<typeof getLayout>;
}

const minimapStyle = {
  height: 120,
};

function FlowGraph({ layout }: FlowGraphProps) {
  const data = useMemo(() => {
    if (!layout) {
      return { nodes: [], edges: [] };
    }

    const { nodes = [], edges = [] } = mapDagreToReactFlow(layout);
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
