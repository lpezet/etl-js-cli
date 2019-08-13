const Fs = require('fs');
const path = require('path');
const util = require('util');

const ETLClass = require('@lpezet/etl-js');

const RemoteExecutorClass = require('@lpezet/etl-js/lib/executors').remote;
const LocalExecutorClass = require('@lpezet/etl-js/lib/executors').local;

var register_mod = function( pETL, pMod, pSettings) {
	var Class = require( pMod );
	var Factory = Class.bind.apply(Class, [ null, pETL, pSettings ] );
	return new Factory();
}

var logger = null;

MainClass = function( pLogger ) {
	logger = pLogger;
};

MainClass.prototype._handle_error = function( pError, pReject ) {
	logger.error('Unexpected error.', pError );
	if ( pReject ) pReject( pError );
}

MainClass.prototype._create_file = function( pOutputFilename, pTemplateFilename, pResolve, pReject ) {
	try {
		var oResolvedTemplateFilename = path.resolve(__dirname, pTemplateFilename);
		var oResolvedOutputFilename = path.resolve(process.cwd(), pOutputFilename);
		Fs.readFile( oResolvedTemplateFilename, {encoding: 'utf8'}, function( err, data) {
			if ( err ) {
				this._handle_error( err, pReject );
			} else {
				try {
					Fs.writeFile( oResolvedOutputFilename, data, {encoding: 'utf8'}, function( err2 ) {
						if ( err2 ) {
							that._handle_error( err2, pReject );
						} else {
							logger.info('File %s created.', oResolvedOutputFilename);
							//console.log('Settings file created.');
							pResolve();
						}
					});
				} catch (e) {
					this._handle_error( e, pReject );
				}
				
				
			}
		});
	} catch ( e ) {
		this._handle_error( e, pReject );
	}
};

MainClass.prototype.init = function( pParameters ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		var oSettintgsFile = path.resolve( process.cwd(), 'settings.yml');
		if ( Fs.existsSync( oSettintgsFile ) && ! pParameters.force ) {
			var oErrorMsg = ['File %s already exists. Use argument -f to force initialization (and file will be overwritten).', oSettintgsFile ];
			console.error( util.format.apply(null, oErrorMsg ) )
			logger.error(oErrorMsg );
			reject( oErrorMsg );
		} else {
			var generate_settings_file = function() {
				return new Promise( function( resolve, reject ) {		
					that._create_file( 'settings.yml', 'templates/settings.yml', resolve, reject );
				});
			};
			
			var generate_sample_etl_file = function() {
				return new Promise( function( resolve, reject ) {		
					that._create_file( 'etl.yml', 'templates/etl.sample.yml', resolve, reject );
				});
			};
			
			generate_settings_file().then(function() {
				return generate_sample_etl_file();
			}).then(function() {
				resolve();
			}, function( pError ) {
				reject( pError );
			})
		}
	});
};

MainClass.prototype._validate_settings = function( pSettings ) {
	if ( ! pSettings || !pSettings['etl'] || !pSettings['etl']['executor'] ) {
		logger.error('Settings must be specified. Edit settings.yml and configure at least etl.executor and run command again.');
		process.exit();
	}
	if ( !pSettings['executors'] || ! pSettings['executors'][ pSettings['etl']['executor'] ]  ) {
		logger.error('Executor configuration missing. Please provide "executors:" configuration in settings.yml.');
		process.exit();
	}
}


MainClass.prototype.parse_planner = function( pPlanner ) {
	var oSteps = {};
	var oCurrentStep = null;
	var oCurrentStepActivities = null;
	var oSplits = pPlanner.split(',');
	for (var i in oSplits) {
		var plan = oSplits[i];
		if ( plan.indexOf('[') > 0 ) {
			var oParts = plan.split('[');
			oCurrentStep = oParts[0];
			oCurrentStepActivities = [];
			oCurrentStepActivities.push( oParts[1].replace(']','') );
			oSteps[ oCurrentStep ] = oCurrentStepActivities;
			if ( oParts[1].indexOf(']') > 0 ) {
				oCurrentStep = null;
				oCurrentStepActivities = null;
			}
		} else if ( plan.indexOf(']') > 0 ) {
			oCurrentStepActivities.push( plan.replace(']','') );
			oCurrentStep = null;
			oCurrentStepActivities = null;
		} else if ( oCurrentStep != null ) {
			oCurrentStepActivities.push( plan );	
		} else {
			oSteps[ plan ] = true;
		}
	}
	return oSteps;
};

MainClass.prototype.run = function( pSettings, pETLTemplate, pParameters ) {
	this._validate_settings( pSettings );
	var oExecutor = null;
	
	var oExecutorName = pSettings.etl.executor;
	var oExecutorSettings = pSettings.executors[ oExecutorName ];
	switch ( oExecutorSettings.type ) {
		case "local":
			oExecutor = new LocalExecutorClass( oExecutorSettings );
			break;
		case "remote":
			oExecutor = new RemoteExecutorClass( oExecutorSettings );
			break;
		default:
			logger.error('Executor type [%s] not supported.', oExecutorSettings.type);
			process.exit();
			break;
	}
	var oETL = new ETLClass( oExecutor, pSettings, logger );
	
	register_mod( oETL, '@lpezet/etl-js/lib/commands');
	register_mod( oETL, '@lpezet/etl-js/lib/files');
	register_mod( oETL, '@lpezet/etl-js/lib/mysqlimports');
	register_mod( oETL, '@lpezet/etl-js/lib/mysqls');
	register_mod( oETL, '@lpezet/etl-js/lib/hpcc-ecls');
	register_mod( oETL, '@lpezet/etl-js/lib/hpcc-sprays');
	register_mod( oETL, '@lpezet/etl-js/lib/hpcc-desprays');
	register_mod( oETL, '@lpezet/etl-js/lib/image-charts');
	
	//var oETLActivities = pETLActivities;
	/*
	if ( pParameters['activities'] ) {
		var oActivitiesMap = {};
		for (var i in pParameters['activities']) {
			var oActivity = pParameters['activities'][i];
			oActivitiesMap[ oActivity ] = true;
		}
		oETLActivities['etl'] = pParameters['activities'];
		logger.warn('Will only run following activities: %s', pParameters['activities']);
	}
	*/
	logger.info('Running ETL...');
	return new Promise( function( resolve, reject ) {
		oETL.process( pETLTemplate, pParameters ).then( function( pResults ) {
			logger.info('Done running ETL.');
			if ( ! pParameters['silent'] ) console.dir( pResults, { depth: null } );
			resolve();
		}, function( pError ) {
			logger.error('Error running ETL.', pError);
			reject( pError );
		})
	});
}

exports = module.exports = MainClass;
