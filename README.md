# ETL-JS CLI

Extract, Transform, and Load sharable and repeatable from command line.

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Known Vulnerabilities][vulnerabilities-image]][vulnerabilities-url]

```bash
mkdir my-etl && cd my-etl
# Initialize
etl-js init
# Use local executor
sed -i "s/executor: remote1/executor: local1/" settings.yml
# Create a simple template downloading Orion nebula from NASA site
echo -e "etlSets:\n default:\n  - step1\nstep1:\n files:\n  /tmp/orion-nebula.jpg:\n   source: https://www.nasa.gov/sites/default/files/thumbnails/image/orion-nebula-xlarge_web.jpg" > download_orion_nebula.yml
# Run template
etl-js run download_orion_nebula.yml
```

The image is downloaded locally to ``/tmp/orion-nebula.jpg``.

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Features](#features)
- [Concept](#concept)
- [Examples/Tutorials](#examplestutorials)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

```bash
npm install --global @lpezet/etl-js-cli
```

# Features

* Template-based process using YML to express steps and activities as part of ETL
* Built-in modules to leverage already installed software (e.g. mysql, mysqlimport, etc.)
* Dynamic behavior through the use of *tags* in activities.

# Concept

This command line tool lets you tap into the power of [ETL-JS](https://github.com/lpezet/etl-js).
The idea is to be able to share and easily repeat activities, and leverage existing tools as much as possible.

Steps and activities are basically specified in YML like so:

```yml
etlSets:
 default:
  - activity1
  - activity2
 somethingelse:
  - activity3

activity1:
 commands:
  my_command:
   command: echo "Hello..."

activity2:
 commands:
  something:
   command: echo "World!"

activity3:
 commands:
  bye_bye:
   command: echo "Bye bye!"
```

For more details, have a look at [ETL-JS](https://github.com/lpezet/etl-js).

# Examples/Tutorials

Examples and tutorials can be found [here](examples/README.md).

# License

[MIT](LICENSE)

[npm-image]: https://badge.fury.io/js/%40lpezet%2Fetl-js-cli.svg
[npm-url]: https://npmjs.com/package/@lpezet/etl-js-cli
[travis-image]: https://travis-ci.org/lpezet/etl-js-cli.svg?branch=master
[travis-url]: https://travis-ci.org/lpezet/etl-js-cli
[coveralls-image]: https://coveralls.io/repos/github/lpezet/etl-js-cli/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/lpezet/etl-js-cli?branch=master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/hxkr7yml7qhi9jo8?svg=true
[appveyor-url]: https://ci.appveyor.com/project/lpezet/etl-js-cli
[vulnerabilities-image]: https://snyk.io/test/github/lpezet/etl-js-cli/badge.svg
[vulnerabilities-url]: https://snyk.io/test/github/lpezet/etl-js-cli

# Publishing

To publish next version of `etl-js-cli`, run the following:

```bash
npm run prepare
npm publish dist/ --access public
```
