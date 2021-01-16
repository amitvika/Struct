import React, { useState, useEffect } from 'react';

import { Grid, Paper, Icon, Button } from '@material-ui/core';
import SelectCheckboxes from './atoms/SelectCheckboxes';

export default function Filter({
	list = [],
	filteredList = [],
	setFilteredList,
	columnsFields = []
}) {
	const [selectedFieldName, setSelectedFieldName] = useState('');
	const [selectedFieldOptions, setSelectedFieldOptions] = useState([]);
	const [selectedFields, setSelectedFields] = useState({});

	useEffect(() => {
		filtered();
	}, [selectedFields])

	const filtered = () => {
		const myArrayFiltered = list.filter((el) => {
			let flag = true;

			Object.keys(selectedFields).forEach(key => {
				const fieldValues = selectedFields[key];

				if (flag && fieldValues.length > 0) {
					flag = fieldValues.some((f) => f.label === el[key]);
				}
			});

			return flag;
		});

		setFilteredList(myArrayFiltered)
	}

	const handleChange = (data, field) => {
		setSelectedFieldOptions(get_unique_options(field))

		setSelectedFields(prev => {
			return {
				...prev,
				[field]: data
			}
		});
		setSelectedFieldName(field)
	}


	const get_unique_options = (field) => {
		if (field === selectedFieldName) {
			return selectedFieldOptions;
		}

		const array = filteredList;

		let flags = [], output = [], l = array.length, i;

		for (i = 0; i < l; i++) {
			if (flags[array[i][field]]) {
				continue;
			}

			let tempValue = array[i][field];
			if (tempValue && tempValue.trim().length > 0) {
				flags[array[i][field]] = true;
				output.push({ label: array[i][field], value: array[i][field] });
			}
		}
		return output;
	}


	const renderItem = () => {
		let item = [];

		Object.keys(columnsFields).forEach(fieldItem => {
			item.push(
				<Grid item sm sm={2}>
					<SelectCheckboxes
						onChange={(data) => handleChange(data, fieldItem)}
						options={get_unique_options(fieldItem)}
						placeholder={`Select ${columnsFields[fieldItem]}`} />
				</Grid>
			)
		})
		return item;
	}

	return (
		<>
			<Grid item sm sm={1} style={{ display: 'flex', justifyContent: 'center' }}>
				<Icon style={{ marginTop: '10px' }}>search</Icon>
			</Grid>
			<Grid item sm sm={1}>
				<Button
					variant="contained"
					color="primary"
					type="button"
					onClick={() => {
						setFilteredList(list)
						setSelectedFields({})
					}}>
					Clear
          </Button>
			</Grid>
			{
				renderItem()
			}
		</>
	)
}
