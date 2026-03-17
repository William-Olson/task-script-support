import { singleton } from "tsyringe";
import figlet from "figlet";

@singleton()
export class BannerService {
  _selectFonts = [
    "AMC Slash",
    "Calvin S",
    "Bell",
    "Pagga",
    "Shadow",
    "Small Block",
  ];
  defaultFontFamily: string = "Cybermedium";

  async toBanner(text: string, font?: string): Promise<string> {
    return await figlet.text(text, {
      font: font || this.defaultFontFamily,
    });
  }

  async getSupportedFonts(): Promise<string[]> {
    return await new Promise((res, rej) => {
      figlet.fonts((err, fonts) =>
        err ? rej(err) : res(fonts || ([] as string[])),
      );
    });
  }

  async getRandomFont(): Promise<string> {
    const randomIndexBetween = (start = 0, end = 0) =>
      Math.floor(Math.random() * (end - start + 1)) + start;

    const bannerFonts: string[] = await this.getSupportedFonts();
    const randomFontIndex = randomIndexBetween(0, bannerFonts.length - 1);
    return bannerFonts[randomFontIndex] || this.defaultFontFamily;
  }
}
