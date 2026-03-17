import { singleton } from "tsyringe";
import pkgJson from "../../package.json";

@singleton()
export class UtilService {
  static titleize = (s: string) =>
    s ? `${s[0]?.toUpperCase()}${s.slice(1, s.length)}` : s;
  titleize = (s: string) => UtilService.titleize(s);

  static getAppName = () => pkgJson.name;
  getAppName = () => pkgJson.name;

  static getAppVersion = () => pkgJson.version;
  getAppVersion = () => pkgJson.version;
}
