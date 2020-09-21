import React from 'react'
import Checkbox from "@material-ui/core/Checkbox";

export default function Toolbar({ isDeletedItemVisible, handleDeletedToggle, isHistoryModalOpened, handleHistoryToggle }) {
  return (
    <div>
      <div className="ml-3">
        <Checkbox
          checked={isDeletedItemVisible}
          value="top"
          onChange={handleDeletedToggle}
        />Show Deletions</div>
      <div className="ml-3">
        <Checkbox
          checked={isHistoryModalOpened}
          value="top"
          onChange={handleHistoryToggle}
        />Show history</div>
    </div>

  )
}
