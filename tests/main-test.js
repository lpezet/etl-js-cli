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
	
	afterEach(function(done) {
		if ( Fs.existsSync( SETTINGS_FILE ) ) Fs.unlinkSync( SETTINGS_FILE );
		if ( Fs.existsSync( ETL_FILE ) ) Fs.unlinkSync( ETL_FILE );
		//if ( Fs.existsSync( 'test-etl-js.log' ) ) Fs.unlinkSync( 'test-etl-js.log' );
		done();
	});
	
	it('initFilesAlreadyExist', function(done) {
		var oTested = new TestedClass( logger );
		oTested.init( {} ).then( function() {
			oTested.init( {} ).then( function() {
				done('Expected error (file already exists');
			}, function( pError ) {
				// good
				done();
			});
		}, function( pError ) {
			done( pError );
		});
		
	});
	
	it('initFilesAlreadyExistForce', function(done) {
		var oTested = new TestedClass( logger );
		oTested.init( {} ).then( function() {
			oTested.init( { "force": true } ).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		}, function( pError ) {
			done( pError );
		});
		
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
	
	it('runLocal', function(done) {
		var oSettings = {etl: { executor: 'local1' }, executors: { local1: { type: 'local' } }};
		var oETLActivities = {etl: {}};
		var oParameters = {};
		var oTested = new TestedClass( logger );
		oTested.init( {} ).then( function() {
			oTested.run( oSettings, oETLActivities, oParameters).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		}, function( pError ) {
			done( pError );
		});
		
	});
	
	it('runRemote', function(done) {
		var oSettings = {etl: { executor: 'remote1' }, executors: { remote1: { type: 'remote' } }};
		var oETLActivities = {etl: {}};
		var oParameters = {};
		var oTested = new TestedClass( logger );
		oTested.init( {} ).then( function() {
			oTested.run( oSettings, oETLActivities, oParameters).then( function() {
				done();
			}, function( pError ) {
				done( pError );
			});
		}, function( pError ) {
			done( pError );
		});
		
	});
	
	it('runUnknowExecutorType', function(done) {
		var oSettings = {etl: { executor: 'unknown1' }, executors: { unknown1: { type: 'unknown' } }};
		var oETLActivities = {etl: {}};
		var oParameters = {};
		var oTested = new TestedClass( logger );
		oTested.init( {} ).then( function() {
			oTested.run( oSettings, oETLActivities, oParameters).then( function() {
				done( 'Expected error.');
			}, function( pError ) {
				done();
			});
		}, function( pError ) {
			done( pError );
		});
		
	});
	
	it('invalidSettings', function(done) {
		var oInvalidSettings = {};
		var oETLActivities = {etl: {}};
		var oParameters = {};
		var oTested = new TestedClass( logger );
		oTested.run( oInvalidSettings, oETLActivities, oParameters).then( function() {
			done( 'Expected error.');
		}, function( pError ) {
			done();
		});
	});
	
	
});
