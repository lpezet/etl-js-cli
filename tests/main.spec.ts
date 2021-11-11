import * as Fs from "fs";
import * as path from "path";
import Main from "../lib/main";
import { assert } from "chai";

describe("main", function() {
  const SETTINGS_FILE = path.resolve(process.cwd(), "settings.yml");
  const ETL_FILE = path.resolve(process.cwd(), "etl.yml");

  beforeEach(function(done: Function) {
    done();
  });

  afterEach(function(done: Function) {
    if (Fs.existsSync(SETTINGS_FILE)) Fs.unlinkSync(SETTINGS_FILE);
    if (Fs.existsSync(ETL_FILE)) Fs.unlinkSync(ETL_FILE);
    // if ( Fs.existsSync( 'test-etl-js.log' ) ) Fs.unlinkSync( 'test-etl-js.log' );
    done();
  });

  it("initFilesAlreadyExist", function(done) {
    const oTested = new Main();
    oTested.init({}).then(
      function() {
        oTested.init({}).then(
          function() {
            done("Expected error (file already exists");
          },
          function() {
            // good
            done();
          }
        );
      },
      function(pError) {
        done(pError);
      }
    );
  });

  it("initFilesAlreadyExistForce", function(done) {
    const oTested = new Main();
    oTested.init({}).then(
      function() {
        oTested.init({ force: true }).then(
          function() {
            done();
          },
          function(pError) {
            done(pError);
          }
        );
      },
      function(pError) {
        done(pError);
      }
    );
  });

  it("init", function(done) {
    const oTested = new Main();
    oTested.init({}).then(
      function() {
        try {
          assert.isTrue(Fs.existsSync(SETTINGS_FILE));
          assert.isTrue(Fs.existsSync(ETL_FILE));
          done();
        } catch (e) {
          done(e);
        }
      },
      function(pError) {
        done(pError);
      }
    );
  });

  it("runLocal", function(done) {
    const oSettings = {
      etl: { executor: "local1" },
      executors: { local1: { type: "local" } }
    };
    const oETLActivities = { etlSets: {} };
    const oParameters = {};
    const oTested = new Main();
    oTested.init({}).then(
      function() {
        oTested.run(oSettings, oETLActivities, oParameters).then(
          function() {
            done();
          },
          function(pError: Error) {
            done(pError);
          }
        );
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("runLocalSilent", function(done) {
    const oSettings = {
      etl: { executor: "local1" },
      executors: { local1: { type: "local" } }
    };
    const oETLActivities = { etlSets: {} };
    const oParameters = { silent: true };
    const oTested = new Main();
    oTested.init({}).then(
      function() {
        oTested.run(oSettings, oETLActivities, oParameters).then(
          function() {
            done();
          },
          function(pError: Error) {
            done(pError);
          }
        );
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("runRemote", function(done) {
    const oSettings = {
      etl: { executor: "remote1" },
      executors: { remote1: { type: "remote" } }
    };
    const oETLActivities = { etlSets: {} };
    const oParameters = {};
    const oTested = new Main();
    oTested.init({}).then(
      function() {
        oTested.run(oSettings, oETLActivities, oParameters).then(
          function() {
            done();
          },
          function(pError) {
            done(pError);
          }
        );
      },
      function(pError) {
        done(pError);
      }
    );
  });

  it("runUnknowExecutorType", function(done) {
    const oSettings = {
      etl: { executor: "unknown1" },
      executors: { unknown1: { type: "unknown" } }
    };
    const oETLActivities = { etlSets: {} };
    const oParameters = {};
    const oTested = new Main();
    oTested.init({}).then(
      function() {
        oTested.run(oSettings, oETLActivities, oParameters).then(
          function() {
            done("Expected error.");
          },
          function() {
            done();
          }
        );
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("invalidSettings", function(done) {
    const oInvalidSettings = {};
    const oETLActivities = { etlSets: {} };
    const oParameters = {};
    const oTested = new Main();
    oTested.run(oInvalidSettings, oETLActivities, oParameters).then(
      function() {
        done("Expected error.");
      },
      function() {
        done();
      }
    );
  });

  it("invalidSettingsMissingExecutor", function(done) {
    const oInvalidSettings = { executors: {}, etl: { executor: "missing" } };
    const oETLActivities = { etlSets: {} };
    const oParameters = {};
    const oTested = new Main();
    oTested.run(oInvalidSettings, oETLActivities, oParameters).then(
      function() {
        done("Expected error.");
      },
      function() {
        done();
      }
    );
  });

  it("handleErrorReject", function(done) {
    let rejected = false;
    const oTested = new Main();
    oTested._handleError(new Error("Error for testing purposes."), _err => {
      rejected = true;
    });
    if (rejected) {
      done();
    } else {
      done(new Error("Must call function when passing it to _handleError()."));
    }
  });

  it("handleError", function() {
    const oTested = new Main();
    oTested._handleError(new Error("Error for testing purposes."));
  });
});
