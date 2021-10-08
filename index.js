'use strict';

const soap = require('soap');
const http = require('soap');
const request = require('request');

const communicate = async (url, methodName, message, options = {}) => {
  validateParams(url, methodName, message, options);

  const formattedUrl = formatUrl(url);
  const isHttps = options.certificate && options.password;

  const client = await createSoapClient(formattedUrl, options, isHttps);
  const method = createSoapMethod(
    client,
    methodName,
    isHttps,
    options.customFormatLocation,
  );

  return new Promise((resolve, reject) => {
    const callback = (err, result, rawResponse) => {
      if (err) return reject(err);

      options.rawResponse ? resolve(rawResponse) : resolve(result);
    };

    method(message, callback);
  });
};

const createSoapClient = async (url, options, isHttps) => {
  const soapOptions = buildSoapOptions(options);
  const client = await soap.createClientAsync(url, soapOptions);

  if (isHttps)
    client.setSecurity(
      new soap.ClientSSLSecurityPFX(options.certificate, options.password),
    );
  if (options.headers)
    options.headers.forEach(header => client.addSoapHeader(header));

  return client;
};

const createSoapMethod = (client, methodName, isHttps, customFormatLocation) => {
  const service = Object.values(client.wsdl.definitions.services)[0];

  const port = getPortByMethodName(service.ports, methodName);
  if (!port) throw new Error(`Method: '${methodName}' does not exist in wsdl`);

  const method = port.binding.methods[methodName];
  const location = formatLocation(port.location, isHttps, customFormatLocation);

  return client._defineMethod(method, location);
};

const buildSoapOptions = options => {
  const req = options.proxy
    ? request.defaults({
        timeout: 20000,
        proxy: options.proxy,
        agent: false,
        pool: { maxSockets: 200 },
      })
    : undefined;

  return {
    escapeXML: options.escapeXML === true,
    returnFault: true,
    disableCache: true,
    forceSoap12Headers:
      options.forceSoap12Headers === undefined ? true : options.forceSoap12Headers,
    httpClient: options.httpClient,
    headers: { 'Content-Type': options.contentType || 'application/soap+xml' },
    wsdl_options: { pfx: options.certificate, passphrase: options.password },
    request: req,
  };
};

const getPortByMethodName = (ports, methodName) => {
  return Object.values(ports).find(port => port.binding.methods[methodName]);
};

const formatLocation = (location, isHttps, customFormatLocation) => {
  location = location.replace(/:80[\/]/, '/');

  if (isHttps && location.startsWith('http:')) {
    location = location.replace('http:', 'https:');
  }

  return customFormatLocation ? customFormatLocation(location) : location;
};

const formatUrl = url => {
  if (/^.*[?]{1}.*(wsdl|WSDL|Wsdl){1}$/.test(url) === false) return `${url}?wsdl`;

  return url;
};

const validateParams = (url, methodName, message, options) => {
  if (typeof url !== 'string') {
    throw new TypeError(`Expected a string for url, got ${typeof url}`);
  }

  if (typeof methodName !== 'string') {
    throw new TypeError(
      `Expected a string for methodName, got ${typeof methodName}`,
    );
  }

  if (typeof message !== 'object') {
    throw new TypeError(`Expected a object for message, got ${typeof message}`);
  }

  if (options.certificate && !Buffer.isBuffer(options.certificate)) {
    throw new TypeError(
      `Expected a Buffer for certificate, got ${typeof options.certificate}`,
    );
  }

  if (options.password && typeof options.password !== 'string') {
    throw new TypeError(
      `Expected a string for password, got ${typeof options.password}`,
    );
  }

  if (options.headers) {
    options.headers.forEach(header => {
      if (typeof header !== 'string') {
        throw new TypeError(`Expected a string for header, got ${typeof header}`);
      }
    });
  }

  if (options.httpClient && !(options.httpClient instanceof http.HttpClient)) {
    throw new TypeError('Expected a http.HttpClient for options.httpClient');
  }

  if (options.proxy && typeof options.proxy !== 'string') {
    throw new TypeError(`Expected a string for proxy, got ${typeof options.proxy}`);
  }

  if (options.rawResponse && typeof options.rawResponse !== 'boolean') {
    throw new TypeError(
      `Expected a boolean for rawResponse, got ${typeof options.rawResponse}`,
    );
  }
};

module.exports = {
  communicate,
  buildSoapOptions,
  formatLocation,
  formatUrl,
};
