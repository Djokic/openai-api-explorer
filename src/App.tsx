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
  const [showCodeView, setShowCodeView] = React.useState(true);
  const {spec } = useOpenApiSpec(SPEC_FILE_URL);
  const schemasMap = spec?.components?.schemas as Record<string, OpenAPIV3.SchemaObject>;
  const schemasList = useMemo(() => parseSchemas(spec?.components?.schemas), [spec]);
  const data = useGraphLayout({
    schema,
    schemas: schemasMap,
    nodeSize: { width: 200, height: 50 }
  });

  const toggleCodeView = () => setShowCodeView(!showCodeView);

  const handleSchemaNodeClick = (schemaTitle: string) => {
    setSchema(schemasMap[schemaTitle]);
  }

  return (
    <div className="App">
      <aside>
        <img src='./openai-logo.svg' className="logo" alt="OpenAI"/>
        <span>API Explorer</span>

        <SchemasList
          schemas={schemasList}
          selectedSchema={schema}
          onSelect={setSchema}
          codeViewActive={showCodeView}
          onCodeViewToggle={toggleCodeView}
        />
      </aside>
      <CodeView jsons={[schema]} active={showCodeView}/>

      <FlowGraph layout={data} onSchemaNodeClick={handleSchemaNodeClick}/>
      {/*<DiGraph layout={data}/>*/}
    </div>
  );
}

export default App;
