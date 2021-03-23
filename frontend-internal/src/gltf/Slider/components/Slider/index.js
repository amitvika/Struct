/* @flow */

import React, { Component } from 'react';
import Track from '../Track';
import Handle from '../Handle';
import styles from './styles';
import {
  has,
  stepValidator,
  getValueOrAlt,
} from '../../utils/common';
import {
  valueValidator,
  defaultValueValidator,
} from '../../utils/slider';

export default class Slider extends Component {

  

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    readOnly: false,
    orientation: 'horizontal',
  };

  constructor(props) {
    super(props);
    let value;
    if (has(props, 'value')) {
      value = this.props.value;
    } else if (props.defaultValue) {
      value = props.defaultValue;
    }
    this.state = {
      value,
    };
  }

  state;

  componentWillReceiveProps(properties) {
    if (has(properties, 'value')) {
      this.setState({
        value: properties.value,
      });
    }
    if (properties.style !== this.props.style) {
      this.style = {
        ...(this.props.orientation === 'vertical' ? styles.wrapperVertical : styles.wrapper),
        ...properties.wrapperStyle,
      };
    }
  }

  factor;
  trackOffset;
  value;

  _setTrackDimensions = (track) => {
    if (track) {
      const { orientation } = this.props;
      const trackLength = orientation === 'vertical' ? track.clientHeight : track.clientWidth;
      this.setState({
        trackLength,
      });
      this.trackOffset = orientation === 'vertical' ?
        track.offsetParent && track.offsetParent.offsetTop :
        track.offsetParent && track.offsetParent.offsetLeft;
    }
  };

  _setHandleSize = (handle) => {
    if (handle) {
      const { orientation } = this.props;
      const hendleSize = orientation === 'vertical' ?
        handle.clientHeight :
        handle.clientWidth;
      if (!this.state.hendleSize) {
        this.setState({
          hendleSize,
        });
      }
    }
  };

  _handleMove = (increase) => {
    const { disabled, readOnly, step, min } = this.props;
    const { value } = this.state;
    if (!disabled && !readOnly) {
      const newValue = this._getValue(getValueOrAlt(value, min) + increase * step);
      if (newValue !== value) {
        this._updateState(newValue);
        //console.log("1",newValue,value)
        this._onChange(newValue);
      }
    }
  };

  _onWrapperMouseDown = (event) => {
    const { disabled, readOnly, orientation } = this.props;
    if (!disabled && !readOnly) {
      this._moveHandleToPosition(orientation === 'vertical' ? event.pageY : event.pageX);
    }
  };

  _onWrapperTouchStart = (event) => {
    const { disabled, readOnly, orientation } = this.props;
    if (!disabled && !readOnly) {
      if (event.touches.length === 1) {
        event.preventDefault();
        this._moveHandleToPosition(
          orientation === 'vertical' ?
          event.touches[0].pageY :
          event.touches[0].pageX
        );
      }
    }
  };

  _moveHandleToPosition = (position) => {
    const { disabled, readOnly, orientation } = this.props;
    if (!disabled && !readOnly) {
      const { value, trackLength } = this.state;
      const { min } = this.props;
      let mouseDownPosition;
      if (orientation === 'vertical') {
        mouseDownPosition = trackLength - (position - this.trackOffset);
      } else {
        mouseDownPosition = position - this.trackOffset + (min * this.factor);
      }
      let newValue = this._getStepValue(
        (mouseDownPosition - this.state.hendleSize / 2) / this.factor);
      newValue = this._getValue(newValue);
      if (newValue !== getValueOrAlt(value, min)) {
        this._updateState(newValue);
        //console.log("2", value, newValue)
        this._onChange(newValue);
        this._afterChange(newValue);
      }
    }
  };

  _getStepValue = (position) => {
    const { step } = this.props;
    const remainder = position % step;
    if (remainder < step / 2) {
      return position - remainder;
    }
    return position - remainder + step;
  };

  _getValue = (value) => {
    let newValue = value;
    if (newValue < this.props.min) {
      newValue = this.props.min;
    } else if (newValue > this.props.max) {
      newValue = this.props.max;
    }
    return newValue;
  }

  _updateState = (value) => {
    if (!has(this.props, 'value')) {
      this.setState({
        value,
      });
    }
  };

  _onChange = (value) => {
    if (this.props.onChange) {
      //console.log("ok",value);
      this.props.onChange(value);
    } else {
      //console.log("Not",value);
    }
  };

  _afterChange = (value) => {
    if (this.props.afterChange) {
      myvalue = getValueOrAlt(value, this.state.value);
      if(myvalue) {
        this.props.afterChange(myvalue);
      }
    }
  };

  style = {
    ...(this.props.orientation === 'vertical' ? styles.wrapperVertical : styles.wrapper),
    ...this.props.wrapperStyle,
  };

  render() {
    let position = 0;
    let percentageFactor = 1;
    this.factor = 1;
    const {
      hendleSize,
      trackLength,
      value,
    } = this.state;
    const {
      id,
      min,
      max,
      step,
      name,
      tabIndex,
      disabled,
      readOnly,
      trackStyle,
      orientation,
      disabledTrackStyle,
      handleStyle,
      focusedHandleStyle,
      hoveredHandleStyle,
      activeHandleStyle,
      disabledHandleStyle,
      wrapperClassName,
      trackClassName,
      disabledTrackClassName,
      handleClassName,
      disabledHandleClassName,
    } = this.props;
    this.value = getValueOrAlt(value, min);
    if (trackLength && hendleSize) {
      const calculatedTrackLength = trackLength - hendleSize;
      this.factor = calculatedTrackLength / (max - min);
      if (this.value < min) {
        position = min;
      } else if (this.value > max) {
        position = max;
      } else {
        position = this.value;
      }
      position = (position - min) * getValueOrAlt(this.factor, 1);
      percentageFactor = 100 / trackLength;
    }
    return (
      <div
        id={id}
        name={name}
        style={this.style}
        className={wrapperClassName}
        onClick={this._onWrapperMouseDown}
        onTouchStart={this._onWrapperTouchStart}
        role="slider"
        aria-labelledby={this.props['aria-labelledby']}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={value}
        aria-orientation={orientation}
        aria-disabled={disabled}
        aria-readonly={readOnly}
      >
        <Track
          disabled={disabled}
          trackRef={this._setTrackDimensions}
          style={trackStyle}
          orientation={orientation}
          disabledStyle={disabledTrackStyle}
          className={trackClassName}
          disabledClassName={disabledTrackClassName}
        />
        <Handle
          disabled={disabled}
          offset={`${position * percentageFactor}%`}
          tabIndex={disabled ? undefined : tabIndex || 0}
          handleRef={this._setHandleSize}
          handleMove={this._handleMove}
          afterChange={this._afterChange}
          factor={this.factor}
          step={step}
          orientation={orientation}
          style={handleStyle}
          focusStyle={focusedHandleStyle}
          hoverStyle={hoveredHandleStyle}
          activeStyle={activeHandleStyle}
          disabledStyle={disabledHandleStyle}
          className={handleClassName}
          disabledClassName={disabledHandleClassName}
        />
      </div>
    );
  }
}
