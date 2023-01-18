import {useCallback, useEffect, useState} from "react";
import {OpenAPIV3} from "openapi-types";
import {getCyLayout} from "../helpers/cyto";
import {getLayout} from "../helpers/dagreHelper";
import { getNodesWithPosition} from '../helpers/custom'

import { getSchemaGraph } from "../helpers/graphHelpers";

export function useGraphLayout(schema?: OpenAPIV3.SchemaObject) {
  const [data, setData] = useState<any>(undefined);

  const calcLayout = useCallback(async () => {
    const graph = getSchemaGraph(schema || {});
    // const layout = getLayout(graph);
    // console.log(getNodesWithPosition(graph))

    setData(getCyLayout(graph));
  }, [schema]);

  useEffect(() => {
    calcLayout();
  }, [calcLayout]);

  return data;
}
