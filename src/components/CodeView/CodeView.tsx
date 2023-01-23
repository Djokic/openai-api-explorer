import React from 'react';

import './CodeView.css';

type CodeViewProps = {
  jsons?: (Record<string, any> | undefined)[];
  active?: boolean;
}


export default function CodeView(props: CodeViewProps) {
  const isActive = Boolean(props?.jsons?.some(Boolean) && props.active);
  return (
    <div className="CodeView hide-scrollbar" data-active={isActive}>
      {props.jsons?.map((json) => (
        <pre className="hide-scrollbar">
          <header>// {json?.title}</header>
          {JSON.stringify(json || {}, null, 2)}
        </pre>
      ))}
    </div>
  )
}
