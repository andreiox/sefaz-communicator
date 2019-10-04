'use strict'

const soap = require('soap')

module.exports = async (url, certificate, password, method, message, headers = []) => {
	validateParams(url, certificate, password, method, message, headers)
	if (!url.endsWith('?wsdl')) {
		url += '?wsdl'
	}

	const security = new soap.ClientSSLSecurityPFX(certificate, password)
	const options = {
		escapeXML: false,
		returnFault: true,
		disableCache: true,
		wsdl_options: { pfx: certificate, passphrase: password },
	}

	const client = await soap.createClientAsync(url, options)
	client.setSecurity(security)
	headers.forEach(header => client.addSoapHeader(header))

	const response = await client[`${method}Async`](message)
	return response[0]
}

const validateParams = (url, certificate, password, method, message, headers) => {
	if (typeof url !== 'string') {
		throw new TypeError(`Expected a string for url, got ${typeof url}`)
	}

	if (!Buffer.isBuffer(certificate)) {
		throw new TypeError(`Expected a Buffer for certificate, got ${typeof certificate}`)
	}

	if (typeof password !== 'string') {
		throw new TypeError(`Expected a string for password, got ${typeof password}`)
	}

	if (typeof method !== 'string') {
		throw new TypeError(`Expected a string for method, got ${typeof method}`)
	}

	if (typeof message !== 'object') {
		throw new TypeError(`Expected a object for message, got ${typeof message}`)
	}

	headers.forEach(header => {
		if (typeof header !== 'string') {
			throw new TypeError(`Expected a string for header, got ${typeof header}`)
		}
	})
}
