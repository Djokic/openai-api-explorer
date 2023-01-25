import {OpenAPIV3} from "openapi-types";
import { jsonSchemaToRDFSGraph } from "./jsonSchema2.helper";
import { sortBy } from "lodash";

function getArraySnapshot(array:any[]) {
  const res =  sortBy(array, item => item.id);
  return res.map(item => JSON.stringify(item)).join()
}

describe('jsonSchemaToRDFSGraph', () => {
  it('simple schema', function () {
    const schema: OpenAPIV3.SchemaObject = {
      "title": "Engine",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        }
      },
    };
    const output = {
      nodes: [
        { id: 'Engine', label: 'Engine', type: 'class', data: schema },
        { id: 'Engine.id', label: 'id', type: 'string', data: { type: 'string' } },
        { id: 'Engine.id.string', label: 'string', type: 'type', data: undefined },

        { id: 'Engine.name', label: 'name', type: 'string', data: { type: 'string' } },
        { id: 'Engine.name.string', label: 'string', type: 'type', data: undefined },
      ],
      edges: [
        { id: 'Engine.id-Engine', source: 'Engine.id', target: 'Engine', label: 'rdf:domain' },
        { id: 'Engine.id-Engine.id.string', source: 'Engine.id', target: 'Engine.id.string', label: 'rdf:range' },
        { id: 'Engine.name-Engine', source: 'Engine.name', target: 'Engine', label: 'rdf:domain' },
        { id: 'Engine.name-Engine.name.string', source: 'Engine.name', target: 'Engine.name.string', label: 'rdf:range' },
      ]
    }
    const result = jsonSchemaToRDFSGraph(schema, {});
    expect(getArraySnapshot(result.nodes)).toEqual(getArraySnapshot(output.nodes));
    expect(getArraySnapshot(result.edges)).toEqual(getArraySnapshot(output.edges));
  });

  it('schema with array', function () {
    const schema: OpenAPIV3.SchemaObject = {
      "title": "Engine",
      "properties": {
        "id": {
          "type": "string"
        },
        "data": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "index": {
                "type": "integer"
              },
            }
          }
        }
      },
    };
    const output = {
      nodes: [
        { id: 'Engine', label: 'Engine', type: 'object', data: schema },
        { id: 'Engine.id', label: 'id', type: 'string', data: { type: 'string' } },
        { id: 'Engine.has_id', label: 'hasId', type: 'relation' },
        { id: 'Engine.data', label: 'data[]', type: 'array', data: { type: 'array', items: { type: 'object', properties: { index: { type: 'integer' } } } } },
        { id: 'Engine.has_data', label: 'hasData', type: 'relation' },
        { id: 'Engine.data.index', label: 'index', type: 'integer', data: { type: 'integer' } },
        { id: 'Engine.data.has_index', label: 'hasIndex', type: 'relation' },
      ],
      edges: [
        { id: 'Engine.has_id-Engine', source: 'Engine.has_id', target: 'Engine', label: 'rdf:domain' },
        { id: 'Engine.has_id-Engine.id', source: 'Engine.has_id', target: 'Engine.id', label: 'rdf:range' },
        { id: 'Engine.has_data-Engine', source: 'Engine.has_data', target: 'Engine', label: 'rdf:domain' },
        { id: 'Engine.has_data-Engine.data', source: 'Engine.has_data', target: 'Engine.data', label: 'rdf:range' },
        { id: 'Engine.data.has_index-Engine.data', source: 'Engine.data.has_index', target: 'Engine.data', label: 'rdf:domain' },
        { id: 'Engine.data.has_index-Engine.data.index', source: 'Engine.data.has_index', target: 'Engine.data.index', label: 'rdf:range' },
      ]
    };
    const result = jsonSchemaToRDFSGraph(schema, {});
    expect(getArraySnapshot(result.nodes)).toEqual(getArraySnapshot(output.nodes));
    expect(getArraySnapshot(result.edges)).toEqual(getArraySnapshot(output.edges));
  });

  it('simple schema with $ref', function () {
    const schema: OpenAPIV3.SchemaObject = {
      "title": "ListEnginesResponse",
      "type": "object",
      "properties": {
        "object": {
          "type": "string"
        },
        "data": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Engine"
          }
        }
      },
    };

    const schemasObject: Record<string, OpenAPIV3.SchemaObject> = {
      "Engine": {
        "title": "Engine",
        "properties": {
          "id": {
            "type": "string"
          },
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "index": {
                  "type": "integer"
                },
              }
            }
          }
        },
      },
    };

    const output = {
      nodes: [
        { id: 'ListEnginesResponse', label: 'ListEnginesResponse', type: 'object', data: schema },
        { id: 'ListEnginesResponse.object', label: 'object', type: 'string', data: { type: 'string' } },
        { id: 'ListEnginesResponse.has_object', label: 'hasObject', type: 'relation' },
        { id: 'ListEnginesResponse.data', label: 'data[]', type: 'array', data: { type: 'array', items: { $ref: '#/components/schemas/Engine' } } },
        { id: 'ListEnginesResponse.has_data', label: 'hasData', type: 'relation' },
        { id: 'Engine', label: 'Engine', type: 'object', data: schemasObject.Engine },
        { id: 'Engine.id', label: 'id', type: 'string', data: { type: 'string' } },
        { id: 'Engine.has_id', label: 'hasId', type: 'relation' },
        { id: 'Engine.data', label: 'data[]', type: 'array', data: { type: 'array', items: { type: 'object', properties: { index: { type: 'integer' } } } } },
        { id: 'Engine.has_data', label: 'hasData', type: 'relation' },
        { id: 'Engine.data.index', label: 'index', type: 'integer', data: { type: 'integer' } },
        { id: 'Engine.data.has_index', label: 'hasIndex', type: 'relation' },
      ],
      edges: [
        { id: 'ListEnginesResponse.has_object-ListEnginesResponse', source: 'ListEnginesResponse.has_object', target: 'ListEnginesResponse', label: 'rdf:domain' },
        { id: 'ListEnginesResponse.has_object-ListEnginesResponse.object', source: 'ListEnginesResponse.has_object', target: 'ListEnginesResponse.object', label: 'rdf:range' },
        { id: 'ListEnginesResponse.has_data-ListEnginesResponse', source: 'ListEnginesResponse.has_data', target: 'ListEnginesResponse', label: 'rdf:domain' },
        { id: 'ListEnginesResponse.has_data-ListEnginesResponse.data', source: 'ListEnginesResponse.has_data', target: 'ListEnginesResponse.data', label: 'rdf:range' },
        { id: 'ListEnginesResponse.data-Engine', source: 'ListEnginesResponse.data', target: 'Engine', label: 'rdf:type' },
        { id: 'Engine.has_id-Engine', source: 'Engine.has_id', target: 'Engine', label: 'rdf:domain' },
        { id: 'Engine.has_id-Engine.id', source: 'Engine.has_id', target: 'Engine.id', label: 'rdf:range' },
        { id: 'Engine.has_data-Engine', source: 'Engine.has_data', target: 'Engine', label: 'rdf:domain' },
        { id: 'Engine.has_data-Engine.data', source: 'Engine.has_data', target: 'Engine.data', label: 'rdf:range' },
        { id: 'Engine.data.has_index-Engine.data', source: 'Engine.data.has_index', target: 'Engine.data', label: 'rdf:domain' },
        { id: 'Engine.data.has_index-Engine.data.index', source: 'Engine.data.has_index', target: 'Engine.data.index', label: 'rdf:range' },
      ]
    }

    const result = jsonSchemaToRDFSGraph(schema, schemasObject);
    expect(getArraySnapshot(result.nodes)).toEqual(getArraySnapshot(output.nodes));
    expect(getArraySnapshot(result.edges)).toEqual(getArraySnapshot(output.edges));
  });
})
