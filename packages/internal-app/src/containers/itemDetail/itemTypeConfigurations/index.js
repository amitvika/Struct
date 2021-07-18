import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import DynamicCriteria from './DynamicCriteria';
import DynamicHierarchy from './DynamicHierarchy';

export default function Index() {

    return (
        <div>
            <DynamicHierarchy />
            {/* <DynamicCriteria /> */}

        </div>
    )
}