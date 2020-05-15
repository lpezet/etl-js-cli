import * as Fs from "fs";
import * as path from "path";
import * as util from "util";
import { ETL, IETL, Local, Mod, Remote, createLogger } from "@lpezet/etl-js";

const LOGGER = createLogger("etljs-cli::main");

/**
 * @param pETL etl
 * @param pMod mod
 * @param pSettings settings
 * @return Promise<Mod>
 */
function registerMod(pETL: IETL, pMod: string, pSettings?: any): Promise<Mod> {
  return import(pMod).then(m => {
    if (m["default"]) m = m.default;
    const Factory = m.bind.apply(m, [null, pETL, pSettings || {}]);
    return new Factory() as Mod;
  });
}
/*
const register_mod = function(pETL, pMod, pSettings) {
  const Class = require(pMod);
  const Factory = Class.bind.apply(Class, [null, pETL, pSettings]);
  return new Factory();
};
*/

export interface IMain {
  init(pParameters: any): Promise<any>;
  run(pSettings: any, pETLTemplate: any, pParameters: any): Promise<any>;
}

export default class Main implements IMain {
  constructor() {
    // nop
  }
  _handleError(pError: Error, pReject: Function): void {
    LOGGER.error("Unexpected error.", pError);
    if (pReject) pReject(pError);
  }
  _createFile(
    pOutputFilename: string,
    pTemplateFilename: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const oResolvedTemplateFilename = path.resolve(
          __dirname,
          pTemplateFilename
        );
        const oResolvedOutputFilename = path.resolve(
          process.cwd(),
          pOutputFilename
        );
        Fs.readFile(
          oResolvedTemplateFilename,
          { encoding: "utf8" },
          (err, data) => {
            if (err) {
              this._handleError(err, reject);
            } else {
              try {
                Fs.writeFile(
                  oResolvedOutputFilename,
                  data,
                  { encoding: "utf8" },
                  err2 => {
                    if (err2) {
                      this._handleError(err2, reject);
                    } else {
                      LOGGER.info("File %s created.", oResolvedOutputFilename);
                      // console.log('Settings file created.');
                      resolve();
                    }
                  }
                );
              } catch (e) {
                this._handleError(e, reject);
              }
            }
          }
        );
      } catch (e) {
        this._handleError(e, reject);
      }
    });
  }
  init(pParameters: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const oSettintgsFile = path.resolve(process.cwd(), "settings.yml");
      if (Fs.existsSync(oSettintgsFile) && !pParameters.force) {
        const oErrorMsg: [any, ...any[]] = [
          "File %s already exists. Use argument -f to force initialization (and file will be overwritten).",
          oSettintgsFile
        ];
        console.error(util.format.apply(null, oErrorMsg));
        LOGGER.error(oErrorMsg);
        reject(oErrorMsg);
      } else {
        const generateSettingsFile = (): Promise<any> => {
          return this._createFile("settings.yml", "templates/settings.yml");
        };

        const generateSampleEtlFile = (): Promise<any> => {
          return this._createFile("etl.yml", "templates/etl.sample.yml");
        };

        generateSettingsFile()
          .then(function() {
            return generateSampleEtlFile();
          })
          .then(
            function() {
              resolve();
            },
            function(pError) {
              reject(pError);
            }
          );
      }
    });
  }
  _validSettings(pSettings: any): boolean {
    if (!pSettings || !pSettings["etl"] || !pSettings["etl"]["executor"]) {
      LOGGER.error(
        "Settings must be specified. Edit settings.yml and configure at least etl.executor and run command again."
      );
      return false;
    }
    if (
      !pSettings["executors"] ||
      !pSettings["executors"][pSettings["etl"]["executor"]]
    ) {
      LOGGER.error(
        'Executor configuration missing. Please provide "executors:" configuration in settings.yml.'
      );
      return false;
    }
    return true;
  }
  run(pSettings: any, pETLTemplate: any, pParameters: any): Promise<any> {
    if (!this._validSettings(pSettings)) {
      return Promise.reject(new Error("Invalid settings."));
    }
    let oExecutor = null;

    const oExecutorName = pSettings.etl.executor;
    const oExecutorSettings = pSettings.executors[oExecutorName];
    switch (oExecutorSettings.type) {
      case "local":
        oExecutor = new Local(oExecutorSettings);
        break;
      case "remote":
        oExecutor = new Remote(oExecutorSettings);
        break;
      default:
        LOGGER.error(
          "Executor type [%s] not supported.",
          oExecutorSettings.type
        );
        break;
    }
    if (!oExecutor) {
      return Promise.reject(new Error("Invalid/Missing executor."));
    }
    const oETL = new ETL(oExecutor, pSettings);

    registerMod(oETL, "@lpezet/etl-js/lib/commands");
    registerMod(oETL, "@lpezet/etl-js/lib/files");
    registerMod(oETL, "@lpezet/etl-js/lib/mysqlimports");
    registerMod(oETL, "@lpezet/etl-js/lib/mysqls");
    registerMod(oETL, "@lpezet/etl-js/lib/hpcc-ecls");
    registerMod(oETL, "@lpezet/etl-js/lib/hpcc-sprays");
    registerMod(oETL, "@lpezet/etl-js/lib/hpcc-desprays");
    registerMod(oETL, "@lpezet/etl-js/lib/image-charts");

    // var oETLActivities = pETLActivities;
    /*
          if ( pParameters['activities'] ) {
              var oActivitiesMap = {};
              for (var i in pParameters['activities']) {
                  var oActivity = pParameters['activities'][i];
                  oActivitiesMap[ oActivity ] = true;
              }
              oETLActivities['etl'] = pParameters['activities'];
              LOGGER.warn('Will only run following activities: %s', pParameters['activities']);
          }
          */
    LOGGER.info("Running ETL...");
    return new Promise(function(resolve, reject) {
      oETL.process(pETLTemplate, pParameters).then(
        function(pResults) {
          LOGGER.info("Done running ETL.");
          if (!pParameters["silent"]) console.dir(pResults, { depth: null });
          resolve();
        },
        function(pError) {
          LOGGER.error("Error running ETL.", pError);
          reject(pError);
        }
      );
    });
  }
}
