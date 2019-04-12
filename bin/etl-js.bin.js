#!/usr/bin/env node

const Fs = require('fs');
const { yamlParse } = require('yaml-cfn');
const path = require('path');
const MainClass = require('../lib/main');

var oSettingsFile = path.resolve( process.cwd(), "settings.yml" );
var oSettings = {};
if ( Fs.existsSync( oSettingsFile ) ) {
	oSettings = yamlParse( Fs.readFileSync( oSettingsFile, {encoding: 'utf8'}) );
}
var CLIClass = require('../lib/cli');
new CLIClass( MainClass ).run(oSettings, process.argv);