import React, { useState, useEffect } from 'react'
import {
	Button,
	Snackbar,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Icon,
} from "@material-ui/core";
import { Tooltip } from 'reactstrap';
import Grid from '@material-ui/core/Grid';

import Select from '../../../components/atoms/Select';
import Input from '../../../components/atoms/Input';
import Headding from '../../../components/atoms/Headding';
import Checkbox from '../../../components/atoms/Checkbox';
import MaterialModal from './MaterialModal';
import MaterialPropertiesModal from './MaterialPropertiesModal';

export default function GeometryInput({ itemProperties = {}, setItemProperties }) {
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

	const itemGeometry = itemProperties.itemGeometry || {}

	const [materialProperties, setMaterialProperties] = useState({});
	const [selectedMaterials, setSelectedMaterials] = useState(itemGeometry.materials || []);
	// const [materialSelected, ]

	const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
	const toggleMaterial = () => {
		setIsMaterialModalOpen(prevValue => {
			return !prevValue;
		})
	}

	const [isMaterialPropertiesModalOpen, setIsMaterialPropertiesModalOpen] = useState(false);
	const toggleMaterialProperties = () => {
		setIsMaterialPropertiesModalOpen(prevValue => {
			return !prevValue;
		})
	}

	const handleMaterialPropertieView = (material) => {
		setIsMaterialPropertiesModalOpen(true);
		setMaterialProperties(material);
	}

	const handleOnChange = (name, value) => {
		setItemProperties(prevData => ({
			...prevData,
			itemGeometry: {
				...itemGeometry,
				[name]: value
			}
		}))
	}

	useEffect(() => {
		setItemProperties(prevProps => {
			return {
				...prevProps,
				itemGeometry: {
					...itemGeometry,
					materials: selectedMaterials
				}
			}
		})
		return () => {

		}
	}, [selectedMaterials])

	return (
		<Paper style={{ padding: 20, margin: 10 }}>
			<MaterialModal
				toggleMaterial={toggleMaterial}
				isMaterialModalOpen={isMaterialModalOpen}
				materialProperties={materialProperties}
				handleMaterialPropertieView={handleMaterialPropertieView}
				selectedMaterials={selectedMaterials}
				setSelectedMaterials={setSelectedMaterials}
			/>
			<MaterialPropertiesModal
				toggleMaterialProperties={toggleMaterialProperties}
				isMaterialPropertiesModalOpen={isMaterialPropertiesModalOpen}
				materialProperties={materialProperties}
				setMaterialProperties={setMaterialProperties}
			/>
			<Headding fontSize={24} bold title={'Item Properties'} />

			<Paper style={{ padding: 20, margin: 10 }}>
				<Grid className="section-padding-left" container spacing={4}>
					<Grid item xs={4}>
						<Headding fontSize={20} bold title={'Item Material'} />
					</Grid>
					<Grid item xs={8} >
						<Button
							size="large"
							variant="contained"
							color="primary"
							disabled={itemProperties.assemblyType === 'Multi-Item Assembly'}
							onClick={toggleMaterial}>
							Select Material
            </Button>
					</Grid>
					{
						selectedMaterials.length > 0 &&
						(
							<Grid item xs={12}>
								<Headding bold title={'Selected Materials'} />

								<TableContainer className="mb-2" component={Paper}>
									<Table aria-label="simple table">
										<TableHead>
											<TableRow>
												<TableCell>S No</TableCell>
												<TableCell>Material Name</TableCell>
												<TableCell></TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{
												selectedMaterials.map(materialRow => (
													<TableRow
														key={materialRow._id}
													>
														<TableCell>{materialRow._id}</TableCell>
														<TableCell >
															{materialRow.name}
														</TableCell>
														<TableCell style={{ cursor: 'pointer' }} onClick={() => handleMaterialPropertieView(materialRow)}>View Material Properties</TableCell>
													</TableRow>
												))
											}
										</TableBody>
									</Table>
								</TableContainer>
							</Grid>
						)
					}

				</Grid>
			</Paper>

			<Paper style={{ padding: 20, margin: 10 }}>
				<Grid className="section-padding-left" container spacing={4}>
					<Grid item xs={12}>
						<Headding fontSize={20} bold title={'Item Category Details'} />
					</Grid>

					<Grid item xs={4}>
						<Headding bold title={'Single Item Part or Multi-Item Assembly'} />
					</Grid>
					<Grid item xs={8}>
						<span>{itemProperties.assemblyType}</span>
					</Grid>

					<Grid item xs={4}>
						<Headding bold title={'Item Type'} />
					</Grid>
					<Grid item xs={8}>
						<Select
							// label="Item Type"
							placeholder="Select"
							options={[
								{ label: "Other", value: "Other" },
								{ label: 'Machine - Actuator', value: 'Machine - Actuator' },
								{ label: 'Machine - Motion Control', value: 'Machine - Motion Control' },
								{ label: 'Machine - Tool/Workholding', value: 'Machine - Tool/Workholding' },
								{ label: "Machine - Workpiece Environment Modification", value: "Machine - Workpiece Environment Modification" },
								{ label: "Workholding - Pressure Vessel", value: "Workholding - Pressure Vessel" },
								{ label: "Workholding - Liquid Container", value: "Workholding - Liquid Container" },
								{ label: "Tool", value: "Tool" },
								{ label: "Machine - Tool", value: "Machine - Tool" },
								{ label: "Unassembled Kit", value: "Unassembled Kit" },
								{ label: "Structure", value: 'Structure' }
							]}
							onChange={(data) => handleOnChange('itemType', data.value)}
							value={itemGeometry.itemType && { label: itemGeometry.itemType }}
						/>
					</Grid>

					<Grid item xs={4} style={{ display: 'flex' }} >
						<Headding bold title={'Item Category'}>
						</Headding>
						<Icon style={{ marginLeft: '18px' }} id="TooltipExample">info</Icon>
						<Tooltip placement="top" isOpen={tooltipOpen} target="TooltipExample" toggle={toggleTooltip}>
							This allows for selection of the general geometry or matter state of the item. The downstream impacts include how the item is handled and transported within Struct Production Systems
            </Tooltip>
					</Grid>
					<Grid item xs={8} >
						<Select
							// label="General Geometry"
							placeholder="Select"
							options={[

								{ label: ' Solid', value: ' Solid' },
								{ label: "Bulk Powder/Particles/Grains", value: "Bulk Powder/Particles/Grains" },
								{ label: "Liquid", value: "Liquid" },
								{ label: "Gas", value: "Gas" }]}
							onChange={(data) => handleOnChange('generalGeomerty', data.value)}
							value={itemGeometry.generalGeomerty && { label: itemGeometry.generalGeomerty }}
						/>
					</Grid>


					{itemGeometry.generalGeomerty === 'Bulk Powder/Particles/Grains' &&
						<>
							<Grid item xs={4}>
								<Headding bold title={'Mixture'} />
							</Grid>
							<Grid item xs={8}>
								<Select
									// label="Mixture"
									placeholder="Select"
									options={[
										{ label: "Yes", value: "Yes" },
										{ label: "No", value: "No" }]}
									onChange={(data) => handleOnChange('mixture', data.value)}
									value={itemGeometry.mixture && { label: itemGeometry.mixture }}
								/>
							</Grid>
						</>
					}
				</Grid>

			</Paper>
			{
				itemGeometry.generalGeomerty === 'Bulk Powder/Particles/Grains' &&
				<Paper style={{ padding: 20, margin: 10 }}>
					<Grid className="section-padding-left" container spacing={4}>
						<Grid item xs={12}>
							<Headding size={10} bold title={'Dimensional Properties'} />
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'X Dim (Length)'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="X Dim (Length)"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('xDim', event.target.value)}
								value={itemGeometry.xDim}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'X Tolerance'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="X Tolerance"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('xTolerance', event.target.value)}
								value={itemGeometry.xTolerance}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Y Dim (Length)'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Y Dim (Length)"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('yDim', event.target.value)}
								value={itemGeometry.yDim}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Y Tolerance'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Y Tolerance"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('yTolerance', event.target.value)}
								value={itemGeometry.yTolerance}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Z Dim (Length)'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Z Dim (Length)"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('zDim', event.target.value)}
								value={itemGeometry.zDim}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Z Tolerance'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Z Tolerance"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('zTolerance', event.target.value)}
								value={itemGeometry.zTolerance}
							/>
						</Grid>
					</Grid>
				</Paper>
			}

			{
				['Solid'].includes(itemGeometry.generalGeomerty) &&
				<Paper style={{ padding: 20, margin: 10 }}>
					<Grid className="section-padding-left" container spacing={4}>
						<Grid item xs={12}>
							<Headding size={10} bold title={'Dimensional Properties'} />
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Mass (g)'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Mass (g)"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('mass', event.target.value)}
								value={itemGeometry.mass}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Volume (mm^3)'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Volume (mm^3)"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('volume', event.target.value)}
								value={itemGeometry.volume}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Bounding Box x (mm)'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Bounding Box x (mm)"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('boundingBoxX', event.target.value)}
								value={itemGeometry.boundingBoxX}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Bounding Box y (mm)'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Bounding Box y (mm)"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('boundingBoxY', event.target.value)}
								value={itemGeometry.boundingBoxY}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Bounding Box z (mm)'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Bounding Box z (mm)"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('boundingBoxZ', event.target.value)}
								value={itemGeometry.boundingBoxZ}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Number of Faces'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Number of Faces"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('numberOfFaces', event.target.value)}
								value={itemGeometry.numberOfFaces}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Number of Edges'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Number of Edges"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('numberOfEdges', event.target.value)}
								value={itemGeometry.numberOfEdges}
							/>
						</Grid>

						<Grid item xs={4}>
							<Headding bold title={'Number of Corners'} />
						</Grid>
						<Grid item xs={8}>
							<Input
								// label="Number of Corners"
								placeholder="Enter"
								type="number"
								onChange={(event) => handleOnChange('numberOfCorners', event.target.value)}
								value={itemGeometry.numberOfCorners}
							/>
						</Grid>
					</Grid>
				</Paper>
			}
		</Paper >
	)
}
