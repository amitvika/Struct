import React, { useState } from 'react'
import Grid from '@mui/material/Grid';
import Input from '@monostruct/common/components/atoms/Input';
import Headding from '@monostruct/common/components/atoms/Headding';

export default function ChooseTools() {
    const [data, setData] = useState({});
    const handleOnChange = (name, value) => {
        setData(prev => ({ ...prev, [name]: value }))
    }
    return (
        <div>
            <Grid className="section-padding-left" container spacing={4}>
                <Grid item xs={4}>
                    <Headding bold title={'Length (inches)'} />
                </Grid>
                <Grid item xs={8}>
                    <Input
                        placeholder="Enter"
                        type="number"
                        onChange={(event) => handleOnChange('setupWorkPlaneLength', event.target.value)}
                        value={data.setupWorkPlaneLength}
                    />
                </Grid>

                <Grid item xs={4}>
                    <Headding bold title={'Width (inches)'} />
                </Grid>
                <Grid item xs={8}>
                    <Input
                        placeholder="Enter"
                        type="number"
                        onChange={(event) =>
                            handleOnChange('setupWorkPlaneWidth', event.target.value)
                        }
                        value={data.setupWorkPlaneWidth}
                    />
                </Grid>
            </Grid>

        </div>
    )
}
