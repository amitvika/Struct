import React from 'react'
import GridCards from '../GridCards'

export default function MyMachines(props) {
    return (
        <div style={{display: "block"}}>
           
            <GridCards detailLink={"/myMachineDetail"}/>
        </div>
    )
}
