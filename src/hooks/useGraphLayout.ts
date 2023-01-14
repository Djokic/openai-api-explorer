import {useCallback, useEffect, useState} from "react";
import {ElkNode} from 'elkjs';
import {OpenAPIV3} from "openapi-types";
import {getLayout} from "../helpers/elkHelper";

import { getSchemaGraph } from "../helpers/graphHelpers";

export function useGraphLayout(schema?: OpenAPIV3.SchemaObject) {
  const [data, setData] = useState<ElkNode | undefined>(undefined);

  const calcLayout = useCallback(async () => {
    const graph = getSchemaGraph(schema || {});
    console.log('graph',graph);

    const layout = await getLayout(graph);
    setData(layout as ElkNode);
  }, [schema]);

  useEffect(() => {
    calcLayout();
  }, [calcLayout]);

  return data;
}
