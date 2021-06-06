import React from 'react';
import Modal from '../../../components/Modal'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import TaskForm from './TaskForm';

export default function ManageTeamModal({ selectedValue, toggleModal, open, handleUpdate }) {
	const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<Modal
			title={'Manage Team'}
			open={open}
			toggleModal={toggleModal}>
			<Tabs value={value} onChange={handleChange} aria-label="simple tabs example">

				<Tab label="Description" value={0} />
				<Tab label="Interactive Task" value={1} />
			</Tabs>

			<TabPanel value={value} index={0}>
				<TaskForm selectedValue={selectedValue} toggleModal={toggleModal} isEditing={true} />
			</TabPanel>

		</Modal>
	)
}


function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box p={3}>
					{children}
				</Box>
			)}
		</div>
	);
}