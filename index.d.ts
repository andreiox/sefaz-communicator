import * as soap from 'soap'

interface SefazCommunicatorOptions {
    certificate?: Buffer
    password?: string
    headers?: string[]
    httpClient?: soap.HttpClient
    escapeXML: boolean,
    forceSoap12Headers?: boolean,
    contentType?: string
}

export function communicate(
    url: string,
    methodName: string,
    message: object,
    options: SefazCommunicatorOptions,
): Promise<object>
