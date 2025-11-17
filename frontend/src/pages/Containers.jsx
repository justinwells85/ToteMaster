import { useState, useEffect } from 'react';
import { containersApi, locationsApi } from '../services/api';
import '../styles/pages.css';

function Containers() {
  const [containers, setContainers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', locationId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [containersData, locationsData] = await Promise.all([
        containersApi.getAll(),
        locationsApi.getAll(),
      ]);
      setContainers(containersData);
      setLocations(locationsData);
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
      const data = { ...formData, locationId: parseInt(formData.locationId) };
      if (editingId) {
        await containersApi.update(editingId, data);
      } else {
        await containersApi.create(data);
      }
      setFormData({ name: '', description: '', locationId: '' });
      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (container) => {
    setFormData({
      name: container.name,
      description: container.description || '',
      locationId: container.locationId.toString(),
    });
    setEditingId(container.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this container?')) return;
    try {
      await containersApi.delete(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', locationId: '' });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Containers</h1>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={locations.length === 0}
          >
            Add Container
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {locations.length === 0 && (
        <div className="info-message">
          Please create at least one location before adding containers.
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Container' : 'New Container'}</h2>
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
              <label>Location *</label>
              <select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
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
        {containers.map((container) => (
          <div key={container.id} className="card">
            <div className="card-header">
              <h3>{container.name}</h3>
              <div className="card-actions">
                <button className="btn btn-small" onClick={() => handleEdit(container)}>
                  Edit
                </button>
                <button className="btn btn-small btn-danger" onClick={() => handleDelete(container.id)}>
                  Delete
                </button>
              </div>
            </div>
            {container.description && <p className="card-description">{container.description}</p>}
            <div className="card-footer">
              <span className="badge-location">{container.location?.name}</span>
              <span className="badge">{container.items?.length || 0} items</span>
            </div>
          </div>
        ))}
      </div>

      {containers.length === 0 && !showForm && locations.length > 0 && (
        <div className="empty-state">
          <p>No containers yet. Create your first container to get started!</p>
        </div>
      )}
    </div>
  );
}

export default Containers;
