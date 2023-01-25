import {camelCase, upperFirst} from "lodash";
import {OpenAPIV3} from "openapi-types";

export type RDFSGraph ={
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

export function getLabelFromId(id: string) {
  return id.split('.').pop();
}

export function formatNodeLabelByType(label?: string, type?: string) {
  switch (type) {
    case 'class':
      return `${upperFirst(camelCase(label))}`;
    default:
      return camelCase(label);
  }
}

function createNode({ id, type, data }: { id: string, type?: string, data?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject}) {
  return ({
    id,
    label: formatNodeLabelByType(getLabelFromId(id), type),
    type,
    data,
  })
}

function getPropertyType(property: OpenAPIV3.SchemaObject) {
  if (property.properties) {
    return 'class';
  }

  return property.type;
}

function isPrimitivePropertyType(type?: string) {
  return Boolean(type) && ['boolean', 'string', 'integer', 'float', 'number'].includes(type!);
}

function addPrimitiveProperty(propertyId: string, property: OpenAPIV3.SchemaObject, graph: RDFSGraph) {
  // Create property node
  graph.nodes.push(createNode({id: propertyId, type: getPropertyType(property), data: property}));

  // Create property range node
  const propertyTypeNodeId = `${propertyId}.${property.type}`;
  graph.nodes.push(createNode({id: propertyTypeNodeId, type: 'type', data: undefined}));

  // Create range edge from property to property type node
  graph.edges.push({
    id: `${propertyId}-${propertyTypeNodeId}`,
    source: propertyId,
    target: propertyTypeNodeId,
    label: 'rdf:range'
  });
}

export function jsonSchemaToRDFSGraph(
  schema: OpenAPIV3.SchemaObject,
  schemas: Record<string, OpenAPIV3.SchemaObject>,
  prevNodes: RDFSNode[] = [],
  prevEdges: RDFSEdge[] = [],
  rootElementId = ''
): RDFSGraph {
  const graph: RDFSGraph = {
    nodes: prevNodes,
    edges: prevEdges
  };

  const rootId = rootElementId || schema.title;

  if (!rootId) {
    throw new Error(`No rootId for schema: ${JSON.stringify(schema || {}, null, 2)}`);
  }

  // Create root element
  graph.nodes.push(createNode({ id: rootId, type: 'class', data: schema }));

  const properties = schema.properties || {};
  Object.keys(properties).forEach(propertyKey => {
    const propertyId = `${rootId}.${propertyKey}`;
    const property = properties[propertyKey] as OpenAPIV3.SchemaObject;

    // Create property domain edge
    graph.edges.push({
      id: `${propertyId}-${rootId}`,
      source: propertyId,
      target: rootId,
      label: 'rdf:domain'
    });

    if (property.type === 'object') {
      if (property.properties) {
        jsonSchemaToRDFSGraph(
          property,
          schemas,
          graph.nodes,
          graph.edges,
          propertyId
        );
      } else {
        addPrimitiveProperty(propertyId, property, graph);
      }
    }

    if (property.type === 'array') {
      // Create property node
      graph.nodes.push(createNode({id: propertyId, type: getPropertyType(property), data: property}));

      // Create rdf:List node
      const propertyListNodeId = `${propertyId}.rdf:List`;
      graph.nodes.push(createNode({id: propertyListNodeId, type: 'rdf:List', data: undefined}));

      // Create edge from property to rdf:List
      graph.edges.push({
        id: `${propertyId}-${propertyListNodeId}`,
        source: propertyId,
        target: propertyListNodeId,
        label: 'rdf:range'
      });


      // Create property type node
      const propertyItemValue = property.items as OpenAPIV3.SchemaObject & { $ref?: string };
      if (propertyItemValue.$ref) {
        const refId = propertyItemValue.$ref.substring(propertyItemValue.$ref.lastIndexOf('/') + 1);
        const refSchema = schemas?.[refId];

        // Create edge from rdf:List to property type node
        graph.edges.push({
          id: `${propertyListNodeId}-${refId}`,
          source: propertyListNodeId,
          target: refId,
          label: 'rdf:type'
        });

        graph.nodes.push(createNode({
          id: refId,
          type: getPropertyType(refSchema),
          data: refSchema
        }));
      } else {
        // Create edge from rdf:List to property type node
        const propertyTypeNodeId = `${propertyId}.${propertyKey}Item`;
        graph.edges.push({
          id: `${propertyListNodeId}-${propertyTypeNodeId}`,
          source: propertyListNodeId,
          target: propertyTypeNodeId,
          label: 'rdf:type'
        });

        graph.nodes.push(createNode({
          id: propertyTypeNodeId,
          type: getPropertyType(propertyItemValue),
          data: propertyItemValue
        }));
      }
    }

    if (isPrimitivePropertyType(property.type)) {
      addPrimitiveProperty(propertyId, property, graph);
    }

    if(!property.type && property.oneOf) {
      // Create property node
      graph.nodes.push(createNode({id: propertyId, type: getPropertyType(property), data: property}));

      // Create nodes and edges for each kind
      property.oneOf.forEach((propKind) => {

      })
    }
  });
  return graph;
}
