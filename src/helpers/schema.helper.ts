import {camelCase, upperFirst} from "lodash";
import {OpenAPIV3} from "openapi-types";

export type RDFSGraph = {
  nodes: RDFSNode[];
  edges: RDFSEdge[];
}

export type RDFSNode = {
  id: string;
  label: string;
  type?: string;
  data?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
}

export type RDFSEdge = {
  id: string;
  label: string;
  source: string;
  target: string;
}

export function parseSchemas(schemas: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}): OpenAPIV3.SchemaObject[] {
  return Object.entries(schemas).map(([name, schema]) => {
    return {
      title: name,
      ...schema
    };
  });
}
export function getSchemaTitleFromRef(ref?: string) {
  return ref?.split('/').pop() || '';
}
function getLabelFromId(id: string) {
  return id.split('.').pop();
}

function formatNodeLabelByType(label?: string, type?: string) {
  switch (type) {
    case 'class':
      return `${upperFirst(camelCase(label))}`;
    case 'class-ref':
      return `${upperFirst(camelCase(label))}`;
    default:
      return camelCase(label);
  }
}

function getPropertyType(property: (OpenAPIV3.SchemaObject & { $ref?: string})) {
  if (property.properties) {
    return 'class';
  }

  if(property.$ref) {
    return 'class-ref'
  }

  if(property.oneOf) {
    return 'variant';
  }

  return property.type;
}

function isPrimitiveSchema(schema: OpenAPIV3.SchemaObject) {
  const {type, properties} = schema;
  if (type === 'array' || (type === 'object' && properties) || !type) {
    return false;
  }

  return true;
}

enum EdgeType {
  DOMAIN = 'rdf:domain',
  RANGE = 'rdf:range',

  TYPE = 'rdf:type'
}

function createNode(graph: RDFSGraph, {
  id,
  type,
  data
}: { id: string, type?: string, data?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject }) {
  graph.nodes.push({
    id,
    label: formatNodeLabelByType(getLabelFromId(id), type),
    type,
    data,
  })
}

function createEdge(graph: RDFSGraph, {id, parentId, edgeType}: { id: string, parentId: string, edgeType: EdgeType }) {
  const source = edgeType === EdgeType.DOMAIN ? id : parentId;
  const target = edgeType === EdgeType.DOMAIN ? parentId : id;

  graph.edges.push({
    id: `${source}-${target}`,
    source,
    target,
    label: edgeType
  })
}

export function jsonSchemaToRdfsGraph(schema: OpenAPIV3.SchemaObject) {
  const graph: RDFSGraph = {nodes: [], edges: []};
  parseJsonPartToRdfsGraph(schema.title || '', schema, graph);
  return graph;
}

function parseJsonPartToRdfsGraph(
  id: string,
  schema: OpenAPIV3.SchemaObject,
  graph: RDFSGraph = {nodes: [], edges: []},
  parentId?: string,
  parentEdgeType?: EdgeType,
): RDFSGraph {

  if (!id) {
    throw new Error(`No id for schema part: ${JSON.stringify(schema || {}, null, 2)}`);
  }

  // Create node
  createNode(graph, {id: id, type: getPropertyType(schema), data: schema});

  // Create edge node -> parent
  if (parentId && parentEdgeType) {
    createEdge(graph, { id, parentId, edgeType: parentEdgeType });
  }

  if (schema.type === 'array') {
    // Create rdf:List node
    const listNodeId = `${id}.rdf:List`;
    createNode(graph, {id: listNodeId, type: 'rdf:List', data: undefined});

    // Create edge property -> rdf:List
    createEdge(graph, { id: listNodeId, parentId: id, edgeType: EdgeType.RANGE });

    const items = schema.items as OpenAPIV3.SchemaObject || {};
    if (isPrimitiveSchema(items)) {
      // Create type node
      const typeNodeId = `${id}.${items.type}`;
      createNode(graph, {id: typeNodeId, type: 'type', data: undefined});

      // Create rdf:range edge property -> type
      createEdge(graph, { id: typeNodeId, parentId: listNodeId, edgeType: EdgeType.TYPE });
    } else {
      const $ref = (items as OpenAPIV3.SchemaObject & { $ref: string })?.$ref || '';
      const nextId = $ref
        ? getSchemaTitleFromRef($ref)
        : `${id}.${items.type}`;
      parseJsonPartToRdfsGraph(nextId, items, graph, listNodeId, EdgeType.TYPE);
    }
  }

  if (!schema.type && schema.oneOf) {
    // @ts-ignore
    schema.oneOf.forEach((subSchema: OpenAPIV3.SchemaObject) => {
      parseJsonPartToRdfsGraph(`${id}.${subSchema.type}`, subSchema, graph, id, EdgeType.RANGE);
    })
  }

  if (schema.properties) {
    Object.keys(schema.properties).forEach(propertyKey => {
      const subSchema = schema.properties?.[propertyKey] as OpenAPIV3.SchemaObject;
      parseJsonPartToRdfsGraph(`${id}.${propertyKey}`, subSchema, graph, id, EdgeType.DOMAIN);
    });
  }

  if (isPrimitiveSchema(schema)) {
    // Create type node
    const typeNodeId = `${id}.${schema.type}`;
    createNode(graph, {id: typeNodeId, type: 'type', data: undefined});

    // Create rdf:range edge property -> type
    createEdge(graph, { id: typeNodeId, parentId: id, edgeType: EdgeType.RANGE });
  }

  return graph;
}
