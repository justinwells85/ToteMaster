import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Locations from './pages/Locations';
import Containers from './pages/Containers';
import Items from './pages/Items';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              🏠 ToteMaster
            </Link>
            <div className="nav-links">
              <Link to="/locations" className="nav-link">Locations</Link>
              <Link to="/containers" className="nav-link">Containers</Link>
              <Link to="/items" className="nav-link">Items</Link>
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/containers" element={<Containers />} />
            <Route path="/items" element={<Items />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
