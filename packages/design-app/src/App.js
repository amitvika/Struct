import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch
} from 'react-router-dom';
import Layout from './components/Layout';
import Design from './page/design';
import Home from './page/home'

function App() {
    return (
        <div>
            <Router>
                <Layout>
                    <Switch>
                        {/* <Route exact path='/' component={Home}></Route> */}
                        <Route exact path='/' component={Design}></Route>
                    </Switch>
                </Layout>
            </Router>
        </div>
    );
}

export default App;
