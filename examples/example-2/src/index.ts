import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

import commander from "commander";
import verify from "./commands/verify";
import { UtilService } from "./services/util-service";

const { program } = commander;
const name = UtilService.getAppName();
const version = UtilService.getAppVersion();

program
  .version(`${name} version: ${version}`, "-v, --version")
  .description(`${UtilService.titleize(name)} CLI Client`);

program
  .command("verify")
  .action(verify)
  .option("-d, --debug", "enable extra logging")
  .option("--rf, --random-font", "use a random font for app banner")
  .option("--bf, --banner-font <font>", "provide a font for the app banner")
  .option("-e, --env", "validate environment");

program.parse(process.argv);
