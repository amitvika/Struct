import React, { Component } from 'react';
import {  calculateStyle, getMousePosition } from '../../utils/handle';
import { notSimilar } from '../../utils/common';
import styles from './styles';

export default class Handle extends Component {

  

  state = {
    hovered: false,
    focused: false,
    active: false,
  };

  componentWillMount() {
    // injectStyle();
  }

  componentDidMount() {
    document.addEventListener('mousemove', this._onDocumentMouseMove);
    document.addEventListener('mouseup', this._onDocumentMouseUp);
  }

  componentWillReceiveProps(properties) {
    if (notSimilar(
      properties,
      this.props,
      ['offset', 'style', 'hoverStyle', 'focusStyle', 'activeStyle']
    )) {
      this.style = calculateStyle(styles, this.state, properties);
    }
  }

  componentWillUnmount() {
    // removeStyle();
  }

  _onMouseEnter  = () => {
    if (!this.props.disabled) {
      this.style = calculateStyle(styles, { ...this.state, ...{ hovered: true } }, this.props);
      this.setState({
        hovered: true,
      });
    }
   
  };

  _onMouseLeave = () => {
    if (!this.props.disabled) {
      this.style = calculateStyle(styles, { ...this.state, ...{ hovered: false } }, this.props);
      this.setState({
        hovered: false,
      });
    }
    
  };

  _onMouseDown = (event) => {
    const { disabled, readOnly, orientation } = this.props;
   
    if (!disabled && !readOnly) {
      this._moveStart(event, getMousePosition(event, orientation));
    }
  };

  _onDocumentMouseMove = (event) => {
    const { disabled, readOnly, orientation } = this.props;
    
    if (!disabled && !readOnly && (this.state.active || this.state.activeCount === 0)) {
      this._move(event, getMousePosition(event, orientation));
    }
    this.setState({
      activeCount: 1,
    });
  };

  _onDocumentMouseUp = (event) => {
    const { disabled, readOnly } = this.props;
    if (!disabled && !readOnly && this.state.active) {
      this._move(event, getMousePosition(event, this.props.orientation));
      this._moveEnd(event);
    }
  };

  _onContextMenu= () => {
    this.style = calculateStyle(styles, { ...this.state, ...{ active: false } }, this.props);
    this.setState({
      active: false,
    });
  };

  _onTouchStart = (event) => {
    const { disabled, readOnly, orientation } = this.props;
    if (!disabled && !readOnly && event.touches.length === 1) {
      event.preventDefault();
      this._moveStart(event, getMousePosition(event.touches[0], orientation));
    }
  };

  _onTouchMove = (event) => {
    const { disabled, readOnly, orientation } = this.props;
    if (!disabled && !readOnly && this.state.active) {
      this._move(event, getMousePosition(event.touches[0], orientation));
    }
  };

  _onTouchEnd = (event) => {
    const { disabled, readOnly } = this.props;
    if (!disabled && !readOnly && this.state.active) {
      event.stopPropagation();
      event.preventDefault();
      this._move(event, getMousePosition(event.touches[0], this.props.orientation));
      this._moveEnd(event.touches[0]);
      this.props.afterChange();
    }
  };

  _moveStart = (event, position) => {
    // event.preventDefault();
    event.stopPropagation();
    this.style = calculateStyle(styles, { ...this.state, ...{ active: true } }, this.props);
    this.currentPos = position;
    this.lastPos = position;
    this.setState({
      active: true,
    });
  };

  _move = (event, position) => {
    event.preventDefault();
    event.stopPropagation();
    const { factor, step, handleMove, orientation } = this.props;
    let direction;
    let distance;
    let incrementFactor;
    if (orientation === 'vertical') {
      direction = this.lastPos - position;
      distance = this.currentPos - position;
      incrementFactor = -1;
    } else {
      direction = position - this.lastPos;
      distance = position - this.currentPos;
      incrementFactor = 1;
    }
    const increment = direction > 0 ? 1 : -1;
    if (direction * distance > ((factor || 1) * step)) {
      handleMove(increment);
      this.currentPos += incrementFactor * factor * step * increment;
    }
    this.lastPos = position;
  };

  _moveEnd = () => {
    this.style = calculateStyle(styles, { ...this.state, ...{ active: false } }, this.props);
    this.setState({
      active: false,
      activeCount: 0,
    });
  };

  _onFocus = () => {
    this.style = calculateStyle(styles, { ...this.state, ...{ focused: true } }, this.props);
    this.setState({
      focused: true,
    });
  };

  _onBlur = () => {
    this.style = calculateStyle(styles, { ...this.state, ...{ focused: false } }, this.props);
    this.setState({
      focused: false,
    });
  };

  _onKeyDown = (event) => {
    const { disabled, readOnly } = this.props;
   
    if (!disabled && !readOnly) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
        event.stopPropagation();
        event.preventDefault();
        this.props.handleMove(-1);
        this.props.afterChange();
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.stopPropagation();
        event.preventDefault();
        this.props.handleMove(1);
        this.props.afterChange();
      }
    }
  };

  currentPos;
  lastPos;
  style = {
    ...(this.props.orientation === 'vertical' ? styles.handleVertical : styles.handle),
    ...this.props.style,
    ...{
      [`${this.props.orientation === 'vertical' ? 'bottom' : 'left'}`]: this.props.offset,
    },
    ...(this.props.disabled ?
      { ...styles.disabledHandle, ...this.props.disabledStyle } :
      {}
    ),
  };

  render() {
    const { handleRef, tabIndex, className, disabledClassName, disabled } = this.props;
    return (
      <div
        ref={handleRef}
        style={this.style}
        disabled={disabled}
        tabIndex={tabIndex}
        className={
          (disabled && disabledClassName) ?
          `handle ${disabledClassName}` :
          `handle ${className}`
        }
        onFocus={this._onFocus}
        onBlur={this._onBlur}
        onKeyDown={this._onKeyDown}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        onMouseDown={this._onMouseDown}
        onContextMenu={this._onContextMenu}
        onTouchStart={this._onTouchStart}
        onTouchMove={this._onTouchMove}
        onTouchEnd={this._onTouchEnd}
      >
      </div>
    );
  }
}
