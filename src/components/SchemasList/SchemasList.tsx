import React, {RefObject, useEffect, useRef} from 'react';
import {OpenAPIV3} from "openapi-types";

import './SchemasList.css';

type SchemasListProps = {
  selectedSchema?: OpenAPIV3.SchemaObject;
  codeViewActive?: boolean;
  schemas: OpenAPIV3.SchemaObject[];
  onSelect: (schema: OpenAPIV3.SchemaObject) => void;

  onCodeViewToggle?: () => void;
}

function SchemasList(props: SchemasListProps) {
  const listRef = useRef(null) as RefObject<HTMLUListElement>;

  // Auto-scroll into the view li item with selected schema
  useEffect(() => {
    if (props.selectedSchema) {
      listRef.current
        ?.querySelector(`[data-schema='${props.selectedSchema.title}']`)
        ?.scrollIntoView({ behavior: 'smooth'})
    }
  }, [props.selectedSchema]);
  
  return (
    <ul className="SchemasList hide-scrollbar" ref={listRef}>
      {props.schemas.map((schema: OpenAPIV3.SchemaObject) => (
        <li
          key={schema.title}
          onClick={() => props.onSelect(schema)}
          data-schema={schema.title}
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

export default React.memo(SchemasList);
