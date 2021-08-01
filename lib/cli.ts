import { yamlParse } from "yaml-cfn";
import * as Fs from "fs";
import * as program from "commander";
import { IMain } from "./main";
import * as pkg from "../package.json";

// import { configureLogger } from "../main/logger";

// const MainClass = require('./main');
/*
SETTINGS_FILE = path.resolve( process.cwd(), "settings.yml" );
var SETTINGS = null;
if ( Fs.existsSync( SETTINGS_FILE ) ) {
	SETTINGS = yamlParse( Fs.readFileSync( SETTINGS_FILE, {encoding: 'utf8'}) );
}
*/

export default class CLI {
  mMain: IMain;
  mProg: program.Command;
  constructor(pMain: IMain, pProg?: program.Command) {
    this.mMain = pMain;
    this.mProg = pProg ? pProg : new program.Command();
  }
  init(pSettings: any): void {
    const prog = this.mProg;

    prog
      .version(pkg.version)
      .description("For manual, use man etl-js-cli")
      .option(
        "-l, --log-level [level]",
        "Specify log level: emerg (0), alert (1), crit (2), error (3), warning (4), notice (5), info (6), debug (7)"
      )
      .option("-s, --silent", "Prevent output of results (json).");

    prog
      .command("init")
      .description("Create configuration samples in current directory.")
      .option(
        "-f, --force",
        "Force initilization even if existing configuration exists.",
        false
      )
      .action(options => {
        options.force = options.force || false;
        // that.setThingsUp(options);
        return this.mMain.init(options);
      });

    prog
      .command("run <file> [etlSet]")
      // .alias('update')
      .description(
        'Run activities from file. Specify <etlSet> to run specific ETL set - if omitted, default is "default".'
      )
      .action(
        (file, etlSet, options): Promise<void> => {
          // that.setThingsUp(options);
          // console.log('#### options:');
          // console.dir( options );

          const oTemplate = yamlParse(
            Fs.readFileSync(file, { encoding: "utf8" })
          );
          const oParameters: any = {};
          if (options.parent && options.parent.silent) {
            oParameters["silent"] = options.parent.silent;
          }
          if (etlSet) {
            oParameters["etlSet"] = etlSet; // activities.split(",");
          }
          return this.mMain.run(pSettings, oTemplate, oParameters);

          // winston.level = options.parent.debug;
          // closure( oHPCCCluster.create( oClusterConfig, options ) );
        }
      );
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
    prog
      .command("help")
      .description("Display help.")
      .action(
        (_options: any): Promise<void> => {
          prog.help();
          return Promise.resolve();
        }
      );

    prog.command("*").action(
      (_options: any): Promise<void> => {
        prog.help();
        return Promise.resolve();
      }
    );
  }
  run(pArgs: string[]): Promise<program.Command> {
    try {
      return this.mProg.parseAsync(pArgs);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
