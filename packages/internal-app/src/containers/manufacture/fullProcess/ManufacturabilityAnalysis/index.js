import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";
import { Grid, Paper, Tab, Tabs } from "@material-ui/core";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CollapseTab from './CollapseTab';

export default function ManufacturabilityAnalysis() {

    return (
        <div>
            <CollapseTab />
        </div>
    )
}
