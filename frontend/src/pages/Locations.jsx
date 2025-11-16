import { useState, useEffect } from 'react';
import { locationsApi } from '../services/api';
import '../styles/pages.css';

function Locations() {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationsApi.getAll();
      setLocations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await locationsApi.update(editingId, formData);
      } else {
        await locationsApi.create(formData);
      }
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      loadLocations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (location) => {
    setFormData({ name: location.name, description: location.description || '' });
    setEditingId(location.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    try {
      await locationsApi.delete(id);
      loadLocations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Locations</h1>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add Location
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Location' : 'New Location'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card-grid">
        {locations.map((location) => (
          <div key={location.id} className="card">
            <div className="card-header">
              <h3>{location.name}</h3>
              <div className="card-actions">
                <button className="btn btn-small" onClick={() => handleEdit(location)}>
                  Edit
                </button>
                <button className="btn btn-small btn-danger" onClick={() => handleDelete(location.id)}>
                  Delete
                </button>
              </div>
            </div>
            {location.description && <p className="card-description">{location.description}</p>}
            <div className="card-footer">
              <span className="badge">{location.containers?.length || 0} containers</span>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No locations yet. Create your first location to get started!</p>
        </div>
      )}
    </div>
  );
}

export default Locations;
