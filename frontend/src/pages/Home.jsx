import { useState, useEffect } from 'react';
import { getAllTotes } from '../services/totesService';
import { getAllItems } from '../services/itemsService';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

function Home() {
  const [stats, setStats] = useState({
    totes: 0,
    items: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [totes, items] = await Promise.all([
        getAllTotes(),
        getAllItems(),
      ]);
      setStats({
        totes: totes.length,
        items: items.length,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="home-hero">
        <h1>Welcome to ToteMaster</h1>
        <p>Organize and track your home inventory with ease</p>
      </div>

      <div className="stats-grid">
        <Link to="/totes" className="stat-card">
          <div className="stat-number">{stats.totes}</div>
          <div className="stat-label">Totes</div>
        </Link>
        <Link to="/items" className="stat-card">
          <div className="stat-number">{stats.items}</div>
          <div className="stat-label">Items</div>
        </Link>
      </div>

      <div className="getting-started">
        <h2>Getting Started</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Totes</h3>
              <p>Add storage totes with names, locations, and descriptions</p>
              <Link to="/totes" className="btn btn-primary">Go to Totes</Link>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Track Items</h3>
              <p>Add items to your totes to keep track of what you have and where</p>
              <Link to="/items" className="btn btn-primary">Go to Items</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
