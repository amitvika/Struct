import React, { useState, useEffect } from 'react';
import ObjectAssign from 'object-assign';
import * as PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';

import RemoveIcon from '@mui/icons-material/Remove';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
//import OutlinedInput from '@mui/material/OutlinedInput';
import ButtonGroup from '@mui/material/ButtonGroup';
export const errorNames = {
  none: 'none',
  invalidSymbol: 'invalidSymbol',
  incompleteNumber: 'incompleteNumber',
  singleMinus: 'singleMinus',
  singleFloatingPoint: 'singleFloatingPoint',
  singleZero: 'singleZero',
  min: 'min',
  max: 'max',
  required: 'required',
  clean: 'clean',
  allow: 'allow',
  limit: 'limit'
};

export const strategies = {
  ignore: 'ignore',
  warn: 'warn',
  allow: 'allow'
};

export const typeofs = {
  stringType: 'string',
  numberType: 'number'
};

export const constants = {
  emptyString: '',
  dash: '-',
  dot: '.',
  zero: 0,
  one: 1,
  text: 'text',
  zeroString: '0',
  minusOne: -1,
  boolTrue: true,
  boolFalse: false
};
export class NumericInput extends React.Component {
  static getValidValue(value) {
    const match =
      value !== undefined ? value.match(NumericInput.allowed) : null;
    return match !== null
      ? match.index === constants.zero
        ? match[constants.zero]
        : match.join(constants.emptyString)
      : constants.emptyString;
  }

  static deleteOwnProps(props) {
    let prop;
    for (let index = 0; index < NumericInput.deleteProps.length; ++index) {
      prop = NumericInput.deleteProps[index];
      console.log('Props', props);
      if (props.hasOwnProperty(prop)) {
        delete props[prop];
      }
    }
  }

  static validateNumberValue(value, props) {
    const { max, min } = props;
    if (typeof max === typeofs.numberType && (value > max || 0)) {
      return constants.one;
    }
    if (typeof min === typeofs.numberType && (value < min || 0)) {
      return constants.minusOne;
    }
    return constants.zero;
  }

  static validateValue(value, props) {
    console.log('validateValue', value, this.textValue);
    const { required, strategy, min } = props;
    if (value === constants.emptyString || value == undefined) {
      return required ? errorNames.required : errorNames.clean;
    } else {
      if (value.match(NumericInput.validSymbols)) {
        if (value.match(NumericInput.stricAllowed)) {
          if (value.match(NumericInput.validNumber)) {
            const numberValue = Number(value);
            const floatingPoint = value.indexOf(constants.dot);
            const decimal = floatingPoint > constants.minusOne;
            const whole = decimal
              ? Number(value.substring(constants.zero, floatingPoint))
              : min || 0;
            switch (NumericInput.validateNumberValue(numberValue, props)) {
              case constants.one:
                return errorNames.max;
              case constants.minusOne:
                return strategy !== strategies.allow &&
                  (min || 0 > constants.zero) &&
                  numberValue > constants.zero &&
                  (!decimal || (decimal && (whole > min || 0)))
                  ? errorNames.allow
                  : errorNames.min;
              default:
                return errorNames.none;
            }
          } else {
            return strategy !== strategies.allow &&
              value === constants.dash &&
              (min || 0 >= constants.zero)
              ? errorNames.limit
              : min || 0 < 0
              ? errorNames.allow
              : errorNames.incompleteNumber;
          }
        } else {
          switch (value[value.length - constants.one]) {
            case constants.dash:
              return errorNames.singleMinus;
            case constants.dot:
              return errorNames.singleFloatingPoint;
            case constants.zeroString:
              return errorNames.singleZero;
            default:
              return errorNames.invalidSymbol;
          }
        }
      } else {
        return errorNames.invalidSymbol;
      }
    }
  }

  static overrideRequestedValue(error, value, props) {
    console.log('Reaching heer 2 overrideRequestedValue', value, props);
    switch (error) {
      case errorNames.min:
        return String(props.min);
      case errorNames.max:
        return String(props.max);
      default:
        return (props.strategy !== strategies.allow &&
          value === constants.dash &&
          props.min) ||
          0 >= 0
          ? constants.emptyString
          : value;
    }
  }

