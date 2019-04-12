const TestedClass = require('../lib/cli');

const assert = require('chai').assert;
const path = require('path');

describe('cli',function(){
	
	before(function(done) {
		done();
	});
	
	after(function(done) {
		done();
	});
	
	it('init', function(done) {
		var oInitCalled = false;
		var oMainClass = function() {
			return {
				init: function() {
					oInitCalled = true;
					return Promise.resolve();
				}
			}
		}
		var oTested = new TestedClass( oMainClass );
		oTested.run({}, [ '/usr/local/bin/node', 'etl-js', 'init']).then( function() {
			try {
				assert.isTrue( oInitCalled );
				done();
			} catch( e ) {
				done( e );
			}
		}, function( pError ) {
			done( pError );
		});
		
	});
	
	it('run', function(done) {
		var oRunCalled = false;
		var oMainClass = function() {
			return {
				run: function() {
					oRunCalled = true;
					return Promise.resolve();
				}
			}
		}
		var oETLFile = path.resolve(__dirname, 'sample_etl.yml');
		var oTested = new TestedClass( oMainClass );
		oTested.run({}, [ '/usr/local/bin/node', 'etl-js', 'run', oETLFile]).then( function() {
			try {
				assert.isTrue( oRunCalled );
				done();
			} catch( e ) {
				done( e );
			}
		}, function( pError ) {
			done( pError );
		});
		
	});
	
});
