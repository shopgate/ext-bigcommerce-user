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

## About Shopgate

Shopgate is the leading mobile commerce platform.

Shopgate offers everything online retailers need to be successful in mobile. Our leading
software-as-a-service (SaaS) enables online stores to easily create, maintain and optimize native
apps and mobile websites for the iPhone, iPad, Android smartphones and tablets.

## License

This extension is available under the Apache License, Version 2.0.

See the [LICENSE](./LICENSE) file for more information.
