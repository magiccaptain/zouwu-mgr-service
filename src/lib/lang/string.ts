import { snakeCase, toUpper } from 'lodash';

export const toUpperSnakeCase = (str: string) =>
  toUpper(snakeCase(str)).replace(/([A-Z])_([0-9])/g, '$1$2');
