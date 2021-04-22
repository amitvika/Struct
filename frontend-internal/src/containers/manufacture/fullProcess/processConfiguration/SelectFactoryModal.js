import React, { useState, useEffect } from 'react'
import MainModal from '../../../../components/Modal';
import FactoriesAPI from '../../../../api/factories.api';
import get from 'lodash/get';
import Select from '../../../../components/atoms/Select';
import Headding from '../../../../components/atoms/Headding'
import { Paper, Grid, Button } from '@material-ui/core';

export default function SelectFactoryModal({ isModalOpened, toggleModal, selectedValue, setSelectedValue, assignFactory }) {
    const [factoriesOptions, setfactoriesOptions] = useState([]);

    useEffect(() => {
        FactoriesAPI.fetchFactories()
            .then(res => {
                setfactoriesOptions(getOptions(get(res, 'data', [])));

            })
        return () => {

        }
    }, []);

    const handleChange = (data) => {
        setSelectedValue(prev => ({ ...prev, factory_id: data.value }))
    }

    const getOptions = (data) => {
        return data.map(item => {
            return ({
                label: item.name,
                value: item._id
            })
        })
    }

    const getValue = () => {
        return ({ value: `${selectedValue.factory_id}` })
    }

    return (
        <MainModal open={isModalOpened} toggleModal={toggleModal}>

            <Grid className="section-padding-left" container spacing={4}>

                <Grid item xs={4} >
                    <Headding bold title={'Select Factory'} />
                </Grid>
                <Grid item xs={8} >
                    <Select
                        onChange={(data) => handleChange(data)}
                        options={factoriesOptions}
                        placeholder={`Select Factory`}
                        value={`${selectedValue.factory_id}`} />
                </Grid>
                <Grid item xs={4} style={{ textAlign: 'center' }}>
                    <Button
                        style={{ marginTop: '20px' }}
                        variant="contained"
                        color="primary"
                        type="button"
                        onClick={() => assignFactory(selectedValue)}>
                        OK
                    </Button>
                </Grid>
            </Grid>
        </MainModal>
    )
}
