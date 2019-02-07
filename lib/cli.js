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
	console.log('### Loaded settings!!!');
	console.dir( SETTINGS );
}

exports = module.exports = {
	_closure: function( pPromise ) {
		if ( pPromise ) {
			PromiseAll( pPromise ).then( function( data ) { }, function( error ) { console.error( error ); } );
		} else {
		}	
	},
	init: function( args ) {
		var that = this;
		
		winston.configure({
			level: 'info',
			transports: [
			             new (winston.transports.File)({ filename: 'etl-js.log', handleExceptions: true, humanReadableUnhandledException: true }),
			             new (winston.transports.Console)()
		    ]
		});
		
		
		program
			.version('1.0.2')
			//.description('For manual, use man etl-js')
			.option('-d, --debug', 'Specify log level')
			//.option('-p, --profile <profile>', 'Specify AWS Configuration Profile to use.', 'hpcc-cluster')
			//.option('-r, --region <region>', 'Specify AWS region to use', 'us-east-1');
		
		program
			.command('init')
			.description('Create configuration samples in current directory.')
			.option("-f, --force", "Force initilization even if existing configuration exists.", false)
			.action(function(options){
				options.force = options.force || false;
				Main.init( options );
			});
		
		program
			.command('run <file> [activities]')
			//.alias('update')
			.description('Run activities from file. Specify comma-delimited <activities> to filter activities to run.')
			.action(function(file, activities, options){
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
		
		program
			.command('validate')
			.description('Validate template using cluster configuration. This is mostly for debugging purposes when updating the cluster template/configuration.')
			.action(function(options){
				//that._run_command( MainClass.prototype.validate, options, [ SETTINGS ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.create( oClusterConfig, options ) );
			});
		
		program
			.command('help')
			.description('Display help.')
			.action(function(options){
				program.help();
			});
		
		/*
		program
			.command('test')
			.description('Test')
			//.option("--ip <ip_address>", "Public IP Address of node from current cluster.")
			.action(function(options){
				that._run_command( pHpccClusterClass, pHpccClusterClass.prototype.test, [ oClusterConfig, options ]);
				//winston.level = options.parent.debug;
				//closure( oHPCCCluster.ssh( oClusterConfig, options ) );
			});
		*/
		program.parse( process.argv );
		
		if (!program.args.length) {
			program.help();
			return;
		}
	}
}