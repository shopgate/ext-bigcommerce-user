# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [3.0.1] - 2019-11-11
### Fixed
- usage of cached user information

## [3.0.0] - 2019-02-28
### Removed
- JWT token translation from plugin. See [README](./README.md) for more details.
- appClientSecret and appClientId configuration fields

## [2.0.0] - 2019-02-20
### Added
- basic user data management
- user data can now be expired, time to live is configurable
- logging for all API calls
## Changed
- frontend migration to PWA6.
### Fixed
- handling user not found case during login process

## [0.4.3] - 2019-01-03
### Fixed
- ensured user data will be provided on auto login

## [0.4.2] - 2018-11-14
### Changed
- login error messages are returned from login pipeline, if request is rejected with parseable error message

## [0.4.1] - 2018-10-04
### Changed
- login user via validate password api

## [0.4.0] - 2018-05-16
### Added
- login to BigCommerce and logout of BigCommerce
- frontend logic for opening registration url

## [0.3.0] - 2018-05-08
### Added
- auto login pipeline for users to be able to login automatically after registering in BigCommerce store.
- getUser pipeline providing only user id.

## [0.2.0] - 2018-04-17
### Added
- Shopgate's getRegistrationUrl pipeline.

## [0.1.0] - 2018-04-16
### Added
- login pipeline now calls an additional step at the end (from the bigcommerce cart extension) that merges the anonymous cart into the logged in cart

[Unreleased]: https://github.com/shopgate/ext-bigcommerce-user/compare/v3.0.1...HEAD
[3.0.1]: https://github.com/shopgate/ext-bigcommerce-user/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/shopgate/ext-bigcommerce-user/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/shopgate/ext-bigcommerce-user/compare/v0.4.3...v2.0.0
[0.4.3]: https://github.com/shopgate/ext-bigcommerce-user/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/shopgate/ext-bigcommerce-user/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/shopgate/ext-bigcommerce-user/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/shopgate/ext-bigcommerce-user/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/shopgate/ext-bigcommerce-user/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/shopgate/ext-bigcommerce-user/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/shopgate/ext-bigcommerce-user/tree/v0.1.0
