import React from "react";
import PropTypes from "prop-types";
import LinearProgress from "@mui/material/LinearProgress";

const ProgressBar = ({ percentage }) => {
  return (
    <div>
      <LinearProgress
        className="mb-3"
        variant="determinate"
        value={percentage?pecentage:0}
      />
    </div>
  );
};

ProgressBar.propTypes = {
  percentage: PropTypes.string.isRequired
};

export default ProgressBar;
