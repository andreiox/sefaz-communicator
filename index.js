'use strict'

const soap = require('soap')

module.exports = async (url, certificate, password, methodName, message, headers = []) => {
	validateParams(url, certificate, password, methodName, message, headers)
	if (!url.endsWith('?wsdl') && !url.endsWith('?WSDL')) {
		url += '?wsdl'
	}

	const security = new soap.ClientSSLSecurityPFX(certificate, password)
	const options = {
		escapeXML: false,
		returnFault: true,
		disableCache: true,
		forceSoap12Headers: true,
		wsdl_options: { pfx: certificate, passphrase: password },
	}

	return new Promise((resolve, reject) => {
		soap.createClient(url, options, function (err, client) {
			client.setSecurity(security)
			headers.forEach(header => client.addSoapHeader(header))

			const service = Object.values(client.wsdl.definitions.services)[0]
			const port = Object.values(service.ports)[0]

			const method = port.binding.methods[methodName]
			let location = port.location
			if (location.startsWith('http:')) {
				location = location.replace('http:', 'https:')
			}

			const func = client._defineMethod(method, location)
			func(message, options, function (methodError, result) {
				if (methodError) {
					reject(methodError)
				}

				resolve(result)
			})
		})
	})
}

const validateParams = (url, certificate, password, methodName, message, headers) => {
	if (typeof url !== 'string') {
		throw new TypeError(`Expected a string for url, got ${typeof url}`)
	}

	if (!Buffer.isBuffer(certificate)) {
		throw new TypeError(`Expected a Buffer for certificate, got ${typeof certificate}`)
	}

	if (typeof password !== 'string') {
		throw new TypeError(`Expected a string for password, got ${typeof password}`)
	}

	if (typeof methodName !== 'string') {
		throw new TypeError(`Expected a string for methodName, got ${typeof methodName}`)
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
