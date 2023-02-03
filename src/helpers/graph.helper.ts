import {OpenAPIV3} from "openapi-types";

import { RDFSNode, RDFSEdge, jsonSchemaToRdfsGraph} from "./schema.helper";
import {getLayout} from "./cytoscape.helper";


export type LayoutNode = RDFSNode & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type LayoutData = {
  nodes: LayoutNode[];
  edges: RDFSEdge[]
}

type GetGraphLayoutParams = {
  schema?: OpenAPIV3.SchemaObject;
  nodeSize: {
    width: number;
    height: number;
  }
}

export function getGraphLayout({schema, nodeSize}: GetGraphLayoutParams) {
  if (!schema) {
    return { nodes: [], edges: []}
  }

  const graph = jsonSchemaToRdfsGraph(schema);
  return getLayout(graph, nodeSize);
}
