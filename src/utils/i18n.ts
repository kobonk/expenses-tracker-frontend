import * as data from "config.json";

const language = (data as any).language;
const i18n = require(`./../resources/i18n/${ language }.json`);

export default i18n
