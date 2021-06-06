import React, { Component } from "react";
import MaterialTable from "material-table";
import { connect } from "react-redux";
import { Spinner } from "reactstrap";
import Card from "@material-ui/core/Card";
import { changePage } from "../actions/pageActions";
import Checkbox from "@material-ui/core/Checkbox";
import InfoIcon from "@material-ui/icons/Info";
import CardContent from "@material-ui/core/CardContent";
import OperationAccess from "../containers/viewAccess/OperationAccess";
import ClientObjectAccess from "../containers/viewAccess/ClientObjectAccess";
import ClientBasedAccess from "../containers/viewAccess/ClientBasedAccess";
import AccessConfig from '../api/accessConfig.api';
import { fetchClientsApi } from '../api/access.api';

class ViewAccess extends Component {
	state = {
		modal: false,
		rowData1: [],
		tableLoaded: true,
		userAccessLoaded: true,
		userAccessName: "",
		userAccessId: 0,
		msg: "",
		snackBar: false,
		snackBarAlertType: "",

		//userAccessUsers: {},
		OA_1_E: false,
		OA_1_V: false,
		OA_2_E: false,
		OA_2_V: false,

		COA_1_E: false,
		COA_1_V: false,
		COA_2_E: false,
		COA_2_V: false,
		COA_3_E: false,
		COA_3_V: false,

		PGOA_1_E: false,
		PGOA_1_V: false,
		PGOA_2_E: false,
		PGOA_2_V: false,
		PGOA_3_E: false,
		PGOA_3_V: false,

		IOA_1_E: false,
		IOA_1_V: false,
		IOA_2_E: false,
		IOA_2_V: false,
		IOA_3_E: false,
		IOA_3_V: false,

		POA_1_E: false,
		POA_1_V: false,
		POA_2_E: false,
		POA_2_V: false,
		POA_3_E: false,
		POA_3_V: false,
		POA_4_E: false,
		POA_4_V: false,
		POA_5_E: false,
		POA_5_V: false,
		POA_6_E: false,
		POA_6_V: false,
		clientList: []
	};


	componentDidMount() {
		this.retrieveUserAccessFromDb();
		this.retrieveClientsFromDb();
	}

	retrieveUserAccessFromDb = () => {
		this.setState(state => ({
			userAccessLoaded: false
		}));
		console.log('----this.props.auth.user', this.props.auth.user)

		AccessConfig
			.getViewUserAccessConfiguration()
			.then(res => {
				//console.log(res.data._id);
				if (res.data.access == null) {
					this.setState(state => ({
						userAccessLoaded: true,
						userAccessName: res.data.name,
						userAccessId: res.data._id
					}));
				} else {
					this.setState(state => ({
						...res.data.access,
						userAccessLoaded: true,
						userAccessName: res.data.name,
						userAccessId: res.data._id,
						OA_1_E: res.data.access.OA_1_E,
						OA_1_V: res.data.access.OA_1_V,
						OA_2_E: res.data.access.OA_2_E,
						OA_2_V: res.data.access.OA_2_V,

						COA_1_E: res.data.access.COA_1_E,
						COA_1_V: res.data.access.COA_1_V,
						COA_2_E: res.data.access.COA_2_E,
						COA_2_V: res.data.access.COA_2_V,
						COA_3_E: res.data.access.COA_3_E,
						COA_3_V: res.data.access.COA_3_V,

						IOA_1_E: res.data.access.IOA_1_E,
						IOA_1_V: res.data.access.IOA_1_V,
						IOA_2_E: res.data.access.IOA_2_E,
						IOA_2_V: res.data.access.IOA_2_V,
						IOA_3_E: res.data.access.IOA_3_E,
						IOA_3_V: res.data.access.IOA_3_V,

						PGOA_1_E: res.data.access.PGOA_1_E,
						PGOA_1_V: res.data.access.PGOA_1_V,
						PGOA_2_E: res.data.access.PGOA_2_E,
						PGOA_2_V: res.data.access.PGOA_2_V,
						PGOA_3_E: res.data.access.PGOA_3_E,
						PGOA_3_V: res.data.access.PGOA_3_V,

						POA_1_E: res.data.access.POA_1_E,
						POA_1_V: res.data.access.POA_1_V,
						POA_2_E: res.data.access.POA_2_E,
						POA_2_V: res.data.access.POA_2_V,
						POA_3_E: res.data.access.POA_3_E,
						POA_3_V: res.data.access.POA_3_V,
						POA_4_E: res.data.access.POA_4_E,
						POA_4_V: res.data.access.POA_4_V,
						POA_5_E: res.data.access.POA_5_E,
						POA_5_V: res.data.access.POA_5_V,
						POA_6_E: res.data.access.POA_6_E,
						POA_6_V: res.data.access.POA_6_V
					}));
				}
			})
			.catch(err => console.log(err));
	};

	retrieveClientsFromDb = access => {

		fetchClientsApi()
			.then(res => {
				if (res.data) {
					this.setState(state => ({
						clientList: res.data
					}));
				}
			})
			.catch(err => console.log(err));
	};

