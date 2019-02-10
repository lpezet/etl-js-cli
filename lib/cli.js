const program = require('commander');
const Fs = require('fs');
const { yamlParse, yamlDump } = require('yaml-cfn');
const path = require('path');
const winston = require('winston');
const MainClass = require('./main');

const Main = new MainClass();

SETTINGS_FILE = path.resolve( process.cwd(), "settings.yml" );
var SETTINGS = null;
if ( Fs.existsSync( SETTINGS_FILE ) ) {
	SETTINGS = yamlParse( Fs.readFileSync( SETTINGS_FILE, {encoding: 'utf8'}) );
}

exports = module.exports = {
	_closure: function( pPromise ) {
		if ( pPromise ) {
			PromiseAll( pPromise ).then( function( data ) { }, function( error ) { console.error( error ); } );
		} else {
		}	
	},
	setThingsUp: function( pOptions ) {
		try {
			var oTransports = [
				new (winston.transports.File)({ filename: 'etl-js.log', handleExceptions: true, humanReadableUnhandledException: true }),
	            new winston.transports.Console()
	        ];
			var oLevel = 'info';
			
			
			if ( pOptions && pOptions.parent && pOptions.parent.debug ) {
				oLevel = 'debug';
			}
			
			winston.configure({
				level: oLevel,
				transports: oTransports
			});
		} catch(e) {
			console.error(e);
			throw e;
		}
	},
	init: function( args ) {
		var that = this;
		
		program
			.version('1.0.0')
			.description('For manual, use man etl-js-cli')
			.option('-d, --debug', 'Specify log level')
			
		program
			.command('init')
			.description('Create configuration samples in current directory.')
			.option("-f, --force", "Force initilization even if existing configuration exists.", false)
			.action(function(options){
				options.force = options.force || false;
				that.setThingsUp( options );
				Main.init( options );
			});
		
		program
			.command('run <file> [activities]')
			//.alias('update')
			.description('Run activities from file. Specify comma-delimited <activities> to filter activities to run.')
			.action(function(file, activities, options){
				that.setThingsUp( options );
				//options['file'] = file;
				//options['activities'] = activities;
				
				var oETLActivities = yamlParse( Fs.readFileSync( file, {encoding: 'utf8'}) );
				var oParameters = {};
				if ( activities ) {
					oParameters['activities'] = activities.split(",");
				}
				Main.run( SETTINGS, oETLActivities, oParameters );
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
			});
		
		program.parse( process.argv );
		
		if (!program.args.length) {
			program.help();
			return;
		}
	}
}