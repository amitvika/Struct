import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';

const Headding = ({
    as, children, className, onClick, title, bold, style, fontSize, color, align
}) => {

    return (
        <Typography variant={as} gutterBottom
            onClick={onClick}
        >
            { title || children}
        </Typography >
    );
};

Headding.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node,
    style: PropTypes.shape(),
    align: PropTypes.string,
    as: PropTypes.string,
    className: PropTypes.string,
    title: PropTypes.string,
    color: PropTypes.string,
    bold: PropTypes.bool,
    fontSize: PropTypes.number
};

Headding.defaultProps = {
    as: 'h6'
};

export default Headding;
