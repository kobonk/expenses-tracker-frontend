import i18n from 'utils/i18n';
import { utc } from 'moment';

const _ = require('lodash');

export const convertDateToString: Function = (date: Date): string => {
  let dateParts: Array<string> = [
    date.getFullYear() + '',
    date.getMonth() + 1 + '',
    date.getDate() + '',
  ];

  return dateParts
    .map((part) => (part.length < 2 ? '0' + part : part))
    .join('-');
};

export const extractMonthName: Function = (date: string): string => {
  let [year, month] = date.split('-');

  return `${i18n.monthNames[parseInt(month) - 1]} ${year}`;
};

export const formatNumber: Function = (
  numericValue: number,
  decimalPlaces: number = 2
): string => {
  let fixed = numericValue.toFixed(decimalPlaces);
  let integerPart = _.first(fixed.match(/^\d*/));
  let decimalPart = _.first(fixed.match(/\D.*$/));
  let digitChunks = _.reverse(
    _.map(_.chunk(_.reverse(integerPart.split('')), 3), _.reverse)
  );
  let numericChunks = _.map(digitChunks, (chunk: Array<string>) =>
    chunk.join('')
  );

  return _.join(numericChunks, ' ') + decimalPart;
};

export const getDaysOfMonth: Function = (month: String): Array<String> => {
  let firstDay = utc(`${month}-01`);
  let daysInMonth = firstDay.daysInMonth();

  return _.map(Array.from(Array(daysInMonth).keys()), (day: number) => {
    return firstDay
      .clone()
      .add(day, 'd')
      .format('YYYY-MM-DD');
  });
};

export const stringToFloat: Function = (numberAsString: string): number => {
  return parseFloat(numberAsString.replace(/\s/g, ''));
};
