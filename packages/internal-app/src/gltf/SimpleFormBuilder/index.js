import React from 'react';
import _ from 'lodash';

//import Box, { VBox } from 'react-layout-components';
import Box from '@material-ui/core/Box';

//import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import RadioGroup  from '@material-ui/core/RadioGroup';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import {ColorPicker} from 'material-ui-color';

//import IconButton from '@material-ui/core/IconButton';
//import Smile from '@material-ui/icons/Mood';
//import EmojiPicker from 'emoji-picker-react';
//import EmojiConvertor from 'emoji-js';

import CustomTextField from './components/TextField';
//import ImageUpload from './components/ImageUpload';
import CustomSliderField from './components/SliderField';
import CustomSelect from './components/SelectField';
//import AsyncSelect from './components/AsyncSelect';
import ChipInput from './components/ChipInput';

export default class SimpleFormBuilder extends React.Component {
  style = {
    width: '100%',
  };

  constructor(props) {
    super(props);
    this.state = {
      values: this.props.values,
      emojiPickerOpen: false,
      timeout: null,
      index: 0,
      opened: true
    };
  }

  DEFAULT_IMG = this.props.defaultImage || 'http://via.placeholder.com/50x50';

  /* handleEmojiText = (input) => {
    if (_.isString(input)) {
      const emoji = new EmojiConvertor();
      return emoji.replace_colons(input);
    } else return input;
  }; */

