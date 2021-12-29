/* @flow */

import { has } from './common';

export function defaultValueValidator(props, propName, componentName) { // eslint-disable-line consistent-return
  if (has(props, propName)) {
    const value = props[propName];
    if (
      value &&
      (isNaN(value) ||
        value < props.min ||
        value > Math.min(props.max, value.end))
    ) {
      return new Error(
        `${componentName}: The property value provided to the component is
        not correct, check value.start.`
      );
    }
  }
}

export function valueValidator(props, propName, componentName) {
  if (has(props, propName)) {
    if (!has(props, 'onChange') && !has(props, 'afterChange')) {
      return new Error(
        `${componentName}: If you do not provide onChange/afterChange method to controlled
        component it will result in readOnly component.`
      );
    }
  }
  return defaultValueValidator(props, propName, componentName);
}
