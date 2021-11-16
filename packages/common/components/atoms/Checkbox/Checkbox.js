import React from 'react';
import PropTypes from 'prop-types';
import CheckboxUI from '@material-ui/core/Checkbox';

const Checkbox = ({
  greyDesign,
  label,
  className,
  htmlFor,
  size,
  bold,
  labelStyle,
  containerStyle,
  field = {},
  onChange,
  onClick,
  checked,
  readonly,
  id,
  ...props
}) => {
  return (
    <div
    //   style={containerStyle}
    //   onClick={onClick}
    //   className={classNames('bdb-checkbox', size && `bdb-checkbox--size-${size}`, bold && 'bdb-checkbox--bold')}
    >
      <CheckboxUI
        checked={checked}
        // className={classNames('brewery-checkbox', greyDesign && 'brewery-checkbox--grey')}
        color="primary"
        id={id}
        // checkedIcon={<span className="brewery-checkbox--checked" />}
        // icon={<span className="brewery-checkbox--icon" />}
        onChange={onChange}
        disableRipple={readonly}
        {...field}
        {...props}
      />
      {label && (
        <label style={labelStyle} htmlFor={htmlFor}>
          {label}
        </label>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  greyDesign: PropTypes.bool,
  bold: PropTypes.bool,
  htmlFor: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  size: PropTypes.string,
  field: PropTypes.shape(),
  checked: PropTypes.bool,
  onChange: PropTypes.func
};

Checkbox.defaultProps = {
  htmlFor: 'unnamed',
  checked: false,
  onChange: () => {}
};

export default Checkbox;