	render() {
		return (
			<>
				<div>
					{this.state.tableLoaded && this.state.userAccessLoaded ? (
						<div>
							<Card className="mb-2">
								<CardContent>
									<div
										style={{
											display: "flex",
											justifyContent: "center"
										}}
									>
										<h4>{this.props.auth.user !== null && this.props.auth.user?.userAccess?.name} </h4>
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "center"
										}}
									>
										<p>Access Setup ID: {this.props.auth.user !== null && this.props.auth.user?.userAccess?._id}</p>
									</div>

									<div
										style={{
											display: "flex",
											justifyContent: "center"
										}}
									>
										{/* <UserAccessModal userAccessState={this.state} />*/}
									</div>
								</CardContent>
							</Card>

							<OperationAccess
								access={this.state}
							/>

							<div className="mb-2"> </div>
							<ClientBasedAccess
								userAccessLoaded={this.state.userAccessLoaded}
								access={this.state}
								clientList={this.state.clientList}
							/>
							<div className="mb-2"></div>
							<ClientObjectAccess
								access={this.state}
							/>

							<div className="mb-2"> </div>

							<MaterialTable
								columns={[
									{ title: "Description", field: "desc" },
									{ title: "Add/Edit/Delete Access", field: "edit" },
									{ title: "View Access", field: "view" }
								]}
								options={{
									search: false,
									pageSize: 3,
									paging: false
								}}
								data={[
									{
										desc: (
											<div title="Allows access to Process Group objects created by self and users">
												<InfoIcon />
                      Process Groups
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="PGOA_1_E"
												checked={this.state.PGOA_1_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="PGOA_1_V"
												checked={this.state.PGOA_1_V}
											/>
										)
									},
									{
										desc: (
											<div title="Allows access to Process Group object details created by self and users">
												<InfoIcon />
                      Process Group Details
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="PGOA_2_E"
												checked={this.state.PGOA_2_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="PGOA_2_V"
												checked={this.state.PGOA_2_V}
											/>
										)
									},
									{
										desc: (
											<div title="Allows access to Process Group objects and Process Group details if it is created by self regardless of above Process Group object and Process Group detail configurations">
												<InfoIcon />
                      Self Created Process Groups and Details
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="PGOA_3_E"
												checked={this.state.PGOA_3_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="PGOA_3_V"
												checked={this.state.PGOA_3_V}
											/>
										)
									}
								]}
								title={<h5>Process Group Object Access</h5>}
							/>
							<div className="mb-2"></div>
							<MaterialTable
								columns={[
									{ title: "Description", field: "desc" },
									{ title: "Add/Edit/Delete Access", field: "edit" },
									{ title: "View Access", field: "view" }
								]}
								options={{
									search: false,
									pageSize: 3,
									paging: false
								}}
								data={[
									{
										desc: (
											<div title="Allows access to Item objects created by self and users">
												<InfoIcon />
                      Items (Sourced Items)
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="IOA_1_E"
												checked={this.state.IOA_1_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="IOA_1_V"
												checked={this.state.IOA_1_V}
											/>
										)
									},
									{
										desc: (
											<div title="Allows access to Item object details created by self and users">
												<InfoIcon />
                      Items (Sourced Items) Details
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="IOA_2_E"
												checked={this.state.IOA_2_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="IOA_2_V"
												checked={this.state.IOA_2_V}
											/>
										)
									},
									{
										desc: (
											<div title="Allows access to Item objects and Item details if it is created by self regardless of above Item object and Item detail configurations">
												<InfoIcon />
                      Self Created Items (Sourced Items) and Details
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="IOA_3_E"
												checked={this.state.IOA_3_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="IOA_3_V"
												checked={this.state.IOA_3_V}
											/>
										)
									}
								]}
								title={<h5>Item Object Access</h5>}
							/>
							<div className="mb-2"></div>
							<MaterialTable
								columns={[
									{ title: "Description", field: "desc" },
									{ title: "Add/Edit/Delete Access", field: "edit" },
									{ title: "View Access", field: "view" }
								]}
								options={{
									search: false,
									pageSize: 6,
									paging: false
								}}
								data={[
									{
										desc: (
											<div title="Allows access to Process objects and Process details if it is created by self regardless of above Process object and Process detail configurations">
												<InfoIcon />
                      Self Created Processes
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_1_E"
												checked={this.state.POA_1_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_1_V"
												checked={this.state.POA_1_V}
											/>
										)
									},
									{
										desc: (
											<div title="Allows access to Process: Machining objects created by self and users">
												<InfoIcon />
                      Process: Machining
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_2_E"
												checked={this.state.POA_2_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_2_V"
												checked={this.state.POA_2_V}
											/>
										)
									},
									{
										desc: (
											<div title="Allows access to Process: Casting objects created by self and users">
												<InfoIcon />
                      Process: Casting
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_3_E"
												checked={this.state.POA_3_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_3_V"
												checked={this.state.POA_3_V}
											/>
										)
									},
									{
										desc: (
											<div title="Allows access to Process: Assembly objects created by self and users">
												<InfoIcon />
                      Process: Assembly
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_4_E"
												checked={this.state.POA_4_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_4_V"
												checked={this.state.POA_4_V}
											/>
										)
									},

									{
										desc: (
											<div title="Allows access to Process: PCBs objects created by self and users">
												<InfoIcon />
                      Process: PCBs
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_5_E"
												checked={this.state.POA_5_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_5_V"
												checked={this.state.POA_5_V}
											/>
										)
									},
									{
										desc: (
											<div title="Allows access to Process: ICs objects created by self and users">
												<InfoIcon />
                      Process: ICs
											</div>
										),
										edit: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_6_E"
												checked={this.state.POA_6_E}
											/>
										),
										view: (
											<Checkbox
												//checked={true}
												color="primary"
												name="POA_6_V"
												checked={this.state.POA_6_V}
											/>
										)
									}
								]}
								title={<h5>Process Object Access</h5>}
							/>
						</div>
					) : (
							<div
								style={{
									display: "flex",
									justifyContent: "center"
								}}
							>
								<Spinner animation="border" />
							</div>
						)}
				</div>
			</>
		);
	}
}

const mapStateToProps = state => ({
	page: state.page,
	auth: state.auth,
	userAccessUsers: state.userAccessUsers
});

export default connect(mapStateToProps, { changePage })(ViewAccess);