  static overrideError(error, props) {
    console.log('Reaching heer 3 overrideError  ', error, props);
    switch (error) {
      case errorNames.allow:
        return errorNames.none;
      case errorNames.limit:
        return props.required ? errorNames.required : errorNames.clean;
      default:
        return error;
    }
  }

  static revertAllowToMin(error) {
    console.log('revertAllowToMin ', error);
    return error === errorNames.allow ? errorNames.min : error;
  }

  static emitValid(error, overridenError) {
    console.log('emitValid ', error, overridenError);
    return error !== errorNames.allow && overridenError === errorNames.none;
  }

  static validSymbols = /(\-|\.|\d)+/;
  static stricAllowed = /^-?((0|([1-9]\d{0,}))(\.\d{0,})?)?$/;
  static validNumber = /^-?((0(\.\d+)?)|([1-9]\d{0,}(\.\d+)?))$/;
  static allowed = /-?((0|([1-9]\d{0,}))(\.\d{0,})?)?/;
  static deleteProps = ['strategy', 'onError', 'onValid', 'onRequestValue'];

  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    errorStyle: PropTypes.object,
    errorText: PropTypes.node,
    floatingLabelFixed: PropTypes.bool,
    floatingLabelFocusStyle: PropTypes.object,
    floatingLabelStyle: PropTypes.object,
    floatingLabelText: PropTypes.node,
    fullWidth: PropTypes.bool,
    hintStyle: PropTypes.object,
    hintText: PropTypes.node,
    id: PropTypes.string,
    inputStyle: PropTypes.object,
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onValid: PropTypes.func,
    onError: PropTypes.func,
    onRequestValue: PropTypes.func,
    onKeyDown: PropTypes.func,
    style: PropTypes.object,
    underlineDisabledStyle: PropTypes.object,
    underlineFocusStyle: PropTypes.object,
    underlineShow: PropTypes.bool,
    underlineStyle: PropTypes.object,
    defaultValue: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    required: PropTypes.bool,
    strategy: PropTypes.oneOf([
      strategies.ignore,
      strategies.warn,
      strategies.allow
    ]),
    value: PropTypes.string
  };
  static defaultProps = {
    required: constants.boolFalse,
    strategy: strategies.allow
  };

  error;
  lastValid;
  constProps;

  emitEvents(nextError, value, valid, props) {
    console.log('Emirring', value, props, nextError, valid);
    const { onError, onValid } = props;
    if (this.error !== nextError && props.strategy !== strategies.ignore) {
      if (onError) {
        onError(nextError);
      }
      this.error = nextError;
    }
    if (onValid && valid && this.lastValid !== value) {
      onValid(Number(value));
      this.lastValid = value;
    }
  }

  takeActionForValue(value, props) {
    console.log('I have reached here', value, props);
    const { strategy, onRequestValue, value: propsValue } = props;
    const error = NumericInput.validateValue(value, props);
    const valid = NumericInput.overrideRequestedValue(
      error,
      NumericInput.getValidValue(value),
      props
    );
    const overridenError = NumericInput.overrideError(error, props);
    const emitValid = NumericInput.emitValid(error, overridenError);
    this.emitEvents(overridenError, valid, emitValid, props);
    if (strategy !== strategies.allow && valid !== value) {
      if (typeof propsValue !== typeofs.stringType) {
        this.getInputNode().value = valid;
      } else if (onRequestValue) {
        onRequestValue(valid);
      }
    }
  }

  shouldTakeActionForValue(props) {
    console.log('shouldTakeActionForValue', props);
    const { min, max, required, strategy } = this.props;
    return (
      min !== props.min ||
      max !== props.max ||
      required !== props.required ||
      strategy !== props.strategy
    );
  }

  refTextField(textField) {
    this.textField = React.createRef();
  }
  state = {
    myvalue: 0
  };
  onChange(event) {
    const { value } = event.currentTarget;
    console.log('Text Field Before', value, this.textValue);
    this.textValue = value;
    this.setState({ myvalue: value });
    //this.textField.value = value;
    console.log('Text Field After', value, this.textValue);
    console.log('My Props', this, this.props.onChange);
    const { onChange } = this.props;
    if (onChange) {
      const myChangedvalue = Number(value || '');
      const myOriginalvalue = Number(this.props.value || '');
      if (myChangedvalue != myOriginalvalue && !isNaN(myChangedvalue)) {
        console.log(
          'Changing inside number input',
          event,
          value,
          this.props.value,
          Number(value || '')
        );
        onChange(event, Number(value || ''));
      } else {
        console.log('Value is not changed', value, this.props.value);
      }
    }
    if (typeof this.props.value !== typeofs.stringType) {
      this.takeActionForValue(value || '', this.props);
    }
    console.log('Text Field After AFter', value, this.textValue);
  }

  onBlur(event) {
    console.log('onBlur', event);
    const { value } = event.currentTarget;
    const { props } = this;
    const { onBlur } = props;
    const error = NumericInput.overrideError(
      NumericInput.revertAllowToMin(
        NumericInput.validateValue(value || '', props)
      ),
      props
    );
    this.emitEvents(error, value || '', constants.boolFalse, props);
    if (onBlur) {
      onBlur(event);
    }
  }

  getInputNode() {
    return this.textField;
  }

  getTextField() {
    return this.textField;
  }

  constructor(props) {
    super(props);
    this.props = props;
    console.log('In constructor,', props, this.props);
    this.state.myvalue = this.props.value;
    this.textField = React.createRef();
    this.textValue = this.props.value;
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.constProps = {
      type: constants.text,
      onChange: this.onChange,
      onBlur: this.onBlur
    };
  }

  componentDidMount() {
    const { props } = this;
    const { value } = props;
    console.log('Inside didmount', value, this.props.value, this.textValue);
    this.takeActionForValue(
      typeof value === typeofs.stringType
        ? value || ''
        : this.getInputNode().value,
      props
    );
  }
  componentDidUpdate(prevProps, prevState) {
    const { value } = this.props;
    const numberValue = Number(value || '');
    const numberPropsValue = Number(prevProps.value || '');
    console.log('Inside RecieveProps', value, this.props.value, this.textValue);
    if (
      numberValue !== numberPropsValue ||
      this.shouldTakeActionForValue(this.props)
    ) {
      this.takeActionForValue(value || '', this.props);
    }
  }
  //   componentWillReceiveProps(props) {
  //     const { value } = props;
  //     const numberValue = Number(value);
  //     const numberPropsValue = Number(this.props.value);
  //     console.log('Inside RecieveProps', value, this.props.value, this.textValue);
  //     if (value !== this.props.value || this.shouldTakeActionForValue(props)) {
  //       this.takeActionForValue(value || '', props);
  //     }
  //   }

  render() {
    const { props, inputProps, constProps } = this;
    const { value, defaultValue } = props;
    let originalValue = this.textValue;
    console.log(
      'Value got Before ',
      value,
      this.textValue,
      originalValue,
      inputProps,
      constProps,
      props
    );
    if (Number(value || '') !== Number(originalValue || '')) {
      originalValue = value;
    }
    console.log('Value got After', value, this.textValue, originalValue);
    return (
      <TextField
        {...inputProps}
        onChange={this.onChange}
        value={originalValue}
        // inputRef={($el) => {
        //   //you got the input value here
        //   if ($el) {
        //     const inputValue = $el.value;
        //     this.textValue = $el.value;
        //     console.log('This.text value', this.textValue);
        //   }
        // }}
      />
    );
    // let myChangedvalue = Number(value || '');
    // const myOriginalvalue = this.textField
    //   ? Number(this.textField.value || '')
    //   : Number('');
    // if (myOriginalvalue == myChangedvalue) {
    //   myChangedvalue = myOriginalvalue;
    // }
    // let inputProps = ObjectAssign({}, props, constProps, {
    //   defaultValue:
    //     typeof defaultValue === typeofs.numberType
    //       ? String(defaultValue)
    //       : undefined,
    //   value: myChangedvalue
    // });

    // if (typeof inputProps.value !== typeofs.stringType) {
    //   delete inputProps.value;
    // }
    // if (inputProps.defaultValue === undefined) {
    //   delete inputProps.defaultValue;
    // }

    // NumberInput.deleteOwnProps(inputProps);
    // this.textField = React.createElement(TextField, inputProps);
    // return this.textField;
  }
}
export const NumberInput = (props) => {
  const { value, min, max, onChange } = props;
  const [currentValue, setValue] = useState(value);
  useEffect(() => {
    setValue(value);
  }, [value]);
  const valueChange = (event) => {
    setValue(event.target.value);
    if (onChange) {
      const myChangedvalue = Number(event.target.value || '');
      const myOriginalvalue = Number(value || '');
      if (myChangedvalue != myOriginalvalue && !isNaN(myChangedvalue)) {
        console.log(
          'Changing inside number input',
          event,
          value,
          event.target.value,
          Number(event.target.value || '')
        );
        onChange(event, Number(event.target.value || ''));
      } else {
        console.log('Value is not changed', value, event.target.value);
      }
    }
  };
  return (
    <div>
      <TextField
        fullWidth
        type="number"
        size="small"
        inputProps={{ min, max }}
        value={currentValue}
        onChange={valueChange}
        variant="outlined"
      />
    </div>
  );
};
const CustomAutoSubmitInput = ({ handleInputChange }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [delayedSearchTerm, setDelayedSearchTerm] = React.useState('');

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleInputChange(searchTerm);
      setDelayedSearchTerm(searchTerm);
    }, 3000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <OutlinedInput
      id="standard-basic"
      variant="standard"
      size="small"
      type="number"
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};

