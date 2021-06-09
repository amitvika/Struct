import React from 'react'
import AppNavbar from '../containers/AppNavbar';
import Header from './Header';

export default function Layout(props) {
    return (
        < >
            {/* <AppNavbar/> */}
            <Header />
            <div style={{ marginTop: '75px' }}>
                {props.children}
            </div>
        </>
    )
}
