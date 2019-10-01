'use strict'

const soap = require('soap')

module.exports = async (url, certificate, password, func, xml) => {
	validateParams(url, certificate, password, func, xml)
	if (!url.endsWith('?wsdl')) {
		url += '?wsdl'
	}

	const security = new soap.ClientSSLSecurityPFX(certificate, password)
	const options = {
		escapeXML: false,
		disableCache: true,
		wsdl_options: { pfx: certificate, passphrase: password },
	}

	const client = await soap.createClientAsync(url, options)
	client.setSecurity(security)

	const response = await client[`${func}Async`]({ $xml: xml })
	return response[0]
}

const validateParams = (url, certificate, password, func, xml) => {
	if (typeof url !== 'string') {
		throw new TypeError(`Expected a string for url, got ${typeof url}`)
	}

	if (!Buffer.isBuffer(certificate)) {
		throw new TypeError(`Expected a Buffer for certificate, got ${typeof certificate}`)
	}

	if (typeof password !== 'string') {
		throw new TypeError(`Expected a string for password, got ${typeof password}`)
	}

	if (typeof func !== 'string') {
		throw new TypeError(`Expected a string for func, got ${typeof func}`)
	}

	if (typeof xml !== 'string') {
		throw new TypeError(`Expected a string for xml, got ${typeof xml}`)
	}
}
