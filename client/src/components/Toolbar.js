import React, { useState, useEffect } from 'react'
import { Grid, Paper, Icon, Button } from '@material-ui/core';
import Checkbox from './atoms/Checkbox';
import Headding from './atoms/Headding';
import SelectCheckboxes from './atoms/SelectCheckboxes';
import AddCircleIcon from '@material-ui/icons/AddCircle';

export default function Toolbar({
	title,
	isGridViewSelected,
	setIsGridViewSelected,
	isDeletedItemVisible,
	handleShowDelete,
	isHistoryModalOpened,
	handleHistoryToggle,
	list = [],
	filteredList = [],
	setFilteredList,
	columnsFields = []
}) {
	const [selectedFieldName, setSelectedFieldName] = useState('');
	const [selectedFieldOptions, setSelectedFieldOptions] = useState([]);

	const [selectedFields, setSelectedFields] = useState({});

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
		<Paper style={{ padding: '10px', marginTop: '10px', marginBottom: '10px' }} >
			<Grid container>
				<Grid item sm sm={2}>
					<Grid item sm sm={12}>
						<Checkbox
							checked={isGridViewSelected}
							size="large"
							label="View GridView"
							onClick={() => setIsGridViewSelected(!isGridViewSelected)}
						/>
					</Grid>

					<Grid item sm sm={12}>
						<Checkbox
							checked={isDeletedItemVisible}
							label="Show Deletions"
							onChange={handleShowDelete}
						/>
					</Grid>

					<Grid item sm sm={12}>
						<Checkbox
							checked={isHistoryModalOpened}
							label="Show History"
							onChange={handleHistoryToggle}
						/>
					</Grid>
				</Grid>
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
				<Grid item sm sm={12} style={{ display: 'flex', justifyContent: 'center' }}>
					<Headding fontSize={30} title={title} style={{ fontWeight: 'bold' }}></Headding>
				</Grid>
				{/* {
						isGridViewSelected &&
						<div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
							<AddCircleIcon style={{ color: '#3f51b5' }} />
						</div>
					} */}
			</Grid>
		</Paper >
	)
}
