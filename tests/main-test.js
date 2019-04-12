const TestedClass = require('../lib/main');

const assert = require('chai').assert;
const Fs = require('fs');
const path = require('path');
const winston = require('winston');
const LoggerClass = require('../lib/winston-logger');


const logger = new LoggerClass( {
	level: 'debug',
	transports: [
		new (winston.transports.File)({ filename: 'test-etl-js.log', handleExceptions: true, humanReadableUnhandledException: true }),
        new winston.transports.Console()
    ]
});

describe('main',function(){
	
	const SETTINGS_FILE = path.resolve( process.cwd(), "settings.yml" );
	const ETL_FILE = path.resolve( process.cwd(), "etl.yml" );
	
	
	before(function(done) {
		done();
	});
	
	after(function(done) {
		if ( Fs.existsSync( SETTINGS_FILE ) ) Fs.unlinkSync( SETTINGS_FILE );
		if ( Fs.existsSync( ETL_FILE ) ) Fs.unlinkSync( ETL_FILE );
		//if ( Fs.existsSync( 'test-etl-js.log' ) ) Fs.unlinkSync( 'test-etl-js.log' );
		
		done();
	});
	
	it('init', function(done) {
		
		var oTested = new TestedClass( logger );
		oTested.init( {} ).then( function() {
			try {
				assert.isTrue( Fs.existsSync( SETTINGS_FILE ) );
				assert.isTrue( Fs.existsSync( ETL_FILE ) );
				done();
			} catch( e ) {
				done( e );
			}
		}, function( pError ) {
			done( pError );
		});
		
	});
	
	it('run', function(done) {
		var oSettings = {etl: { executor: 'local1' }, executors: { local1: { type: 'local' } }};
		var oETLActivities = {etl: {}};
		var oParameters = {};
		var oTested = new TestedClass( logger );
		oTested.run( oSettings, oETLActivities, oParameters).then( function() {
			done();
		}, function( pError ) {
			done( pError );
		});
		
	});
	
});
