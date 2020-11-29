import CLI from "../lib/cli";
import { assert } from "chai";
import * as path from "path";
import { IMain } from "../lib/main";

describe("cli", function() {
  beforeEach(function(done: Function) {
    done();
  });

  afterEach(function(done: Function) {
    done();
  });

  it("init", function(done) {
    let oInitCalled = false;
    class MainClass implements IMain {
      mInitCalled: boolean;
      constructor() {
        this.mInitCalled = false;
      }
      init(_pParameters: any): Promise<any> {
        oInitCalled = true;
        return Promise.resolve();
      }
      run(
        _pSettings: any,
        _pETLTemplate: any,
        _pParameters: any
      ): Promise<any> {
        return Promise.resolve();
      }
    }
    const oTested = new CLI(new MainClass());
    oTested.init({});
    oTested.run(["/usr/local/bin/node", "etl-js", "init"]).then(
      function() {
        try {
          assert.isTrue(oInitCalled);
          done();
        } catch (e) {
          done(e);
        }
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("initRejected", function(done) {
    class MainClass implements IMain {
      init(): Promise<any> {
        return Promise.reject(new Error("Test error"));
      }
      run(): Promise<any> {
        return Promise.resolve();
      }
    }
    const oTested = new CLI(new MainClass());
    oTested.init({});
    oTested.run(["/usr/local/bin/node", "etl-js", "init"]).then(
      function() {
        done("Exepected error");
      },
      function() {
        done();
      }
    );
  });

  it("initWithError", function(done) {
    class MainClass implements IMain {
      init(): Promise<any> {
        throw new Error("Test error");
      }
      run(): Promise<any> {
        return Promise.resolve();
      }
    }
    const oTested = new CLI(new MainClass());
    oTested.init({});
    oTested.run(["/usr/local/bin/node", "etl-js", "init"]).then(
      function() {
        done("Exepected error");
      },
      function() {
        done();
      }
    );
  });

  it("run", function(done) {
    let oRunCalled = false;
    class MainClass implements IMain {
      run(): Promise<any> {
        oRunCalled = true;
        return Promise.resolve();
      }
      init(): Promise<any> {
        return Promise.resolve();
      }
    }
    const oETLFile = path.resolve(__dirname, "sample_etl.yml");
    const oTested = new CLI(new MainClass());
    oTested.init({});
    oTested.run(["/usr/local/bin/node", "etl-js", "run", oETLFile]).then(
      function() {
        try {
          assert.isTrue(oRunCalled);
          done();
        } catch (e) {
          done(e);
        }
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("runRejected", function(done) {
    class MainClass implements IMain {
      run(): Promise<any> {
        return Promise.reject(new Error("Test error"));
      }
      init(): Promise<any> {
        return Promise.resolve();
      }
    }
    const oETLFile = path.resolve(__dirname, "sample_etl.yml");
    const oTested = new CLI(new MainClass());
    oTested.init({});
    oTested.run(["/usr/local/bin/node", "etl-js", "run", oETLFile]).then(
      function() {
        done("Expected error.");
      },
      function() {
        done();
      }
    );
  });

  it("runWithError", function(done) {
    class MainClass implements IMain {
      run(): Promise<any> {
        throw new Error("Test error");
      }
      init(): Promise<any> {
        return Promise.resolve();
      }
    }
    const oETLFile = path.resolve(__dirname, "sample_etl.yml");
    const oTested = new CLI(new MainClass());
    oTested.init({});
    oTested.run(["/usr/local/bin/node", "etl-js", "run", oETLFile]).then(
      function() {
        done("Expected error.");
      },
      function() {
        done();
      }
    );
  });

  it("runETLSet", function(done) {
    let oRunCalled = false;
    class MainClass implements IMain {
      run(): Promise<any> {
        oRunCalled = true;
        return Promise.resolve();
      }
      init(): Promise<any> {
        return Promise.resolve();
      }
    }
    const oETLFile = path.resolve(__dirname, "sample_etl.yml");
    const oTested = new CLI(new MainClass());
    oTested.init({});
    oTested
      .run(["/usr/local/bin/node", "etl-js", "run", oETLFile, "mySet"])
      .then(
        function() {
          try {
            assert.isTrue(oRunCalled);
            done();
          } catch (e) {
            done(e);
          }
        },
        function(pError: Error) {
          done(pError);
        }
      );
  });

  it("runSilent", function(done) {
    let oRunCalled = false;
    class MainClass implements IMain {
      run(): Promise<any> {
        oRunCalled = true;
        return Promise.resolve();
      }
      init(): Promise<any> {
        return Promise.resolve();
      }
    }
    const oETLFile = path.resolve(__dirname, "sample_etl.yml");
    const oTested = new CLI(new MainClass());
    oTested.init({});
    oTested.run(["/usr/local/bin/node", "etl-js", "-s", "run", oETLFile]).then(
      function() {
        try {
          assert.isTrue(oRunCalled);
          done();
        } catch (e) {
          done(e);
        }
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });
});
