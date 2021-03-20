import React from 'react'
import GridCards from '../GridCards'
import MyFactoryFloorDetail from '../MyFactoryFloorDetail'

export default function MyFactoryFloor(props) {
    return (
        <div style={{ display: "block" }}>
            <GridCards detailLink={"/myFactoryFloorDetail"} />
        </div>
    )
}
