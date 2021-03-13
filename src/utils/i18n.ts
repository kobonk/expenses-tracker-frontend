import config from "config.json";

const language = (config as any).language;
const i18n = require(`./../resources/i18n/${language}.json`);

const translateNumericValue = (text: string, amount: number) => {
  const reg = new RegExp("^{one}([^{]*){few}([^{]*){else}(.*$)", "gmi");
  const patterns = reg.exec(text).slice(1);

  if (amount === 1) {
    return `${amount} ${patterns[0]}`;
  }

  if (amount === 2 || amount === 3) {
    return `${amount} ${patterns[1]}`;
  }

  return `${amount} ${patterns[2]}`;
};

export default Object.assign(translateNumericValue, i18n);
