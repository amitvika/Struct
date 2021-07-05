import React, { useState, useEffect } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody
} from "reactstrap";
import Grid from '@material-ui/core/Grid';
import Select from '@ravibasil/common/components/atoms/Select';
import Input from '@ravibasil/common/components/atoms/Input';
import Headding from '@ravibasil/common/components/atoms/Headding';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Icon,
    CircularProgress
} from "@material-ui/core";

import MaterialAPI from '@ravibasil/common/api/material.api';

export default function MaterialModal({ toggleMaterial,
    isMaterialModalOpen,
    handleMaterialPropertieView,
    selectedMaterials, setSelectedMaterials }) {

    const [currentCategory, setCurrentCategory] = useState('')
    const [currentSubCategoryOne, setCurrentSubCategoryOne] = useState('')
    const [currentSubCategoryTwo, setCurrentSubCategoryTwo] = useState('')
    const [currentSubCategoryThree, setCurrentSubCategoryThree] = useState('')
    const [currentSubCategoryFour, setCurrentSubCategoryFour] = useState('')

    const [materialList, setMaterialList] = useState([]);
    const [filter, setFilter] = useState({});
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [categoryLevel, setCategoryLevel] = useState(0);
    const [subcategoryOptionsOne, setSubcategoryOptionsOne] = useState([]);
    const [subcategoryOptionsTwo, setSubcategoryOptionsTwo] = useState([]);
    const [subcategoryOptionsThree, setSubcategoryOptionsThree] = useState([]);
    const [subcategoryOptionsFour, setSubcategoryOptionsFour] = useState([]);
    const [isMaterialLoading, setIsMaterialLoading] = useState(false);
    const [searchMaterialByName, setSearchMaterialByName] = useState({
        name: '',
        typing: false,
        typingTimeout: 0,
    });

    useEffect(() => {
        fetchCategories(categoryLevel, (data) => {
            setCategoryOptions(data.categories.map(item => {
                return {
                    label: item.title,
                    value: item.id
                }
            }))
            setSubcategoryOptionsTwo([]);
            setSubcategoryOptionsThree([]);
            setSubcategoryOptionsFour([]);
        })
    }, [])

    const fetchCategories = (id, callback) => {
        setIsMaterialLoading(true);
        MaterialAPI.fetchCategories(`parent_id=${id}`)
            .then(res => {
                setIsMaterialLoading(false);
                if (res.data) {
                    callback(res.data)
                }
            })
            .catch(error => {

            })
    }

    const addMaterialToSelected = (data) => {
        setMaterialList(preMaterialList => {
            return preMaterialList.filter(material => material._id !== data._id);
        });

        setSelectedMaterials([...selectedMaterials, data])
    }

    const removeMaterialFromSelected = (data) => {
        setSelectedMaterials(preMaterialList => {
            return preMaterialList.filter(material => material._id !== data._id);
        });
        setMaterialList([...materialList, data])
    }

    const fetchData = ({ query = '' }) => {
        MaterialAPI.fetchMaterialApi(query)
            .then(res => {
                if (res.data) {
                    setMaterialList(res.data.docs)
                }
                console.log('Response :-', res);
            })
            .catch(error => {
                console.log('Error :-', error);
            })
        return () => {

        }
    }

    const handleChange = (name, value) => {
        setFilter(prevFilter => {
            return {
                ...prevFilter,
                [name]: value
            }
        })
    }

    const handleClearButton = () => {
        setMaterialList([])
   
    }

    const searchMaterial = () => {
        let query = []
        Object.keys(filter).forEach((key, index) => {
            if (filter[key]) {
                query.push(`${key}=${filter[key]}`)
            }
        });
        if (query.length > 0) {
            fetchData({ query: query.join('&') })
        }
    }

    const handleCategoryChange = (data) => {
        setSearchMaterialByName({ name: ''})
        setCurrentCategory(data)

        fetchCategories(data, (subCategories) => {
            if (subCategories.materials) {
                setMaterialList(subCategories.materials)
                // return;
            }

            setSubcategoryOptionsOne(subCategories.categories.map(item => {

                return {
                    label: item.title,
                    value: item.id
                }

            }))
            setSubcategoryOptionsTwo([]);
            setSubcategoryOptionsThree([])
            setSubcategoryOptionsFour([]);
        });
    }

    const handleSubCategoryOneChange = (data) => {
        setCurrentSubCategoryOne(data)
        fetchCategories(data, (subCategories) => {
            if (subCategories.materials) {
                setMaterialList(subCategories.materials)
                // return;
            }

            setSubcategoryOptionsTwo(subCategories.categories.map(item => {
                return {
                    label: item.title,
                    value: item.id
                }
            }));

            setSubcategoryOptionsThree([]);
            setSubcategoryOptionsFour([]);
        });
    }

    const handleSubCategoryTwoChange = (data) => {
        setCurrentSubCategoryTwo(data)
        fetchCategories(data, (subCategories) => {
            if (subCategories.materials) {
                setMaterialList(subCategories.materials)
                // return;
            }

            setSubcategoryOptionsThree(subCategories.categories.map(item => {
                return {
                    label: item.title,
                    value: item.id
                }
            }))

            setSubcategoryOptionsFour([]);
        });
    }

    const handleSubCategoryThreeChange = (data) => {
        console.log("----", data)
        setCurrentSubCategoryThree(data)
        fetchCategories(data, (subCategories) => {
            if (subCategories.materials) {
                setMaterialList(subCategories.materials)
                // return;
            }

            setSubcategoryOptionsFour(subCategories.categories.map(item => {

                return {
                    label: item.title,
                    value: item.id
                }
            }))
        });
    }

    const handleSubCategoryFourChange = (data) => {
        setCurrentSubCategoryFour(data)


        // fetchCategories(data, (subCategories) => {
        //     if (subCategories.materials) {
        //         setMaterialList(subCategories.materials)
        //         // return;
        //     }

        //     setSubcategoryOptionsFour(subCategories.categories.map(item => {
        //         return {
        //             label: item.title,
        //             value: item.id
        //         }
        //     }))
        // });
    }


    const handleNameChange = (event) => {
        setCurrentCategory('')
        setCurrentSubCategoryOne('')
        setCurrentSubCategoryTwo('')
        setCurrentSubCategoryThree('')
        setCurrentSubCategoryFour('')

        // setSearchName(event.target.value)
        const inputValue = event.target.value;
        if (inputValue.length < 3) {
            return;
        }

        if (searchMaterialByName.typingTimeout) {
            clearTimeout(searchMaterialByName.typingTimeout);
        }

        setSearchMaterialByName({
            name: inputValue,
            typing: false,
            typingTimeout: setTimeout(() => {
                fetchData({ query: `search=${inputValue}` });
            }, 1000),
        });

    }

    return (
        <Modal isOpen={isMaterialModalOpen} toggle={toggleMaterial} style={{ width: '50%', top: '37px' }}>
            <ModalHeader toggle={toggleMaterial}>Select Material</ModalHeader>
            <ModalBody>
                <Grid className="section-padding-left" container spacing={4}>

                    <Grid item xs={3} ><Headding title="Name Search" /></Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter"
                            type="text"
                            // value={searchMaterialByName.name}
                            onChange={(event) => handleNameChange(event)}
                        />
                    </Grid>
                    <Grid item xs={3} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<Icon>search</Icon>}
                            onClick={searchMaterial}>
                            Search
                        </Button>
                        <Button
                            style={{ marginLeft: '8px' }}
                            variant="contained"
                            color="primary"
                            type="button"
                            value="Clear"
                            onClick={handleClearButton}
                        >Clear</Button>
                    </Grid>
                    <Grid item xs={3} >
                        {isMaterialLoading &&
                            <CircularProgress />}
                    </Grid>

                    <Grid item xs={3} >
                        <Headding title='Density Range (g/cm3)'></Headding>
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Min"
                            type="number"
                            onChange={(event) => handleChange("densityMin", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Max"
                            type="number"
                            onChange={(event) => handleChange("densityMax", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} ></Grid>
                    {/* Tensile Strength */}
                    <Grid item xs={3} >
                        <Headding title='Tensile Strength (MPa)'></Headding>
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Min"
                            type="number"
                            onChange={(event) => handleChange("tensileMin", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Max"
                            type="number"
                            onChange={(event) => handleChange("tensileMax", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} ></Grid>

                    {/* Elastic Modulus (GPa) */}
                    <Grid item xs={3} >
                        <Headding title='Elastic Modulus (GPa)'></Headding>
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Min"
                            type="number"
                            onChange={(event) => handleChange("elasticMin", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Max"
                            type="number"
                            onChange={(event) => handleChange("elasticMax", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} ></Grid>

                    {/* Yield Strength (MPa) */}
                    <Grid item xs={3} >
                        <Headding title='Yield Strength (MPa)'></Headding>
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Min"
                            type="number"
                            onChange={(event) => handleChange("yieldMin", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Max"
                            type="number"
                            onChange={(event) => handleChange("yieldMax", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} ></Grid>

                    {/* Flexural Modulus(GPa) */}
                    <Grid item xs={3} >
                        <Headding title='Flexural Modulus(GPa)'></Headding>
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Min"
                            type="number"
                            onChange={(event) => handleChange("flexuralMin", event.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3} >
                        <Input
                            placeholder="Enter Max"
                            type="number"
                            onChange={(event) => handleChange("flexuralMax", event.target.value)}
                        />
                    </Grid>
                </Grid>


                <Grid className="section-padding-left" container spacing={4}>
                    <>
                        <Grid item xs={3} >
                            <Headding title='Category'></Headding>
                        </Grid>
                        <Grid item xs={6} >
                            {/* {
                                !isSearchNameActive && */}

                            <Select
                                // label="Category"
                                placeholder="Select"
                                options={categoryOptions}
                                onChange={(data) => handleCategoryChange(data.value)}
                                value={`${currentCategory}`}
                            />
                            {/* } */}
                        </Grid>
                        <Grid item xs={3} />
                    </>
                    {
                        subcategoryOptionsOne.length > 0 &&
                        <>
                            <Grid item xs={3} >
                                <Headding title='Sub Category 1'></Headding>
                            </Grid>
                            <Grid item xs={6} >
                                <Select
                                    // label="Sub Category"
                                    placeholder="Select"
                                    options={subcategoryOptionsOne}
                                    onChange={(data) => handleSubCategoryOneChange(data.value)}
                                    value={`${currentSubCategoryOne}`}
                                />
                            </Grid>
                            <Grid item xs={3} />
                        </>
                    }

                    {
                        subcategoryOptionsTwo.length > 0 &&
                        <>
                            <Grid item xs={3} >
                                <Headding title='Sub Category 2'></Headding>
                            </Grid>
                            <Grid item xs={6} >
                                <Select
                                    // label="Sub Category"
                                    placeholder="Select"
                                    options={subcategoryOptionsTwo}
                                    onChange={(data) => handleSubCategoryTwoChange(data.value)}
                                    value={`${currentSubCategoryTwo}`}
                                />
                            </Grid>
                            <Grid item xs={3} />
                        </>
                    }

                    {
                        subcategoryOptionsThree.length > 0 &&
                        <>
                            <Grid item xs={3} >
                                <Headding title='Sub Category 3'></Headding>
                            </Grid>
                            <Grid item xs={6} >
                                <Select
                                    // label="Sub Category"
                                    placeholder="Select"
                                    options={subcategoryOptionsThree}
                                    onChange={(data) => handleSubCategoryThreeChange(data.value)}
                                    value={`${currentSubCategoryThree}`}
                                />
                            </Grid>
                            <Grid item xs={3} />
                        </>
                    }

                    {
                        subcategoryOptionsFour.length > 0 &&
                        <>
                            <Grid item xs={3} >
                                <Headding title='Sub Category 4'></Headding>
                            </Grid>
                            <Grid item xs={6} >
                                <Select
                                    // label="Sub Category"
                                    placeholder="Select"
                                    options={subcategoryOptionsFour}
                                    onChange={(data) => handleSubCategoryFourChange(data.value)}
                                    value={`${currentSubCategoryFour}`}

                                />
                            </Grid>
                            <Grid item xs={3} />
                        </>
                    }
                </Grid>

                <div>
                    <h5 className="mt-2">Selected Material</h5>
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
                                            <TableCell onClick={() => removeMaterialFromSelected(materialRow)}>
                                                {materialRow.name}
                                            </TableCell>
                                            <TableCell style={{ cursor: 'pointer' }} onClick={() => handleMaterialPropertieView(materialRow)}>View Material Properties</TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <h5>Select Material</h5>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>S No</TableCell>
                                    <TableCell>Material Name</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {materialList.map(materialRow => (
                                    <TableRow
                                        key={materialRow._id}>
                                        <TableCell>{materialRow._id}</TableCell>
                                        <TableCell
                                            onClick={() => addMaterialToSelected(materialRow)}>{materialRow.name}</TableCell>
                                        <TableCell style={{ cursor: 'pointer' }} onClick={() => handleMaterialPropertieView(materialRow)}>View Material Properties</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </ModalBody>
        </Modal >
    )
}
