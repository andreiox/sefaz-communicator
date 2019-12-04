import http from 'soap'

interface SefazCommunicatorOptions {
	certificate: Buffer
	password: string
	headers?: string[]
	httpClient?: http.HttpClient
}

export function communicate(
	url: string,
	methodName: string,
	message: object,
	options: SefazCommunicatorOptions
): Promise<object>
