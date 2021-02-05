import logo from './logo.svg';
import './App.css';
import Home from './page/home'
import Header from './components/Header'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from 'react-router-dom';


function App() {
  return (
    <div>
    <Header />
    <Router>
    
      <Switch>
        <Route exact path='/' component={Home}></Route>
      </Switch>
    </Router>
    </div>
  );
}

export default App;
