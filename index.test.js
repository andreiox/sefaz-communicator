import test from 'ava';

import { communicate, buildSoapOptions, formatLocation, formatUrl } from '.';

test('TypeError', async t => {
  t.plan(7);

  const options = {};

  await t.throwsAsync(communicate(123), {
    instanceOf: TypeError,
    message: 'Expected a string for url, got number',
  });

  await t.throwsAsync(communicate('string', 123), {
    instanceOf: TypeError,
    message: 'Expected a string for methodName, got number',
  });

  await t.throwsAsync(communicate('string', 'methodName', 'message'), {
    instanceOf: TypeError,
    message: 'Expected a object for message, got string',
  });

  options.certificate = 'string';
  await t.throwsAsync(
    communicate('string', 'methodName', { $xml: 'message' }, options),
    {
      instanceOf: TypeError,
      message: 'Expected a Buffer for certificate, got string',
    },
  );

  options.certificate = Buffer.from('string');
  options.password = 123;
  await t.throwsAsync(
    communicate('string', 'methodName', { $xml: 'message' }, options),
    {
      instanceOf: TypeError,
      message: 'Expected a string for password, got number',
    },
  );

  options.password = '123';
  options.headers = [123];
  await t.throwsAsync(
    communicate('string', 'methodName', { $xml: 'message' }, options),
    {
      instanceOf: TypeError,
      message: 'Expected a string for header, got number',
    },
  );

  options.headers = ['header'];
  options.httpClient = Buffer.from('hello');
  await t.throwsAsync(
    communicate('string', 'methodName', { $xml: 'message' }, options),
    {
      instanceOf: TypeError,
      message: 'Expected a http.HttpClient for options.httpClient',
    },
  );
});

test('TypeError options.proxy', async t => {
  const options = { proxy: 1 };

  await t.throwsAsync(
    communicate('string', 'methodName', { $xml: 'message' }, options),
    {
      instanceOf: TypeError,
      message: 'Expected a string for proxy, got number',
    },
  );
});

test('buildSoapOptions - no forceSoap12Headers and contentType', t => {
  const res = buildSoapOptions({
    escapeXml: false,
    httpClient: 'httpClient',
    certificate: 'pfx',
    password: 'password',
  });

  t.deepEqual(res, {
    escapeXML: false,
    returnFault: true,
    disableCache: true,
    forceSoap12Headers: true,
    httpClient: 'httpClient',
    headers: { 'Content-Type': 'application/soap+xml' },
    wsdl_options: { pfx: 'pfx', passphrase: 'password' },
    request: undefined,
  });
});

test('buildSoapOptions - with forceSoap12Headers and contentType', t => {
  const res = buildSoapOptions({
    escapeXml: false,
    httpClient: 'httpClient',
    certificate: 'pfx',
    password: 'password',
    forceSoap12Headers: false,
    contentType: 'contentType',
  });

  t.deepEqual(res, {
    escapeXML: false,
    returnFault: true,
    disableCache: true,
    forceSoap12Headers: false,
    httpClient: 'httpClient',
    headers: { 'Content-Type': 'contentType' },
    wsdl_options: { pfx: 'pfx', passphrase: 'password' },
    request: undefined,
  });
});

test('formatLocation - http location with port 80 and isHttps true', t => {
  const location = 'http://foo.com:80/bar';
  const expected = 'https://foo.com/bar';

  const result = formatLocation(location, true);
  t.is(result, expected);
});

test('formatLocation - http location with port 80 and isHttps false', t => {
  const location = 'http://foo.com:80/bar';
  const expected = 'http://foo.com/bar';

  const result = formatLocation(location, false);
  t.is(result, expected);
});

test('formatLocation - http location and isHttps true', t => {
  const location = 'http://foo.com/bar';
  const expected = 'https://foo.com/bar';

  const result = formatLocation(location, true);
  t.is(result, expected);
});

test('formatLocation - https location with port 80 and isHttps true', t => {
  const location = 'https://foo.com:80/bar';
  const expected = 'https://foo.com/bar';

  const result = formatLocation(location, true);
  t.is(result, expected);
});

test('formatLocation - https location with port 8080 and isHttps true', t => {
  const location = 'https://foo.com:8080/bar';
  const expected = 'https://foo.com:8080/bar';

  const result = formatLocation(location, true);
  t.is(result, expected);
});

test('formatUrl', t => {
  let url = 'https://example.com?wsdl';
  let result = formatUrl(url);

  t.is(result, url);

  url = 'https://example.com?singleWsdl';
  result = formatUrl(url);

  t.is(result, url);

  url = 'https://example.com?WSDL';
  result = formatUrl(url);

  t.is(result, url);

  url = 'https://example.com';
  result = formatUrl(url);

  t.is(result, `${url}?wsdl`);
});
