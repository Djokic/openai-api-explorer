import {OpenAPIV3} from "openapi-types";
import { capitalize, camelCase } from "lodash";

type NodeData = Record<string, any> & {
  id: string;
  data: any,
  width: number;
  height: number;
}

type EdgeData = Record<string, any> & {
  id: string;
  sources: string[];
  targets: string[];
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

const layoutOptions = {
  "elk.algorithm": "layered",
  "hierarchyHandling": "INCLUDE_CHILDREN",
  "elk.direction": "DOWN",
  "elk.alignment": "DOWN",
  "elk.portAlignment.default": "CENTER",
  "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
  "elk.layered.cycleBreaking.strategy": "MODEL_ORDER",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX", //BRANDES_KOEPF
  "elk.layered.considerModelOrder.strategy": "NONE",
  "elk.layered.nodePlacement.bk.edgeStraightening": "NONE",
  "elk.layered.nodePlacement.bk.fixedAlignment": "LEFTUP",
  "elk.layered.nodePlacement.networkSimplex.nodeFlexibility.default": "NONE",
  "elk.layered.layering.nodePromotion.strategy": "NONE",
  "elk.layered.compaction.postCompaction.strategy": "NONE",
  "elk.partitioning.activate": true,
  "edgeRouting": "ORTHOGONAL"
};

type SubGraphParams = {
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  id: string;
  parentId?: string;
  nodes: NodeData[];
  edges: EdgeData[];
}

function createChildNodeWithEdges({ schema, id, parentId, nodes, edges }: SubGraphParams) {
  const { type = undefined } = schema as OpenAPIV3.SchemaObject;
  const compositeId = parentId ? `${parentId}.${id}` : id;

  // Child node
  nodes.push({
    id: compositeId,
    className: `node-${type}`,
    type,
    data: schema,
    ...DefaultSize,
  });

  if (parentId) {
    const relationId = `${parentId}.has_${id}`;
    const relationType = 'relation';
    // Relation node
    nodes.push({
      id: relationId,
      className: `node-${relationType}`,
      type: relationType,
      data: schema,
      ...DefaultSize,
    });

    // Edge relation -> parent
    edges.push({
      id: `${relationId}.${parentId}`,
      sources: [relationId],
      targets: [parentId],
      label: 'rdfs:domain'
    });

    // Edge relation -> child
    edges.push({
      id: `${relationId}.${compositeId}`,
      sources: [relationId],
      targets: [compositeId],
      label: 'rdfs:range'
    });
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

  nodes.push({
    id: schema.title || 'root',
    className: 'node-object',
    type: 'object',
    data: schema,
    ...DefaultSize
  })

  createSubGraph({
    schema,
    id: schema.title || 'root',
    nodes,
    edges
  });

  return {
    id: schema.title || 'root',
    layoutOptions,
    children: nodes,
    edges
  }
}

export function getGraphData(schema: OpenAPIV3.SchemaObject): GraphParams {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];

  const rootId = schema.title || 'root';

  nodes.push({
    id: rootId,
    className: 'node-class',
    ...DefaultSize,
    data: schema,
  });

  Object.entries(schema.properties || {}).forEach(([key, value]) => {
    const propId = `${rootId}.${key}`;

    const type = (value as { type: string }).type;

    const relationshipLabel = type === 'boolean' ? 'is' : 'has';
    const relationshipId = `${rootId}.${relationshipLabel}${capitalize(key)}`;

    nodes.push({ id: propId, className: 'node-property', data: value,...DefaultSize });
    nodes.push({ id: relationshipId, className: 'node-relationship', data: value, ...DefaultSize });

    edges.push({
      id: `${relationshipId}.${rootId}`,
      sources: [relationshipId],
      targets: [rootId],
      label: 'rdfs:domain'
    });
    edges.push({
      id: `${relationshipId}.${propId}`,
      sources: [relationshipId],
      targets: [propId],
      label: 'rdfs:range'
    });
  });

  return {
    id: rootId,
    layoutOptions ,
    children: nodes,
    edges
  }
}
