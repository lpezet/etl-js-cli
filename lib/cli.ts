import { yamlParse } from "yaml-cfn";
import * as Fs from "fs";
import * as program from "commander";
import { IMain } from "./main";

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
  constructor(pMain: IMain) {
    this.mMain = pMain;
  }
  init(pSettings: any): void {
    program
      .version("1.0.0")
      .description("For manual, use man etl-js-cli")
      .option(
        "-l, --log-level [level]",
        "Specify log level: emerg (0), alert (1), crit (2), error (3), warning (4), notice (5), info (6), debug (7)"
      )
      .option("-s, --silent", "Prevent output of results (json).");

    program
      .command("init")
      .description("Create configuration samples in current directory.")
      .option(
        "-f, --force",
        "Force initilization even if existing configuration exists.",
        false
      )
      .action(async options => {
        options.force = options.force || false;
        // that.setThingsUp(options);
        await this.mMain.init(options);
      });

    program
      .command("run <file> [etlSet]")
      // .alias('update')
      .description(
        "Run activities from file. Specify <etlSet> to run specific ETL set."
      )
      .action(
        async (file, etlSet, options): Promise<any> => {
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
          await this.mMain.run(pSettings, oTemplate, oParameters);

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
    program
      .command("help")
      .description("Display help.")
      .action(
        (_options: any): Promise<any> => {
          program.help();
        }
      );

    program.command("*").action(
      (_options: any): Promise<any> => {
        program.help();
      }
    );
  }
  run(pArgs: string[]): Promise<any> {
    return program.parseAsync(pArgs);
    /*
    const cmd = program.parse(pArgs);
    if (!program.args.length) {
      program.help();
    }
    return cmd;
    */
  }
}
