#!/usr/bin/env node

import * as Fs from "fs";
import { yamlParse } from "yaml-cfn";
import * as path from "path";
import Main from "../lib/main";
import CLI from "../lib/cli";
import * as _ from "lodash";

import { configureLogger, loggerShutdown } from "@lpezet/etl-js";

const args = process.argv.slice(2);

const logFilename = path.join(path.resolve("./"), "etl-js.log");
// const logFilename = path.join(path.resolve(__dirname, "../../"), "etl-js.log");
// const logFilename = path.join("/var/log/", "/cue-me-in.log");

const debugging = _.includes(args, "--debug");
const logLevel = process.env.DEBUG || debugging ? "debug" : "info";

configureLogger({
  appenders: {
    file: {
      type: "file",
      filename: logFilename,
      maxLogSize: 20971520,
      backups: 3,
      layout: {
        type: "pattern",
        pattern: "%d %5.5p %25.25c - %m"
      }
    },
    console: { type: "console", layout: { type: "messagePassThrough" } }
  },
  categories: { default: { appenders: ["file", "console"], level: logLevel } }
});

const oSettingsFile = path.resolve(process.cwd(), "settings.yml");
let oSettings = {};
if (Fs.existsSync(oSettingsFile)) {
  oSettings = yamlParse(Fs.readFileSync(oSettingsFile, { encoding: "utf8" }));
}

const oCLI = new CLI(new Main());
oCLI.init(oSettings);
oCLI
  .run(process.argv)
  .then(() => {
    console.log("Done!!!");
    loggerShutdown(() => {
      process.exit(0);
    });
  })
  .catch(() => {
    loggerShutdown(() => {
      process.exit(1);
    });
  });
