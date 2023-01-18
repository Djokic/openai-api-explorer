import React, {useMemo} from 'react';
import {OpenAPIV3} from "openapi-types";
import './App.css';
import {parseSchemas} from "./helpers/schemaHelpers";
import CodeView from "./components/CodeView/CodeView";
import SchemasList from "./components/SchemasList/SchemasList";
import FlowGraph from "./components/FlowGraph/FlowGraph";


import {useGraphLayout} from "./hooks/useGraphLayout";
import {SPEC_FILE_URL} from "./helpers/constants";
import {useOpenApiSpec} from "./hooks/useOpenApiSpec";

function App() {
  const [schema, setSchema] = React.useState<OpenAPIV3.SchemaObject>();
  const {spec, error} = useOpenApiSpec(SPEC_FILE_URL);
  const schemas = useMemo(() => parseSchemas(spec?.components?.schemas), [spec]);
  const data = useGraphLayout({
    schema,
    schemas: spec?.components?.schemas as Record<string, OpenAPIV3.SchemaObject>,
    nodeSize: { width: 200, height: 50 }
  });

  return (
    <div className="App">
      <SchemasList
        schemas={schemas}
        selectedSchema={schema}
        onSelect={setSchema}
      />
      <CodeView json={schema}/>
      <FlowGraph layout={data}/>
      {/*<DiGraph layout={data}/>*/}
    </div>
  );
}

export default App;
