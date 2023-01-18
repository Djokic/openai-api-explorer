import {OpenAPIV3} from "openapi-types";
import React from 'react';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import CytoscapeComponent from 'react-cytoscapejs';

import './CyGraph.css';

import {getSchemaGraph} from "../../helpers/graphHelpers";

Cytoscape.use(COSEBilkent);


type Props = {
  schema?: OpenAPIV3.SchemaObject
}

function CyGraph({ schema }: React.PropsWithChildren<Props>) {
  // const cy = React.useRef<Cytoscape.Core>(null);
  const { nodes, edges } = getSchemaGraph(schema || {});
  const elements = [
    ...nodes.map(node => ({
      data: { id: node.id, label: node.label }
    })),
    ...edges.map(edge => ({
      data: { id: edge.id, source: edge.source, target: edge.target }
    }))
  ]


  return (
      <CytoscapeComponent
        key={schema?.title}
        // @ts-ignore
         cy={(cy) => {
           console.log(cy);
         }}
        elements={elements}
        layout={{ name: 'cose-bilkent' }}
        className="CyGraph"
        stylesheet={[
          {
            selector: 'node',
            style: {
              width: 200,
              height: 50,
              shape: 'rectangle'
            }
          },
          {
            selector: 'edge',
            style: {
              width: 15
            }
          }
        ]}
      />
  )
}

export default React.memo(CyGraph);
