import React from 'react';
import MaterialTable from 'material-table';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckboxTree from 'react-checkbox-tree';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import FolderLogo from '../../../assets/images/folder_logo.png'
import FolderOpenLogo from '../../../assets/images/folderOpen.png'
import ArrowRight from '../../../assets/images/right-chevron.png'
import ArrowDown from '../../../assets/images/down-chevron.png'
import PaperLogo from '../../../assets/images/paper.png'
import PlusIcon from '../../../assets/images/add.png'
import MinusIcon from '../../../assets/images/minus.png'




const nodes = [{
    value: 'mars',
    label: 'Mars',
    showCheckbox: false,

    children: [
        {
            value: 'phobos', label: 'Phobos',showCheckbox: false, children: [
                { value: 'hello', label: 'hello',showCheckbox: false,  },
                { value: 'hello2', label: 'hello2',showCheckbox: false,  },]
        },
        {
            value: 'deimos', label: 'Deimos',showCheckbox: false, children: [
                { value: 'hello3', label: 'hell3',showCheckbox: false, },
                { value: 'hello4', label: 'hello4' ,showCheckbox: false,},
            ]
        },
    ],
}];


class MultipleDetailPanels extends React.Component {
    state = {
        checked: [],
        expanded: [],
    };

    render() {
        return (
            <>
                <FormControlLabel value="female" control={<Radio />} label="Create Resultant Single Item Parts and Multi-Item Assemblies"  />

                <CheckboxTree
                    nodes={nodes}
                    // checked={this.state.checked}
                    expanded={this.state.expanded}
                    onCheck={checked => this.setState({ checked })}
                    onExpand={expanded => this.setState({ expanded })}
                    icons={{
                        check: false,
                        uncheck: false,
                        halfCheck: false,
                        expandClose: <img style={{width: '10px'}} src={ArrowRight} />,
                        expandOpen: <img style={{width: '10px'}} src={ArrowDown} />,
                        expandAll: <img style={{width: '30px'}} src={PlusIcon} />,
                        collapseAll: <img style={{width: '30px'}} src={MinusIcon} />,
                        parentClose:<img style={{width: '30px'}} src={FolderLogo} />,
                        parentOpen: <img style={{width: '30px'}} src={FolderOpenLogo} />,
                        leaf: <img style={{width: '30px'}} src={PaperLogo} />,
                    }}
                />
            </>
        );
    }
}
export default MultipleDetailPanels

