import {OpenAPIV3} from "openapi-types";
import {useEffect, useState} from "react";
import {parse} from "yaml";

export function useOpenApiSpec(url: string) {
  const [spec, setSpec] = useState<OpenAPIV3.Document | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    async function fetchSpec() {
      try {
        const response = await fetch(url);
        const text = await response.text();
        const spec = parse(text);
        setSpec(spec);
      } catch (error) {
        setError(error as Error);
      }
    }
    fetchSpec();
  }, [url]);

  return { spec, error };
}
