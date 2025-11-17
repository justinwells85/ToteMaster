import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Items from './pages/Items';
import Totes from './pages/Totes';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              Tote Master
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/totes" className="nav-link">Totes</Link>
              </li>
              <li className="nav-item">
                <Link to="/items" className="nav-link">Items</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/totes" element={<Totes />} />
            <Route path="/items" element={<Items />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
