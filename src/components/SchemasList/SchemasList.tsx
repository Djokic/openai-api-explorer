import React from 'react';
import {OpenAPIV3} from "openapi-types";

import './SchemasList.css';

type SchemasListProps = {
  selectedSchema?: OpenAPIV3.SchemaObject;
  schemas: OpenAPIV3.SchemaObject[];
  onSelect: (schema: OpenAPIV3.SchemaObject) => void;
}

export default function SchemasList(props: React.PropsWithChildren<SchemasListProps>) {
  return (
    <ul className="SchemasList">
      {props.schemas.map((schema: OpenAPIV3.SchemaObject) => (
        <li
          key={schema.title}
          onClick={() => props.onSelect(schema)}
          data-active={schema.title === props.selectedSchema?.title}
        >
          {schema.title}
        </li>
      ))}
    </ul>
  );
}
