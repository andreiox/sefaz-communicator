'use strict'

const soap = require('soap')

exports.communicate = async (url, certificate, password, methodName, message, headers = []) => {
	validateParams(url, certificate, password, methodName, message, headers)
	if (!url.endsWith('?wsdl') && !url.endsWith('?WSDL')) {
		url += '?wsdl'
	}

	const client = await createSoapClient(url, certificate, password, headers)
	const method = createSoapMethod(client, methodName)

	return new Promise((resolve, reject) => {
		method(message, (err, result) => {
			if (err) return reject(err)
			resolve(result)
		})
	})
}

const createSoapClient = async (url, certificate, password, headers) => {
	const options = {
		escapeXML: false,
		returnFault: true,
		disableCache: true,
		forceSoap12Headers: true,
		headers: { 'Content-Type': 'application/soap+xml' },
		wsdl_options: { pfx: certificate, passphrase: password }
	}

	const client = await soap.createClientAsync(url, options)
	client.setSecurity(new soap.ClientSSLSecurityPFX(certificate, password))
	headers.forEach(header => client.addSoapHeader(header))

	return client
}

const createSoapMethod = (client, methodName) => {
	const service = Object.values(client.wsdl.definitions.services)[0]
	const port = Object.values(service.ports)[0]

	const method = port.binding.methods[methodName]
	let location = port.location.replace(':80', '')
	if (location.startsWith('http:')) {
		location = location.replace('http:', 'https:')
	}

	return client._defineMethod(method, location)
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
