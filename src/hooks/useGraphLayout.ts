import {OpenAPIV3} from "openapi-types";
import { RDFSNode, RDFSEdge, jRDF} from "../helpers/jsonSchema2.helper";
import {getLayout} from "../helpers/cytoscape.helper";


type LayoutNode = RDFSNode & {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

type LayoutEdge = RDFSEdge;

export type LayoutData = {
  nodes: LayoutNode[];
  edges: LayoutEdge[]
}

type UseGraphLayoutParams = {
  schema?: OpenAPIV3.SchemaObject;
  schemas?: Record<string, OpenAPIV3.SchemaObject>;
  nodeSize: {
    width: number;
    height: number;
  }
}

export function useGraphLayout({schema, schemas, nodeSize}: UseGraphLayoutParams) {
  if (!schema) {
    return { nodes: [], edges: []}
  }

  const graph = jRDF(schema);
  return getLayout(graph, nodeSize);
}
