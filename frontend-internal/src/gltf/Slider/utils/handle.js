/* flow */

import { canUseDOM } from 'exenv';

let styleElement;

export function injectStyle() {
  if (canUseDOM && !styleElement) {
    styleElement = document.createElement('style');
    styleElement.setAttribute('id', 'reactrangesliderid');
    document.body.appendChild(styleElement);
    styleElement.innerHTML = '.handle:focus { outline: none !important;}';
  }
}

export function removeStyle() {
  if (canUseDOM && styleElement) {
    document.body.getElementById('reactrangesliderid');
  }
}

export function calculateStyle(styles, state, props) {
  const { hovered, focused, active } = state;
  const { offset, style, hoverStyle, focusStyle, activeStyle, disabledStyle, disabled } = props;
  let calcHoverStyle;
  let calcFocusStyle;
  let calcActiveStyle;
  let calcDisabledStyle;
  if (disabled) {
    calcDisabledStyle = { ...styles.disabledHandle, ...disabledStyle };
  } else {
    if (hovered) {
      calcHoverStyle = { ...styles.hoveredHandle, ...hoverStyle };
    }
    if (focused) {
      calcFocusStyle = { ...styles.focusedHandle, ...focusStyle };
    }
    if (active) {
      calcActiveStyle = { ...styles.activeHandle, ...activeStyle };
    }
  }
  return {
    ...(props.orientation === 'vertical' ? styles.handleVertical : styles.handle),
    ...style,
    ...{
      [`${props.orientation === 'vertical' ? 'bottom' : 'left'}`]: offset,
    },
    ...calcDisabledStyle,
    ...calcHoverStyle,
    ...calcFocusStyle,
    ...calcActiveStyle,
  };
}

export function getMousePosition(obj, orientation) {
  return orientation === 'vertical' ? obj.pageY : obj.pageX;
}
