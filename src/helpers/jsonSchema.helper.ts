import {camelCase, upperFirst} from "lodash";
import {OpenAPIV3} from "openapi-types";

interface RDFSGraph {
  nodes: { id: string }[];
  edges: { id: string, source: string, target: string, label: string }[];
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

function createNode({ id, type, data }: { id: string, type?: string, data?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject}) {
  return ({
    id,
    label: formatNodeLabelByType(getLabelFromId(id), type),
    type,
    data,
  })
}

export function jsonSchemaToRDFSGraph(schema: OpenAPIV3.SchemaObject, schemas: Record<string, OpenAPIV3.SchemaObject>): RDFSGraph {
  const graph: RDFSGraph = {nodes: [], edges: []};
  const id = schema.title!;
  graph.nodes.push(createNode({ id, type: 'object', data: schema }));
  const properties = schema.properties || {};
  Object.keys(properties).forEach(property => {
    const propertyValue = properties[property] as OpenAPIV3.SchemaObject;
    const propertyId = `${id}.${property}`;
    const hasPropertyId = `${id}.has_${property}`;
    graph.nodes.push(
      createNode({id: propertyId, type: propertyValue.type, data: propertyValue}),
      createNode({id: hasPropertyId, type: 'relation' })
    );
    graph.edges.push({
      id: `${hasPropertyId}-${id}`,
      source: hasPropertyId,
      target: id,
      label: 'rdf:domain'
    });
    graph.edges.push({
      id: `${hasPropertyId}-${propertyId}`,
      source: hasPropertyId,
      target: propertyId,
      label: 'rdf:range'
    });
    if (propertyValue.type === 'array') {
      const items = propertyValue.items as OpenAPIV3.SchemaObject & { $ref: string };
      if (items?.properties) {
        const itemProperties = items.properties;
        Object.keys(itemProperties).forEach(itemProp => {
          const itemPropId = `${propertyId}.${itemProp}`;
          const itemHasPropId = `${propertyId}.has_${itemProp}`;
          const propertyValue = itemProperties[itemProp] as OpenAPIV3.SchemaObject;
          graph.nodes.push(
            createNode({id: itemPropId, type: propertyValue.type, data: propertyValue }),
            createNode({id: itemHasPropId, type: 'relation' })
          );
          graph.edges.push({
            id: `${itemHasPropId}-${propertyId}`,
            source: itemHasPropId,
            target: propertyId,
            label: 'rdf:domain'
          });
          graph.edges.push({
            id: `${itemHasPropId}-${itemPropId}`,
            source: itemHasPropId,
            target: itemPropId,
            label: 'rdf:range'
          });
        });
      }
      if (items?.$ref) {
        const ref = items.$ref;
        const refSchema = schemas?.[ref.substring(ref.lastIndexOf('/') + 1)];
        const refId = refSchema.title!;
        graph.edges.push({
          id: `${propertyId}-${refId}`,
          source: propertyId,
          target: refId,
          label: 'rdf:type'
        });
        const refGraph = jsonSchemaToRDFSGraph(refSchema, schemas);
        graph.nodes = graph.nodes.concat(refGraph.nodes);
        graph.edges = graph.edges.concat(refGraph.edges);
      }
    }
  });
  return graph;
}