  handleChange = (field, value, ctrlKey) => {
    //const { fields } = this.props;
    //const wholeField = fields.find(({ name, key }) => name === field || key === field);

    //let transformedValue = value;
    /*
    if (wholeField && wholeField.emoji === true) {
      if (wholeField.type === 'text' || wholeField.type === 'multiLineText') {
        transformedValue = this.handleEmojiText(value);
      }
    } */
   
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
      this.setState({ timeout: null }, () => this.setChanges(field, value, ctrlKey));
    } else {
      this.setChanges(field, value, ctrlKey);
    }
  };

  /* getPickedEmoji = (field, emojiData) => {
    const pickedEmoji = `:${emojiData.name}:`;
    const { values } = this.state;

    if (pickedEmoji) {
      const newValue = values[field] ? `${values[field]}${pickedEmoji}` : pickedEmoji;
      this.handleChange(field, newValue);
    } else {
      console.log('ERROR: Invalid emoji code');
    }
  };

  handleEmojiPicker = () => {
    this.setState({ emojiPickerOpen: !this.state.emojiPickerOpen });
  }; */

  setChanges = (field, value, ctrlKey) => {
    if (this.props.handleChange) {
      this.props.handleChange(field, value, ctrlKey);
    }
    const values = { ...this.props.values, ...this.state.values, [field]: value, ctrlKey:ctrlKey };
    this.setState({ values }, () => {
     /*  if (!this.props.delayTime || !this.props.onDelayedChange) {
        return false;
      }
      let time = 0;
      if (_.includes(this.props.delayTriggers, field)) {
        time = this.props.delayTime;
      }
      const timeout = setTimeout(() => {
        this.props.onDelayedChange(values);
      }, time);
      this.setState({ timeout }); */
      if (this.props.onChange) {
        this.props.onChange(values);
      }
    });
   /*  if (this.props.onChange) {
      this.props.onChange(values);
    } */
  };

  getProperty = (key, defaultValue, formDefault) => {
    const componentDefault = _.get(this.props.values, key);
    return _.get(this.state.values, key, componentDefault || defaultValue || formDefault);
  };

  getName = (name) => {
    return _.replace(name, /\./g, ' ');
  };

  getField = (field) => {
    const errors = this.props.errors;
    const labelwidth = this.props.labelwidth || 0;
    const key = field.key || field.name || 'key';
    const type = field.type || 'text';
    const defaultValue = field.default || null;
    const name = field.name || 'field';
    const disabled = field.disabled || false;
    //const emoji = field.emoji || false;
    const dialogActive = field.dialogActive || false;
    const dialogContent = field.dialogContent || null;
    const dialogTitle = field.dialogTitle || null; 
    let currentlabelwidth = labelwidth || 0;
    currentlabelwidth=0;
    const textwidth = 100-currentlabelwidth;
    currentlabelwidth = textwidth;
    const arrayitems = field.items || [];
    let items=[];
    if(arrayitems.length > 0) {
      if(arrayitems[0].title) {
        items=arrayitems;
      } else {
        for (let index = 0; index < arrayitems.length; index++) {
          const element = arrayitems[index];
          items.push({value:index,title:element});          
        }
      }
      field.items = items;
    } 

    switch (type) {
      case 'text':
      case 'password':
      case 'number':
        return (
          <CustomTextField zindex="tooltip"
            field={field}
            errors={this.props.errors}
            value={this.getProperty(key, defaultValue, '')}
            onChange={(event) => this.handleChange(key, event.target.value, event.ctrlKey)}
            labelwidth={this.props.labelwidth}
          />
        );

      case 'multiLineText': {
        return (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <CustomTextField zindex="tooltip"
                field={field}
                errors={this.props.errors}
                value={this.getProperty(key, defaultValue, '')}
                onChange={(event) => this.handleChange(key, event.target.value, event.ctrlKey)}
                multiline
                rows={field.rows || 1}
                rowsMax={field.rowsMax || 3}
                labelwidth={this.props.labelwidth}
              />
              {/* {emoji ? (
                <div>
                  <IconButton onClick={this.handleEmojiPicker}>
                    <Smile />
                  </IconButton>
                </div>
              ) : null} */}
            </div>
            {/* {emoji && this.state.emojiPickerOpen ? (
              <EmojiPicker
                onEmojiClick={(emoji, emojiData) => this.getPickedEmoji(key, emojiData)}
              />
            ) : null} */}
          </div>
        );
      }
      case 'slider':
        return (
          <CustomSliderField zindex="tooltip"
            field={field}
            errors={this.props.errors}
            value={this.getProperty(key, defaultValue, '')}
            onChange={(event,newvalue) => this.handleChange(key, newvalue, event.ctrlKey)}
            labelwidth={this.props.labelwidth}
          />
        );
      case 'select':
        return (
          <CustomSelect zindex="tooltip"
            field={field}
            errors={this.props.errors}
            selectedValues={this.getProperty(key, defaultValue, field.multiple ? [] : '')}
            onChange={(event) => this.handleChange(key, event.target.value, event.ctrlKey)}
            dialogActive={dialogActive}
            dialogContent={dialogContent}
            dialogTitle={dialogTitle}
            labelwidth={this.props.labelwidth}
          />
        );
      
        case 'color':
        
        return (
          // <Grid style={{display:"flex"}}>
          <span >
          {currentlabelwidth!=0 && (
            <InputLabel style={{width:currentlabelwidth.toString()+'%'}}>{this.getName(name)}</InputLabel>
          )}  
            <ColorPicker zindex="tooltip" style={{zIndex: 1000}}
              field={field}
              name={this.getName(name)}
              errors={this.props.errors}
              value={this.getProperty(key, defaultValue, '')}
              defaultValue={this.getProperty(key, defaultValue, '')}
              onChange={(color) => this.handleChange(key, color.value, false)}
              //style={{width:textwidth.toString()+"%",height:"600"}}
            />
            </span>
            // </Grid>
          );
      /* case 'asyncSelect':
        return (
          <AsyncSelect
            field={field}
            errors={this.props.errors}
            onChange={(value) => this.handleChange(key, value)}
            selectedValues={this.getProperty(key, defaultValue, field.multiple ? [] : '')}
          />
        ); */

      case 'checkbox': {
        return (
          <FormControl zindex="tooltip" component="fieldset">
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.getProperty(key, defaultValue, false)}
                    value={`${this.getProperty(key, defaultValue, false)}`}
                    onClick={(event) => {
                      this.handleChange(key, event.target.checked, event.ctrlKey);
                    }}
                    disabled={disabled}
                  />
                }
                label={this.getName(name)}
              />
            </FormGroup>
          </FormControl>
        );
      }
      
      case 'lradio': {
        const items = field.items || [];
        return (
          <Grid style={{display:"flex"}}>
          <FormControl zindex="tooltip" component="fieldset">
            <RadioGroup value={`${this.getProperty(key, defaultValue, false)}`} onChange={(event) => {
                      this.handleChange(key, event.target.value, event.ctrlKey);
                    }}>
              { items.map( (item) => (
               
              <FormControlLabel
                value = {item.title}
                control={
                  <Radio />
                }
                label={this.getName(item.title)}               
              />
              
               ))}
            </RadioGroup>
          </FormControl>
          </Grid>
        );
      }
      case 'radio': {
       
        const items = field.items || [];
        return (
          // <Grid style={{display:"flex"}}>
          <span >
          {currentlabelwidth!=0 && (
            <InputLabel style={{width:currentlabelwidth.toString()+'%'}}>{this.getName(name)}</InputLabel>
          )}  
          <FormControl component="fieldset" zindex="tooltip" style={{width:textwidth.toString()+"%"}}>
            <RadioGroup value={`${this.getProperty(key, defaultValue, false)}`} onChange={(event) => {
                      this.handleChange(key, event.target.value, event.ctrlKey);                     
                    }}>
              { items.map( (item) => (
               
              <FormControlLabel
                value = {item.title}
                control={
                  <Radio />
                }
                label={this.getName(item.title)}               
              />
              
               ))}
            </RadioGroup>
          </FormControl>
          </span>
        );
      };
      case 'chip': {
        const value = this.getProperty(key, defaultValue, []);
        return (
          <ChipInput zindex="tooltip"
            field={field}
            value={value}
            onChange={(value) => this.handleChange(key, value,false)}
            errors={errors}
          />
        );
      }

     /*  case 'image':
      case 'image2': {
        const defaultImg = defaultValue || this.DEFAULT_IMG;
        return (
          <ImageUpload
            field={field}
            srcValue={this.getProperty(key, defaultImg, '') + '?' + new Date().getTime()}
            defaultImg={this.DEFAULT_IMG}
            handleChange={this.handleChange}
          />
        );
      } */
    }
  };

  getFields = () =>
    this.props.fields.map((field, index) => (
      <div p={1}
        key={`form-field-container-${index}`}
        style={{ margin: '5px 0', ...this.props.inputContainerStyle, width:'100px' }}
      >
      {this.getField(field)} 
      </div>
    ));
  
  closeForm = () =>{
    this.setState({opened:false});
  }
  
  render() {
    let FieldContainer = Box;
    if (this.props.orientation === 'horizontal') {
      FieldContainer = Box;
    }
    return (
      this.state.opened &&
      (<Box p={1} zindex="tooltip" style={this.style}>
        <FieldContainer
          style={{
            backgroundColor: '#fefefe',
            padding: 1,            
            ...this.props.fieldContainerStyle,
          }}
          flex={1}
          wrap={this.props.wrap}
        >
          <Grid p={1} style={{display:"flex"}}>
          {this.getFields()}
          </Grid>
        </FieldContainer>  
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
