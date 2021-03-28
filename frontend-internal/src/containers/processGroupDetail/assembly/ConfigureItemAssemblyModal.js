import React, { useState } from 'react'
import {
	Modal,
	ModalHeader,
	ModalBody
} from "reactstrap";
import {
	Button,
	Grid,
	Radio
} from "@material-ui/core";
import {
	Select,
	Headding,
	ThreejsViewer,
	Space
} from '../../../components';

import { Link } from 'react-router-dom';

export default function ConfigureItemAssembly({
	toggleConfigureItemAssembly,
	isConfigureItemAssemblyModalOpen,
	toggleItemSelection,
	selectedAssemblySequence,
	handleUpdateAssemblySequence
}) {
	const [threejsObject, setThreejsObject] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [fasteningMethod, setFasteningMethod] = useState([])

	return (
		<Modal isOpen={isConfigureItemAssemblyModalOpen} toggle={toggleConfigureItemAssembly} style={{ width: '70%' }}>
			<ModalHeader toggle={toggleConfigureItemAssembly}>Configure Item Assembly</ModalHeader>
			<ModalBody style={{ minHeight: 400 }}>
				<Grid className="section-padding-left" container spacing={2}>
					<Grid item xs={8} >
						<ThreejsViewer data={threejsObject} isLoading={isLoading} />
					</Grid>

					<Grid item xs={4} >
						<Grid item xs={12} >
							<Button
								size="large"
								variant="contained"
								color="primary"
								onClick={toggleItemSelection}>
								Select Item
            </Button>
						</Grid>

						<Grid item xs={12}>
							{
								selectedAssemblySequence?.itemId &&
								(
									<Grid item xs={12} style={{ display: 'flex' }}>
										<Headding title={'Selected Item: '} />
										<Link target="_blank" to={`/items/${selectedAssemblySequence?.itemId?._id}`}>{selectedAssemblySequence?.itemId?.name}</Link>
									</Grid>
								)
							}
						</Grid>

						<Space size={20} />
						<Grid item xs={12} >
							<Select
								label={'Fastening Method(s):'}
								placeholder="Select"
								isMulti
								options={[
									{ label: 'Placement/None', value: 'Placement/None' },
									{ label: 'Interference Fit', value: 'Interference Fit' },
									{ label: 'Screw', value: 'Screw' },
									{ label: 'Nut/Bolt', value: 'Nut/Bolt' },
									{ label: 'Snap Fit', value: 'Snap Fit' },
									{ label: 'Adhesive Joint', value: 'Adhesive Joint' },
									{ label: 'Weld', value: 'Weld' },
									{ label: 'Brazing', value: 'Brazing' }
								]}
								onChange={data => handleUpdateAssemblySequence({ fasteningMethods: data })}
							/>
						</Grid>
						<Space size={20} />
						{
							selectedAssemblySequence?.fasteningMethods && selectedAssemblySequence?.fasteningMethods.map(fs => {
								return (
									<Grid item xs={12} style={{ display: 'flex' }}>
										<Grid item xs={6} style={{ alignItems: 'center', display: 'flex' }}>
											<Headding title={fs}></Headding>
										</Grid>
										<Grid item xs={6}>
											<Radio
												value={fs}
												name="radio-button-demo"
												inputProps={{ 'aria-label': 'A' }}
											/>
										</Grid>
									</Grid>
								)
							})
						}

					</Grid>

				</Grid>
			</ModalBody>
		</Modal>
	)
}
