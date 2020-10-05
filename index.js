'use strict'

const soap = require('soap')
const http = require('soap')

const communicate = async (url, methodName, message, options = {}) => {
    validateParams(url, methodName, message, options)
    if (!url.endsWith('?wsdl') && !url.endsWith('?WSDL')) url += '?wsdl'

    const isHttps = options.certificate && options.password

    const client = await createSoapClient(url, options, isHttps)
    const method = createSoapMethod(client, methodName, isHttps)

    return new Promise((resolve, reject) => {
        method(message, (err, result) => {
            if (err) return reject(err)
            resolve(result)
        })
    })
}

const buildSoapOptions = options => {
    return {
        escapeXML: options.escapeXML === true,
        returnFault: true,
        disableCache: true,
        forceSoap12Headers: options.forceSoap12Headers === undefined ? true : options.forceSoap12Headers,
        httpClient: options.httpClient,
        headers: { 'Content-Type': options.contentType || 'application/soap+xml' },
        wsdl_options: { pfx: options.certificate, passphrase: options.password },
    }
}

const createSoapClient = async (url, options) => {
    const soapOptions = buildSoapOptions(options)
    const client = await soap.createClientAsync(url, soapOptions)

    if (isHttps) client.setSecurity(new soap.ClientSSLSecurityPFX(options.certificate, options.password))
    if (options.headers) options.headers.forEach(header => client.addSoapHeader(header))

    return client
}

const createSoapMethod = (client, methodName, isHttps) => {
    const service = Object.values(client.wsdl.definitions.services)[0]
    const port = Object.values(service.ports)[0]

    const method = port.binding.methods[methodName]
    const location = formatLocation(port.location, isHttps)

    return client._defineMethod(method, location)
}

const formatLocation = (location, isHttps) => {
    location = location.replace(':80', '')

    if (isHttps && location.startsWith('http:')) {
        location = location.replace('http:', 'https:')
    }

    return location
}

const validateParams = (url, methodName, message, options) => {
    if (typeof url !== 'string') {
        throw new TypeError(`Expected a string for url, got ${typeof url}`)
    }

    if (typeof methodName !== 'string') {
        throw new TypeError(`Expected a string for methodName, got ${typeof methodName}`)
    }

    if (typeof message !== 'object') {
        throw new TypeError(`Expected a object for message, got ${typeof message}`)
    }

    if (options.certificate && !Buffer.isBuffer(options.certificate)) {
        throw new TypeError(`Expected a Buffer for certificate, got ${typeof options.certificate}`)
    }

    if (options.password && typeof options.password !== 'string') {
        throw new TypeError(`Expected a string for password, got ${typeof options.password}`)
    }

    if (options.headers) {
        options.headers.forEach(header => {
            if (typeof header !== 'string') {
                throw new TypeError(`Expected a string for header, got ${typeof header}`)
            }
        })
    }

    if (options.httpClient && !(options.httpClient instanceof http.HttpClient)) {
        throw new TypeError('Expected a http.HttpClient for options.httpClient')
    }
}

module.exports = {
    buildSoapOptions,
    communicate,
}
