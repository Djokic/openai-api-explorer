import React from 'react';
import {OpenAPIV3} from "openapi-types";

import './SchemasList.css';

type SchemasListProps = {
  selectedSchema?: OpenAPIV3.SchemaObject;
  codeViewActive?: boolean;
  schemas: OpenAPIV3.SchemaObject[];
  onSelect: (schema: OpenAPIV3.SchemaObject) => void;

  onCodeViewToggle?: () => void;
}

export default function SchemasList(props: React.PropsWithChildren<SchemasListProps>) {
  return (
    <ul className="SchemasList hide-scrollbar">
      {props.schemas.map((schema: OpenAPIV3.SchemaObject) => (
        <li
          key={schema.title}
          onClick={() => props.onSelect(schema)}
          data-active={schema.title === props.selectedSchema?.title}
          data-code-active={schema.title === props.selectedSchema?.title && props.codeViewActive}
        >
          {schema.title}
          {schema.title === props.selectedSchema?.title && (
            <div role="button" onClick={props.onCodeViewToggle} data-active={props.codeViewActive} title="">
              <span>
                ›
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
