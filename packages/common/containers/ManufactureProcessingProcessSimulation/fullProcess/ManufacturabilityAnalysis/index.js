import React, { useState, useEffect } from 'react';
import MaterialTable, { MTableToolbar } from 'material-table';
import { Grid, Paper, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import CollapseTab from './CollapseTab';

export default function ManufacturabilityAnalysis() {
  return (
    <div>
      <CollapseTab />
    </div>
  );
}
