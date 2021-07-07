import * as soap from 'soap';

interface SefazCommunicatorOptions {
  certificate?: Buffer;
  password?: string;
  headers?: string[];
  httpClient?: soap.HttpClient;
  escapeXML: boolean;
  forceSoap12Headers?: boolean;
  contentType?: string;
  proxy?: string;
  customFormatLocation?: (location: string) => string;
  rawResponse?: boolean;
}

export function communicate(
  url: string,
  methodName: string,
  message: object,
  options: SefazCommunicatorOptions,
): Promise<Record<string, unknown> | string>;
