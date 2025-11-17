import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllItems } from '../services/itemsService';
import { getAllTotes } from '../services/totesService';

function Home() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalTotes: 0,
    loading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [items, totes] = await Promise.all([
        getAllItems(),
        getAllTotes(),
      ]);

      setStats({
        totalItems: Array.isArray(items) ? items.length : 0,
        totalTotes: Array.isArray(totes) ? totes.length : 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to ToteMaster</h1>
        <p className="hero-subtitle">Your home inventory management solution</p>
        <p className="hero-description">
          Track items stored in totes and containers. Never lose track of your belongings again!
        </p>
      </div>

      <div className="stats-section">
        <h2>Quick Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.loading ? '...' : stats.totalTotes}</div>
            <div className="stat-label">Totes</div>
            <Link to="/totes" className="stat-link">Manage Totes →</Link>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.loading ? '...' : stats.totalItems}</div>
            <div className="stat-label">Items</div>
            <Link to="/items" className="stat-link">Manage Items →</Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>📦 Tote Management</h3>
            <p>Create and organize storage totes with names, locations, and labels</p>
          </div>
          <div className="feature-card">
            <h3>🔍 Quick Search</h3>
            <p>Find items instantly by name, category, or tags</p>
          </div>
          <div className="feature-card">
            <h3>🏷️ Item Tracking</h3>
            <p>Track item details including quantity, condition, and location</p>
          </div>
          <div className="feature-card">
            <h3>📊 Organization</h3>
            <p>Sort and filter items by various criteria</p>
          </div>
        </div>
      </div>

      <div className="quick-start">
        <h2>Get Started</h2>
        <div className="quick-start-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Totes</h3>
              <p>Add your storage containers with names and locations</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Add Items</h3>
              <p>Log items and assign them to totes</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Search & Find</h3>
              <p>Quickly locate any item when you need it</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
