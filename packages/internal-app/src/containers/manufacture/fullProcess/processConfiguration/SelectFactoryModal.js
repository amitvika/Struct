import React, { useState, useEffect } from 'react'
import get from 'lodash/get';
import MainModal from '@ravibasil/common/components/Modal';
import FactoriesAPI from '@ravibasil/common/api/factories.api';
import Select from '@ravibasil/common/components/atoms/Select';
import Headding from '@ravibasil/common/components/atoms/Headding'
import { Paper, Grid, Button } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import SelectorView from '@ravibasil/common/components/SelectorView';

export default function SelectFactoryModal({ isModalOpened,fields, toggleModal, selectedValue = {},
     setSelectedValue, assignFactory,itemId,itemProperties,setItemProperties,fetchList }) {
    const [factoriesOptions, setfactoriesOptions] = useState([])
    const dispatch = useDispatch();

    useEffect(() => {
        FactoriesAPI.fetchFactories()
            .then(res => {
                setfactoriesOptions(getOptions(get(res, 'data', [])));

            })
        return () => {

        }
    }, []);

    const handleChange = (data) => {
        // console.log("-----",selectedValue.factory_id)
        console.log('-----',data)
        setSelectedValue(prev => ({ ...prev, factory_id: data.value}))
   
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
                <Grid item xs={4} >
                    <Headding bold title={'Quantity'} />
                </Grid>
                <Grid item xs={8} >
                   {selectedValue.quantity}
                </Grid>


                {/* <SelectorView
						title={'Factory'}
						fetchList={fetchList}
						fetchSelectedList={itemProperties}
						fields={fields}
						// mapValues={mapItems}
						handleUpdate={setItemProperties}
						handleSelection={(data) => setSelectedValue(data)}
					/> */}
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
