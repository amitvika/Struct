/* @flow */

import React, { Component } from 'react';
import Track from '../Track';
import HighlightedTrack from '../HighlightedTrack';
import Handle from '../Handle';
import styles from './styles';
import { has, stepValidator, getValueOrAlt } from '../../utils/common';
import { valueValidator, defaultValueValidator } from '../../utils/rangeSlider';

export default class RangeSlider extends Component {
  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    readOnly: false,
    orientation: 'horizontal'
  };

  constructor(props) {
    super(props);
    let start;
    let end;
    if (has(props, 'value')) {
      if (props.value) {
        start = props.value.start;
        end = props.value.end;
      }
    } else if (props.defaultValue) {
      start = props.defaultValue.start;
      end = props.defaultValue.end;
    }
    this.state = {
      start,
      end,
      startHandleSize: 0,
      endHandleSize: 0
    };
  }

  state;

  componentWillReceiveProps(properties) {
    if (has(properties, 'value')) {
      this.setState({
        start: properties.value && properties.value.start,
        end: properties.value && properties.value.end
      });
    }
    if (properties.style !== this.props.style) {
      this.style = {
        ...(this.props.orientation === 'vertical'
          ? styles.wrapperVertical
          : styles.wrapper),
        ...properties.wrapperStyle
      };
    }
  }

  factor;
  trackLeft;
  start;
  end;
  trackOffset;

  _setTrackDimensions = (track) => {
    if (track) {
      const { orientation } = this.props;
      const trackLength =
        orientation === 'vertical' ? track.clientHeight : track.clientWidth;
      this.setState({
        trackLength
      });
      this.trackOffset =
        orientation === 'vertical'
          ? track.offsetParent && track.offsetParent.offsetTop
          : track.offsetParent && track.offsetParent.offsetLeft;
    }
  };

  _setHandleSize = (handle) => {
    if (handle) {
      const { orientation } = this.props;
      const handleSize =
        orientation === 'vertical' ? handle.clientHeight : handle.clientWidth;
      if (!this.state.handleSize) {
        this.setState({
          handleSize
        });
      }
    }
  };

  _startHandleMove = (increase) => {
    const { disabled, readOnly, step, min } = this.props;
    const { start } = this.state;
    if (!disabled && !readOnly) {
      const newStart = this._getStartValue(
        getValueOrAlt(start, min) + increase * step
      );
      if (newStart !== start) {
        this._updateState(newStart, this.state.end);
        this._onChange(newStart, this.state.end);
      }
    }
  };

  _endHandleMove = (increase) => {
    const { disabled, readOnly, step, max } = this.props;
    const { end } = this.state;
    if (!disabled && !readOnly) {
      const newEnd = this._getEndValue(
        getValueOrAlt(end, max) + increase * step
      );
      if (newEnd !== end) {
        this._updateState(this.state.start, newEnd);
        this._onChange(this.state.start, newEnd);
      }
    }
  };

  _onWrapperMouseDown = (event) => {
    const { disabled, readOnly, orientation } = this.props;
    if (!disabled && !readOnly) {
      this._moveHandleToPosition(
        orientation === 'vertical' ? event.pageY : event.pageX
      );
    }
  };

  _onWrapperTouchStart = (event) => {
    const { disabled, readOnly, orientation } = this.props;
    if (!disabled && !readOnly) {
      if (event.touches.length === 1) {
        event.preventDefault();
        this._moveHandleToPosition(
          orientation === 'vertical'
            ? event.touches[0].pageY
            : event.touches[0].pageX
        );
      }
    }
  };

  _moveHandleToPosition = (position) => {
    const { disabled, readOnly, orientation } = this.props;
    if (!disabled && !readOnly) {
      const { start, end, trackLength } = this.state;
      const { min, max } = this.props;
      const startPosition = getValueOrAlt(start, min) * this.factor;
      const endPosition = getValueOrAlt(end, max) * this.factor;
      let mouseDownPosition;
      if (orientation === 'vertical') {
        mouseDownPosition = trackLength - (position - this.trackOffset);
      } else {
        mouseDownPosition = position - this.trackOffset + min * this.factor;
      }
      if (
        Math.abs(mouseDownPosition - startPosition) <
          Math.abs(mouseDownPosition - endPosition) ||
        mouseDownPosition < startPosition
      ) {
        let newStart = this._getStepValue(
          (mouseDownPosition - this.state.handleSize / 2) / this.factor
        );
        newStart = this._getStartValue(newStart);
        //console.log('inhere 1', start, newStart)
        if (start === undefined || newStart !== start) {
          //console.log('inhere')
          this._updateState(newStart, end);
          this._onChange(newStart, end);
          this._afterChange(newStart, end);
        }
      } else {
        let newEnd = this._getStepValue(
          (mouseDownPosition - this.state.handleSize / 2) / this.factor
        );
        newEnd = this._getEndValue(newEnd);
        if (end === undefined || newEnd !== end) {
          this._updateState(start, newEnd);
          this._onChange(start, newEnd);
          this._afterChange(start, newEnd);
        }
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

  _getStartValue(start) {
    let startValue = start;
    if (startValue < this.props.min) {
      startValue = this.props.min;
    } else if (startValue > getValueOrAlt(this.state.end, this.props.max)) {
      startValue = getValueOrAlt(this.state.end, this.props.max);
    }
    return startValue;
  }

  _getEndValue(end) {
    let endValue = end;
    if (endValue > this.props.max) {
      endValue = this.props.max;
    } else if (endValue < getValueOrAlt(this.state.start, this.props.min)) {
      endValue = getValueOrAlt(this.state.start, this.props.min);
    }
    return endValue;
  }

  _updateState = (start, end) => {
    if (!has(this.props, 'value')) {
      this.setState({
        start,
        end
      });
    }
  };

  _onChange = (start, end) => {
    if (this.props.onChange) {
      this.props.onChange({
        start,
        end
      });
    }
  };

  _afterChange = (start, end) => {
    if (this.props.afterChange) {
      this.props.afterChange({
        start: getValueOrAlt(start, this.state.start),
        end: getValueOrAlt(end, this.state.end)
      });
    }
  };

  style = {
    ...(this.props.orientation === 'vertical'
      ? styles.wrapperVertical
      : styles.wrapper),
    ...this.props.wrapperStyle
  };

  render() {
    let startValue = 0;
    let endValue = 0;
    let percentageFactor = 1;
    this.factor = 1;
    const { handleSize, trackLength, start, end } = this.state;
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
      highlightedTrackStyle,
      disabledHighlightedTrackStyle,
      handleStyle,
      focusedHandleStyle,
      hoveredHandleStyle,
      activeHandleStyle,
      disabledHandleStyle,
      wrapperClassName,
      trackClassName,
      disabledTrackClassName,
      highlightedTrackClassName,
      disabledHighlightedTrackClassName,
      handleClassName,
      disabledHandleClassName
    } = this.props;
    this.start = getValueOrAlt(start, min);
    this.end = getValueOrAlt(end, max);
    if (trackLength && handleSize) {
      const calculatedTrackWidth = trackLength - handleSize;
      this.factor = calculatedTrackWidth / (max - min);
      if (this.start < min || this.end < min) {
        startValue = min;
      } else if (this.start > Math.min(this.end, max)) {
        startValue = Math.min(this.end, max);
      } else {
        startValue = this.start;
      }
      startValue = (startValue - min) * getValueOrAlt(this.factor, 1);
      if (this.end > max || this.start > max) {
        endValue = max;
      } else if (this.end < Math.max(start, min)) {
        endValue = Math.max(start, min);
      } else {
        endValue = this.end;
      }
      endValue = (endValue - min) * getValueOrAlt(this.factor, 1);
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
        aria-valuetext={`${start} - ${end}`}
        aria-orientation={orientation}
        aria-disabled={disabled}
        aria-readonly={readOnly}
      >
        <Track
          style={trackStyle}
          disabledStyle={disabledTrackStyle}
          disabled={disabled}
          orientation={orientation}
          trackRef={this._setTrackDimensions}
          className={trackClassName}
          disabledClassName={disabledTrackClassName}
        />
        <HighlightedTrack
          disabled={disabled}
          orientation={orientation}
          style={highlightedTrackStyle}
          disabledStyle={disabledHighlightedTrackStyle}
          className={highlightedTrackClassName}
          offset={`${startValue * percentageFactor}%`}
          length={`${(endValue - startValue) * percentageFactor}%`}
          className={highlightedTrackClassName}
          disabledClassName={disabledHighlightedTrackClassName}
        />
        <Handle
          disabled={disabled}
          readOnly={readOnly}
          offset={`${startValue * percentageFactor}%`}
          tabIndex={disabled ? undefined : tabIndex || 0}
          handleRef={this._setHandleSize}
          handleMove={this._startHandleMove}
          afterChange={this._afterChange}
          factor={this.factor}
          step={step}
          style={handleStyle}
          orientation={orientation}
          focusStyle={focusedHandleStyle}
          hoverStyle={hoveredHandleStyle}
          activeStyle={activeHandleStyle}
          disabledStyle={disabledHandleStyle}
          className={handleClassName}
          disabledClassName={disabledHandleClassName}
        />
        <Handle
          disabled={disabled}
          readOnly={readOnly}
          offset={`${endValue * percentageFactor}%`}
          tabIndex={disabled ? undefined : tabIndex || 0}
          handleRef={this._setHandleSize}
          handleMove={this._endHandleMove}
          afterChange={this._afterChange}
          factor={this.factor}
          step={step}
          style={handleStyle}
          orientation={orientation}
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
