import React, { useState } from 'react'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export default function ChooseGeometry() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  return (
    <div className="Choose_Geometry">
      Choose Geometry : 
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret>
          Choose Geometry
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>1 Dimensional</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>2 Dimensional</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>3 Dimensional</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
