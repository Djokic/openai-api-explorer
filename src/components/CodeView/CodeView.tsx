import React from 'react';

import './CodeView.css';

type CodeViewProps = {
  json?: Record<string, any>;
}


export default function CodeView(props: CodeViewProps) {
  return (
    <pre className="CodeView" contentEditable={true}>
      {JSON.stringify(props.json, null, 2)}
    </pre>
  )
}
