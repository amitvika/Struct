import React from 'react'
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

import Home from './pages/home'

export default function DashboardRoutes() {
    return (
        <>
            <Switch>
                <Route path="/" component={Home} />
                
            </Switch>
        </>
    )
}
