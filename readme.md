# sefaz-communicator

> Simple way to communicate with SEFAZ SOAP web services

## Install

```shell
npm install sefaz-communicator
```

## Usage

```js
const sefaz = require('sefaz-communicator');

const url = 'https://hnfe.sefaz.ba.gov.br/webservices/NFeStatusServico4/NFeStatusServico4.asmx'
const certificate = Buffer.from('Pfx certificate in base64 string', 'base64')
const password = 'password'
const method = 'nfeStatusServicoNF'
const message = {
   $xml: `<consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
            <tpAmb>2</tpAmb>
            <cUF>29</cUF>
            <xServ>STATUS</xServ>
          </consStatServ>`
}

const response = await sefaz(url, certificate, password, method, message)
```

## API

### sefaz(url, certificate, password, method, message)

#### url

Type: `string`

Web service URL

#### certificate

Type: `Buffer`

Pfx Certificate as Buffer

#### password

Type: `string`

Certificate password

#### method

Type: `string`

Name of Wsdl Method

#### message

Type: `object`

Examples
> message: { $xml: '<?xml>...'}

or

> message: { nfeDadosMsg: '<?xml>...'}
