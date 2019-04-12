const { Command } = require('commander');
const Fs = require('fs');
const { yamlParse } = require('yaml-cfn');
const winston = require('winston');
const LoggerClass = require('./winston-logger');
//const MainClass = require('./main');
/*
SETTINGS_FILE = path.resolve( process.cwd(), "settings.yml" );
var SETTINGS = null;
if ( Fs.existsSync( SETTINGS_FILE ) ) {
	SETTINGS = yamlParse( Fs.readFileSync( SETTINGS_FILE, {encoding: 'utf8'}) );
}
*/

MyClass = function( pMainClass ) {
	this.mMainClass = pMainClass;
}

MyClass.prototype._closure = function( pPromise ) {
	if ( pPromise ) {
		PromiseAll( pPromise ).then( function( data ) { }, function( error ) { console.error( error ); } );
	} else {
	}	
};

MyClass.prototype.setThingsUp = function( pOptions ) {
	try {
		var oTransports = [
			new (winston.transports.File)({ filename: 'etl-js.log', handleExceptions: true, humanReadableUnhandledException: true }),
            new winston.transports.Console()
        ];
		var oLevel = 'info';
		
		if ( pOptions && pOptions.parent && pOptions.parent.logLevel ) {
			console.log('LogLevel=' + pOptions.parent.logLevel);
			oLevel = pOptions.parent.logLevel;
		}
		
		this.mLogger = new LoggerClass( {
			level: oLevel,
			transports: oTransports
		})
		
	} catch(e) {
		console.error(e);
		throw e;
	}
};

MyClass.prototype.run = function( pSettings, pArgs ) {
	var that = this;
	return new Promise( function(resolve, reject) {
		var program = new Command();
		program
			.version('1.0.0')
			.description('For manual, use man etl-js-cli')
			.option('-l, --log-level [level]', 'Specify log level: emerg (0), alert (1), crit (2), error (3), warning (4), notice (5), info (6), debug (7)')
			.option('-s, --silent', 'Prevent output of results (json).')
			
			
		program
			.command('init')
			.description('Create configuration samples in current directory.')
			.option("-f, --force", "Force initilization even if existing configuration exists.", false)
			.action(function(options){
				options.force = options.force || false;
				that.setThingsUp( options );
				var oMain = new that.mMainClass( that.mLogger );
				oMain.init( options ).then(function() {
					resolve();
				}, function( pError ) {
					reject( pError );
				});
			});
		
		program
			.command('run <file> [activities]')
			//.alias('update')
			.description('Run activities from file. Specify comma-delimited <activities> to filter activities to run.')
			.action(function(file, activities, options){
				that.setThingsUp( options );
				//console.log('#### options:');
				//console.dir( options );
				
				var oETLActivities = yamlParse( Fs.readFileSync( file, {encoding: 'utf8'}) );
				var oParameters = {};
				if ( options.parent && options.parent.silent ) oParameters['silent'] = options.parent.silent;
				if ( activities ) {
					oParameters['activities'] = activities.split(",");
				}
				var oMain = new (that.mMainClass)( that.mLogger );
				oMain.run( pSettings, oETLActivities, oParameters ).then(function() {
					resolve();
				}, function( pError ) {
					reject( pError );
				});
				
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.create( oClusterConfig, options ) );
			});
		/*
		program
			.command('validate')
			.description('Validate template using cluster configuration. This is mostly for debugging purposes when updating the cluster template/configuration.')
			.action(function(options){
				//that._run_command( MainClass.prototype.validate, options, [ SETTINGS ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.create( oClusterConfig, options ) );
			});
		*/
		program
			.command('help')
			.description('Display help.')
			.action(function(options){
				program.help();
				resolve();
			});
		
		program
			.command('*')
			.action(function(options){
				program.help();
				resolve();
			});
		
		program.parse( pArgs );
		
		if (!program.args.length) {
			program.help();
			resolve();
		}
	});
};

exports = module.exports = MyClass;
