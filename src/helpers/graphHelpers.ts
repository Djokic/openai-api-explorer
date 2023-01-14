import {OpenAPIV3} from "openapi-types";
import { camelCase, upperFirst} from "lodash";

export type NodeData = {
  id: string;
  label: string;
  type: string;
  data?: any,
  width: number;
  height: number;
}

export type EdgeData = {
  id: string;
  source: string;
  target: string;
  label: string;
  data?: any;
}

export type GraphData = {
  nodes: NodeData[];
  edges: EdgeData[];
}

export type GraphParams = {
  id: string;

  layoutOptions?: Record<string, any>
  children: NodeData[];
  edges: EdgeData[];
}

const DefaultSize = {
  width: 200,
  height: 50
}

export function getLabelFromId(id: string) {
  return id.split('.').pop();
}

export function formatNodeLabelByType(label?: string, type?: string) {
  switch (type) {
    case 'object':
      return `${upperFirst(camelCase(label))}`;
    case 'array':
      return `${camelCase(label)}[]`;
    default:
      return camelCase(label);
  }
}

type SubGraphParams = {
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  id: string;
  parentId?: string;
  nodes: NodeData[];
  edges: EdgeData[];
}

function createNode(id: string, type: string, data: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject) {
  return ({
    id,
    label: formatNodeLabelByType(getLabelFromId(id), type),
    type,
    data,
    ...DefaultSize
  })
}

function createEdge(id: string, source: string, target: string, label: string) {
  return { id, source, target, label};
}

function createChildNodeWithEdges({ schema, id, parentId, nodes, edges }: SubGraphParams) {
  const { type = '' } = schema as OpenAPIV3.SchemaObject;
  const compositeId = parentId ? `${parentId}.${id}` : id;

  // Child node
  nodes.push(createNode(compositeId, type, schema));

  if (parentId) {
    const relationId = `${parentId}.has_${id}`;
    const relationType = 'relation';
    // Relation node
    nodes.push(createNode(relationId, relationType, schema));

    // Edge relation -> parent
    edges.push(createEdge(`${relationId}.${parentId}`, relationId, parentId, 'rdfs:domain'));

    // Edge relation -> child
    edges.push(createEdge(`${relationId}.${compositeId}`, relationId, compositeId, 'rdfs:range'));
  }
}

function getSchemaType(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | OpenAPIV3.ArraySchemaObject) {
  let type = undefined;

  if ('properties' in schema) {
    type = 'object';
  }

  if ('items' in schema) {
    type = 'array';
  }

  if ('type' in schema) {
    type = schema.type;
  }

  return type;
}

function createSubGraph({ schema, id, parentId, nodes, edges }: SubGraphParams) {
  const compositeId = parentId ? `${parentId}.${id}` : id;

  const type = getSchemaType(schema);

  if (type === 'object') {
    const properties = (schema as OpenAPIV3.SchemaObject)?.properties || {};
    Object.keys(properties).forEach((key) => {
      createSubGraph({
        id: key,
        parentId: compositeId,
        schema: properties[key],
        nodes,
        edges
      })
    });

  } else if (type === 'array') {
    const items = (schema as OpenAPIV3.ArraySchemaObject).items;
    console.log('items', items);
    if (items) {
      createChildNodeWithEdges({
        id: `${id}_item`,
        schema: { type: (items as OpenAPIV3.SchemaObject).type} as OpenAPIV3.ArraySchemaObject,
        parentId: parentId,
        nodes,
        edges
      });

      createSubGraph({
        id: `${id}_item`,
        schema: items,
        parentId: parentId,
        nodes,
        edges
      });
    }

    // console.log('Array', id);

  } else {
    createChildNodeWithEdges({
      schema,
      id,
      parentId,
      nodes,
      edges
    });
  }
}

export function getSchemaGraph(schema: OpenAPIV3.SchemaObject) {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];

  nodes.push(createNode(schema.title || 'root', 'object', schema));

  createSubGraph({
    schema,
    id: schema.title || 'root',
    nodes,
    edges
  });

  return { nodes, edges }
}
