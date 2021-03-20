import React from 'react'
import Layout from './components/Layout'
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";

import Home from './pages/home'

export default function DashboardRoutes() {
    return (
        <Layout>
            <Switch>
                <Route path="/" component={Home} />
                
            </Switch>
        </Layout>
    )
}
