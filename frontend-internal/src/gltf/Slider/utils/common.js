/* @flow */

export function has(obj, key) {
  return obj !== undefined && obj !== null && Object.prototype.hasOwnProperty.call(obj, key);
}

export function stepValidator( // eslint-disable-line consistent-return
  props,
  propName,
  componentName
) {
  if (has(props, propName)) {
    if (isNaN(props.step) || props.step <= 0) {
      return new Error(
        `${componentName}: Step should be provided a positive numeric value.`
      );
    }
  }
}

export function getValueOrAlt(value, altValue) {
  if (value !== undefined && value !== null) {
    return value;
  }
  return altValue?altValue:0;
}

export function isDefined(value) {
  return value !== undefined && value !== null;
}

export function notSimilar(obj1, obj2, keys) {
  if (obj1 && obj2) {
    const differences = keys && keys.filter((k) => obj1[k] !== obj2[k]);
    return differences && differences.length > 0;
  }
  return undefined;
}
