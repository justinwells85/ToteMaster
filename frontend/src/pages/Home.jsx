import { useState, useEffect } from 'react';
import { locationsApi, containersApi, itemsApi } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

function Home() {
  const [stats, setStats] = useState({
    locations: 0,
    containers: 0,
    items: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [locations, containers, items] = await Promise.all([
        locationsApi.getAll(),
        containersApi.getAll(),
        itemsApi.getAll(),
      ]);
      setStats({
        locations: locations.length,
        containers: containers.length,
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
        <Link to="/locations" className="stat-card">
          <div className="stat-number">{stats.locations}</div>
          <div className="stat-label">Locations</div>
        </Link>
        <Link to="/containers" className="stat-card">
          <div className="stat-number">{stats.containers}</div>
          <div className="stat-label">Containers</div>
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
              <h3>Create Locations</h3>
              <p>Define areas in your home where you store items (e.g., Garage, Basement, Attic)</p>
              <Link to="/locations" className="btn btn-primary">Go to Locations</Link>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Add Containers</h3>
              <p>Add containers or totes to your locations to organize your storage</p>
              <Link to="/containers" className="btn btn-primary">Go to Containers</Link>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Track Items</h3>
              <p>Add items to containers to keep track of what you have and where</p>
              <Link to="/items" className="btn btn-primary">Go to Items</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
