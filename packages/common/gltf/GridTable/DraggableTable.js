import React from 'react';
import { sortableContainer, sortableElement, sortableHandle} from 'react-sortable-hoc';
import BaseTable from './BaseTable';
import {callOrReturn} from './utils';
import styled  from 'styled-components';
const DraggableContainer = sortableContainer(({ children }) => children)
const DraggableElement = sortableElement(({ children }) => children)
const DraggableHandle = sortableHandle(({ children }) => children)

const Handle = styled.div`
  flex: none;
  width: 7.5px;
  height: 100%;

  &::before {
    content: '';
    border-left: 4px dotted #ccc;
    display: block;
    height: 20px;
    margin: 3px 3px;
    vertical-align: : 'top';
  }

  &:hover::before {
    border-color: #888;
  }
`

const Row = ({ key, index, children, ...rest }) => (
  <DraggableElement key={key} index={index}>
    <div {...rest}>
      <DraggableHandle>
        <Handle />
      </DraggableHandle>
      {children}
    </div>
  </DraggableElement>
)

const rowProps = ({ rowIndex }) => ({
  tagName: Row,
  index: rowIndex,
})

class DraggableTable extends React.PureComponent {
  state = {
    changedata: false,
    data: this.props.data,
  }
  constructor(props) {
    super(props);
    
    this.table = React.createRef();
     
  };
  
  static getDerivedStateFromProps(props, current_state) {
    console.log("current state",props,current_state);
    if (current_state.data !== props.data && current_state.changedata==false) {
      return {
        data: props.data
      }
    }
    if (current_state.data !== props.data && current_state.changedata==true) {
      return {
        changedata: false
      }
    }
    return null;
  }
  getContainer = () => {
    return this.table.current.getDOMNode().querySelector('.BaseTable__body')
  }

  getHelperContainer = () => {
    return this.table.current.getDOMNode().querySelector('.BaseTable__table')
  }

  rowProps = args => {
    // don't forget to passing the incoming rowProps
    const extraProps = callOrReturn(this.props.rowProps)
    return {
      ...extraProps,
      tagName: Row,
      index: args.rowIndex,
    }
  }

  handleSortEnd = ({ oldIndex, newIndex }) => {
    const data = [...this.state.data]
    const [removed] = data.splice(oldIndex, 1);
    data.splice(newIndex, 0, removed);   
   
    if(this.props.setSortBy){
      console.log("befor calling setting sorting to null");
      this.props.setSortBy(null);
    }
    if(this.props.updateOrderChange) {
      console.log("befor calling updateorderchange",data,oldIndex,newIndex);
      this.props.updateOrderChange(data,oldIndex,newIndex);
    }
    console.log("befor calling",data,this.props);
    this.setState({ 
      changedata:true,
      data:data })
  }
  
  render() {
    console.log("Draggable Table",this.props);
    return (
      <DraggableContainer
        useDragHandle
        getContainer={this.getContainer}
        helperContainer={this.getHelperContainer}
        onSortEnd={this.handleSortEnd}
      >
        <BaseTable
          {...this.props}
          ref={this.table}
          data={this.state.data}
          fixed={false}
          rowProps={this.rowProps}
        />
      </DraggableContainer>
    )
  }
}

export default DraggableTable;
