import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';
import Layout from './components/Layout';
import Design from './page/design';
import ThemeProvider from './ThemeProvider';

function App() {
    return (
        <div>
            <ThemeProvider>
                <Router>
                    <Layout>
                        <Switch>
                            {/* <Route exact path='/' component={Home}></Route> */}
                            <Route exact path='/' component={Design}></Route>
                        </Switch>
                    </Layout>
                </Router>
            </ThemeProvider>
        </div>
    );
}

export default App;
