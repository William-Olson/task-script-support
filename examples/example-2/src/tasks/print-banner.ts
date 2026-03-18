import { autoInjectable } from "tsyringe";
import { Ex2AppState, Ex2AppStateData } from "../types/state";
import { Task } from "task-script-support";
import { BannerService } from "../services/banner-service";
import { UtilService } from "../services/util-service";
import chalk from "chalk";
import { CLIArg } from "../types/commander-args";
import { ArgService } from "../services/arg-service";

@autoInjectable()
export default class PrintBanner extends Task<Ex2AppStateData, CLIArg[]> {
  constructor(
    private bannnerSvc: BannerService,
    private utilSvc: UtilService,
    private argService: ArgService,
  ) {
    super();
  }

  async run(): Promise<Partial<Ex2AppState> | void> {
    let font = "";

    try {
      if (this.argService.hasFlag("randomFont")) {
        font = await this.bannnerSvc.getRandomFont();
        console.log(`Using random font ${font}`);
      }

      // test user input arg: allow user provided banner font
      if (this.argService.hasFlag("bannerFont")) {
        const fontInput = this.argService.getOption<string>("bannerFont");
        await this.validateFont(fontInput);
        font = fontInput;
      }

      console.log(
        chalk.blueBright(
          await this.bannnerSvc.toBanner(this.utilSvc.getAppName(), font),
        ),
      );

      // return updated state
      return {
        data: {
          banner: {
            status: "success",
            font: font || this.bannnerSvc.defaultFontFamily,
          },
        },
      } as const;
    } catch (err) {
      return {
        data: { banner: { status: "failed" }, errorMessages: [`${err}`] },
      };
    }
  }

  /*
    Helper for ensuring font is supported if provided as input
  */
  async validateFont(fontName: string) {
    const availableFonts = await this.bannnerSvc.getSupportedFonts();
    if (!availableFonts.includes(fontName)) {
      throw new Error(`Unsupported font provided: ${chalk.red(fontName)}`);
    }
  }
}
