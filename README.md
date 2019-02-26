# Shopgate Connect - Bigcommerce User Extension

[![GitHub license](http://dmlc.github.io/img/apache2.svg)](LICENSE)
[![Build Status](https://travis-ci.org/shopgate/ext-bigcommerce-user.svg?branch=master)](https://travis-ci.org/shopgate/ext-bigcommerce-user)

This BigCommerce extension will sync the user from Shopgate to BigCommerce.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) file for more information.

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) file for more information.

## Configuration
This extension can be configured using following parameters:
* **storeDomain** - domain of the shop for example my-domain.mybigcommerce.com
* **storeHash** - the hash as retrieved by BigCommerce credentials for API account
* **clientId** - the client id as retrieved by BigCommerce credentials for API account
* **clientSecret** - the client secret as retrieved by BigCommerce credentials for API account
* **accessToken** - the access token as retrieved by BigCommerce credentials for API account
* **userInfoTTL** - optional, time to live for user cache/data for example
    * 60s - sixty seconds
    * 5m - five minutes
    * 1h - one hour
    * 1d - one day 
    * 2d 5h 30m - two days, five hours and thirty minutes 

## JWT Payload translation
The bigcommerce.user.autologin.v1 pipeline was created to log the customer in our App from a BigCommerce in-app browser. 
It is called by a theme script which is injected into the BigCommerce store via Web Analytics Google script.
The theme generator code can be found [here](https://github.com/shopgate/bigcommerce-js) as well as the instructions.

One can also notice that the customer is requested from the theme 
[code](https://github.com/shopgate/bigcommerce-js/blob/ff923770a1842184547413425b909b27a103c071/src/modules/app_event_subscribers/autologin.js#L20) 
and passed into our autologin pipeline.

To increase security we outsourced the translation of this JWT payload token to a different plugin, 
see the mentioned pipeline file to see how it is used:
```$xslt
{
    "type": "pipeline",
    "id": "bigcommerce.user.customerJwtDecrypt.v1.json",
    "input": [
      {"key": "payload", "id": "200"},
      {"key": "algorithm", "id": "300", "optional": true}
    ],
    "output": [
      {"key": "customer", "id": "1000"}
    ]
},
{
    "type": "errorCatchExtension",
    "id": "@shopgate/bigcommerce-user",
    "path": "@shopgate/bigcommerce-user/lib/errors/catchJwtError.js",
    "input": [],
    "output": []
},
```
Note that all customerJwtDecrypt does is decrypting the payload via an 
npm module [jwt-simple](https://www.npmjs.com/package/jwt-simple):
```$xslt
const { customer } = jwtDecoder.decode(payload, appClientSecret, false, algorithm)
```
The `response.customer` returned in the 
[object](https://developer.bigcommerce.com/api-docs/customers/current-customer-api) of the BigCommerce' 
`Current Customer API` call.

Just like in the above pipeline json, do not forget to handle the errors that come from the `jwt-simple` module 
in your custom pipelines.

## About Shopgate

Shopgate is the leading mobile commerce platform.

Shopgate offers everything online retailers need to be successful in mobile. Our leading
software-as-a-service (SaaS) enables online stores to easily create, maintain and optimize native
apps and mobile websites for the iPhone, iPad, Android smartphones and tablets.

## License

This extension is available under the Apache License, Version 2.0.

See the [LICENSE](./LICENSE) file for more information.
