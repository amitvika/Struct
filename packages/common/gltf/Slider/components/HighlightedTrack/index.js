/* @flow */

import React, { Component } from 'react';
import { notSimilar } from '../../utils/common';
import styles from './styles';

export default class HighlightedTrack extends Component {
  componentWillReceiveProps(properties) {
    if (notSimilar(properties, this.props, ['offset', 'style', 'length'])) {
      const { orientation, offset, length, style } = properties;
      this.style = {
        ...(orientation === 'vertical'
          ? styles.highlightedTrackVertical
          : styles.highlightedTrack),
        ...style,
        ...{
          [`${orientation === 'vertical' ? 'bottom' : 'left'}`]: offset,
          [`${orientation === 'vertical' ? 'height' : 'width'}`]: length
        },
        ...(this.props.disabled
          ? { ...styles.disabledHighlightedTrack, ...this.props.disabledStyle }
          : {})
      };
    }
  }

  style = {
    ...(this.props.orientation === 'vertical'
      ? styles.highlightedTrackVertical
      : styles.highlightedTrack),
    ...this.props.style,
    ...{
      [`${this.props.orientation === 'vertical' ? 'bottom' : 'left'}`]:
        this.props.offset,
      [`${this.props.orientation === 'vertical' ? 'height' : 'width'}`]:
        this.props.length
    },
    ...(this.props.disabled
      ? { ...styles.disabledHighlightedTrack, ...this.props.disabledStyle }
      : {})
  };

  render() {
    const { className, disabledClassName, disabled } = this.props;
    return (
      <div
        style={this.style}
        disabled={disabled}
        className={
          disabled && disabledClassName ? disabledClassName : className
        }
      ></div>
    );
  }
}
