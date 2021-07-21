import React from 'react';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SimpleFormBuilder from '../SimpleFormBuilder';

export default class GroupFormBuilder extends React.Component {
  style = {
    width: '100%',
  };

  constructor(props) {
    super(props);
    this.state = {     
      opened: true
    };
  }

  getGroups = () => {
    const key= this.props.key || 'form-group';
    return this.props.groups.map((group, index) => (
      <div p={1}
        key={`${key}-${index}`}
        style={{ margin: '1px 0', ...this.props.inputContainerStyle, width:'100px' }}
      >
        <SimpleFormBuilder
          fieldContainerStyle={{ backgroundColor: '#fefefe', padding: 1 }}
          inputContainerStyle={{ margin: '5px 0' }}
          onChange={this.props.onChange}                    
          fields={group.fields}
          values={group.values}                            
          errors={{ simpleTextFieldWithError: 'This is an error message.' }}
          labelwidth={20}
          closeForm={this.props.closeForm}
          key={`${key}-${index}-field-`}
          keyindex = {index}          
        />      
      </div>
    ));

    };

  closeForm = () =>{
    this.setState({opened:false});
  }
  
  render() {
    /* let FieldContainer = Box;
    if (this.props.orientation === 'horizontal') {
      FieldContainer = Box;
    } */
    //console.log("MyGroups",this.getGroups());
    return (
      this.state.opened &&
      (<Box p={1} zindex="tooltip" style={this.style}>
        <Box
          style={{
            backgroundColor: '#fefefe',
            padding: 1,            
            ...this.props.fieldContainerStyle,
          }}
          flex={1}
          wrap={this.props.wrap}
        >
          <Grid p={1} container spacing={10} direction="row" style={{display:"flex", margin: '1px 0'}}>
          {this.getGroups()}         
          </Grid>
        </Box>  
        {/* <Box p={1} style={{ justifyContent: 'center', ...this.props.actionContainerStyle }}>
         
            <Button
              variant="contained"
              onClick={() => {
                  if(this.props.closeForm){
                    this.props.closeForm();
                  }
                  this.setState({opened:false});
                }
              }
              style={{ display: 'block', margin: '0 auto', width: '30%' }}
            >
              {'Close'}
            </Button>
         
        </Box>     */}  
      </Box>
      )
    )
    
  }
}
