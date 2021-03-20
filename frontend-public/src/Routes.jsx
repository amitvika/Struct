import React from 'react';
import MyMachines from './containers/MyMachines/index'
import MyFactoryFloor from './containers/MyFactoryFloor/index' 
import MyMachinesDetail from './containers/MyMachineDetail'
import MyFactoryFloorDetail from './containers/MyFactoryFloorDetail'
import Dashborad from './containers/Dashboard';
import Manufacture from './containers/Manufacture';
import Purchases from './containers/Purchaches';
import Billing from './containers/Billing'

const Routes = [
  
  {
    path: '/dashboard',
    component: Dashborad
  },
  {
    path: '/myMachines',
    sidebarName: 'My Machines',
    component: MyMachines
  },
  {
    path: '/myFactoryFloor',
    sidebarName: 'My Factory Floor',
    component: MyFactoryFloor
  },
  
  {
    path: '/manufacture',
    sidebarName: 'Manufacture ',
    component: Manufacture
  },
  {
    path: '/purchases',
    sidebarName: 'Purchases ',
    component: Purchases
  }, {
    path: '/billing',
    sidebarName: 'Billing ',
    component: Billing

  },
  {
    path: '/myMachineDetail',
    // sidebarName: 'My Machine Datail ',
    component: MyMachinesDetail
  },
  {
    path: '/myFactoryFloorDetail',
    // sidebarName: 'My Factory Floor  Detail ',
    component: MyFactoryFloorDetail
  },


];

export default Routes;