import React, {useMemo} from 'react';
import {ElkNode} from "elkjs";
import {GraphView} from 'react-digraph';

import './DiGraph.css';

import {mapElkToDiGraphData} from "../../helpers/mapDiGraph";

type DigraphProps = {
  layout?: ElkNode;
}

const GraphConfig = {
  NodeTypes: {
    empty: { // required to show empty nodes
      // typeText: "None",
      shapeId: "#empty", // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 100 50" id="empty" key="0">
          <rect width="100" height="50" fill="#fff"/>
        </symbol>
      )
    },
    custom: { // required to show empty nodes
      typeText: "Custom",
      shapeId: "#custom", // relates to the type property of a node
      shape: (
        <symbol viewBox="0 0 50 25" id="custom" key="0">
          <ellipse cx="50" cy="25" rx="50" ry="25"></ellipse>
        </symbol>
      )
    }
  },
  NodeSubtypes: {},
  EdgeTypes: {
    specialEdge: {
      shape: (
        <symbol viewBox="0 0 50 50" id="specialEdge">
          <rect
            transform="rotate(45)"
            x="27.5"
            y="-7.5"
            width="15"
            height="15"
            fill="currentColor"
          />
        </symbol>
      ),
      shapeId: "#specialEdge",
      typeText: "Special Edge"
    }
  },
  // EdgeTypes: {
  //   emptyEdge: {  // required to show empty edges
  //     shapeId: "#emptyEdge",
  //     shape: (
  //       <symbol viewBox="0 0 50 50" id="emptyEdge" key="0">
  //         <circle cx="25" cy="25" r="8" fill="currentColor"> </circle>
  //       </symbol>
  //     )
  //   }
  // }
}


export default function Digraph({layout}: React.PropsWithChildren<DigraphProps>) {
  const data = useMemo(() => {
    if (!layout) {
      return {nodes: [], edges: []};
    }

    const {nodes = [], edges = []} = mapElkToDiGraphData(layout);
    return {nodes, edges};
  }, [layout]);

  return (
    <div className="DiGraph">
      <GraphView
        key={data?.nodes?.length + data.edges.length}
        nodeKey="id"
        readOnly={true}
        nodes={data.nodes}
        edges={data.edges}
        edgeTypes={GraphConfig.EdgeTypes}
        nodeTypes={GraphConfig.NodeTypes}
        nodeSubtypes={GraphConfig.NodeSubtypes}
        renderNodeText={() => null}

        />
    </div>
  )
}
