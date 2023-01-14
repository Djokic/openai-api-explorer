import {OpenAPIV3} from "openapi-types";

export function parseSchemas(schemas: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}): OpenAPIV3.SchemaObject[] {
  return Object.entries(schemas).map(([name, schema]) => {
    return {
      title: name,
      ...schema
    };
  });
}
