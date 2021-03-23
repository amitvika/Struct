/* @flow */

import React, { PropTypes, Component } from 'react';
import styles from './styles';

export default class Track extends Component {

  

  componentWillReceiveProps(properties)  {
    if (properties.style !== this.props.style) {
      this.style = {
        ...(this.props.orientation === 'vertical' ? styles.trackVertical : styles.track),
        ...properties.style,
        ...(properties.disabled ?
          { ...styles.disabledTrack, ...properties.disabledStyle }
           : {}),
      };
    }
  }

  style = {
    ...(this.props.orientation === 'vertical' ? styles.trackVertical : styles.track),
    ...this.props.style,
    ...(this.props.disabled ?
      { ...styles.disabledTrack, ...this.props.disabledStyle }
       : {}),
  };

  render()  {
    const { className, trackRef, disabledClassName, disabled } = this.props;
    return (
      <div
        ref={trackRef}
        style={this.style}
        disabled={disabled}
        className={(disabled && disabledClassName) ? disabledClassName : className}
      />
    );
  }
}
