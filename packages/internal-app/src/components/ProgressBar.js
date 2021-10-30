import React from "react";
import PropTypes from "prop-types";
import LinearProgress from "@material-ui/core/LinearProgress";

const ProgressBar = ({ percentage }) => {
  return (
    <div>
      <LinearProgress
        className="mb-3"
        variant="determinate"
        value={percentage?percentage:0}
      />
    </div>
  );
};

ProgressBar.propTypes = {
  percentage: PropTypes.string.isRequired
};

export default ProgressBar;
