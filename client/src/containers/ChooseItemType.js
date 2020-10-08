import React, { useState } from 'react'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export default function ChooseItemType() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  return (
    <div className="Choose_Geometry">
      Choose Item Type : 
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret>
        Choose Item Type
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>Single Material Part</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Multi Material Assembly</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