export const PlusMinus = (props) => {
  const {
    label,
    value,
    min = -3.402823466e38,
    max = 3.402823466e38,
    step = 1,
    tooltipPlus = '',
    tooltipMinus = '',
    onChange = () => {}
  } = props;

  const [counter, setCounter] = useState(parseFloat(value || 0));
  useEffect(() => {
    assignValue(value);
  }, [value]);
  const incrementValue = () => {
    const newValue = counter + step;
    if (newValue < max) {
      setCounter(newValue);
      console.log('Setting increment and calling onchange', newValue);
      onChange(null, newValue);
    } else if (counter != max) {
      setCounter(max);
      console.log(
        'Setting increment max and calling onchange',
        newValue,
        max,
        counter,
        step,
        typeof counter,
        typeof step,
        typeof newValue
      );
      onChange(null, max);
    }
  };
  const decrementValue = () => {
    const newValue = counter - step;
    if (newValue > min) {
      setCounter(newValue);
      console.log('Setting decrement and calling onchange', newValue);
      onChange(null, newValue);
    } else if (counter != min) {
      setCounter(min);
      console.log('Setting decrement min and calling onchange', newValue, min);
      onChange(null, min);
    }
  };
  const assignValue = (value) => {
    const data = parseFloat(value || 0);
    console.log('Assigning Value', data);
    if (data <= max && data >= min) {
      if (counter != data) {
        setCounter(data);
        console.log('Setting counter and calling onchange', data);
        onChange(null, data);
      }
    } else {
      if (data > max) {
        if (counter != max) {
          setCounter(max);
          console.log('Setting counter max and calling onchange', data, max);
          onChange(null, max);
        }
      } else {
        if (counter != min) {
          setCounter(min);
          console.log('Setting counter min and calling onchange', data, min);
          onChange(null, min);
        }
      }
    }
  };
  return (
    <ButtonGroup size="small" aria-label="small outlined button group">
      {/* <Button disabled>{label}</Button> */}
      <Box
        sx={{
          p: 1,
          direction: 'column',
          border: '1px dotted',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {label}
      </Box>

      <Tooltip title={tooltipMinus}>
        <Button onClick={decrementValue} size={'small'} variant="contained">
          <RemoveIcon />
        </Button>
      </Tooltip>
      <NumberInput
        floatingLabelText={'Please input ' + label}
        value={(counter || 0).toString()}
        onChange={(event, data) => {
          console.log('Changing data', event, data);
          assignValue(data);
        }}
        min={min}
        max={max}
        step={step}
      />
      <Tooltip title={tooltipPlus}>
        <Button onClick={incrementValue} size={'small'} variant="contained">
          <AddIcon />
        </Button>
      </Tooltip>
      {/* <CustomAutoSubmitInput
        value={counter}
        handleInputChange={(data) => SetNum(data)}
      /> */}
    </ButtonGroup>
  );
};
