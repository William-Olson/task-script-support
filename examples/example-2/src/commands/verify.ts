import CheckEnv from "../tasks/check-env";
import PrintBanner from "../tasks/print-banner";
import command from "./command";

export default command.fromTasks([
  // list of Tasks to run
  PrintBanner,
  CheckEnv,
]);
