import { useState, useEffect } from 'react';
import { getAllItems } from '../services/itemsService';
import { getAllTotes } from '../services/totesService';
import '../styles/pages.css';

function Items() {
  const [items, setItems] = useState([]);
  const [totes, setTotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', quantity: 1, toteId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading items and totes...');
      const [itemsData, totesData] = await Promise.all([
        getAllItems(),
        getAllTotes(),
      ]);
      console.log('Items data:', itemsData);
      console.log('Totes data:', totesData);
      setItems(itemsData);
      setTotes(totesData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      console.log('Loading complete');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        toteId: parseInt(formData.toteId),
        quantity: parseInt(formData.quantity),
      };
      if (editingId) {
        const { updateItem } = await import('../services/itemsService');
        await updateItem(editingId, data);
      } else {
        const { createItem } = await import('../services/itemsService');
        await createItem(data);
      }
      setFormData({ name: '', description: '', quantity: 1, toteId: '' });
      setShowForm(false);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      toteId: item.toteId.toString(),
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const { deleteItem } = await import('../services/itemsService');
      await deleteItem(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', quantity: 1, toteId: '' });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Items</h1>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={totes.length === 0}
          >
            Add Item
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {totes.length === 0 && (
        <div className="info-message">
          Please create at least one tote before adding items.
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Item' : 'New Item'}</h2>
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
              <label>Tote *</label>
              <select
                value={formData.toteId}
                onChange={(e) => setFormData({ ...formData, toteId: e.target.value })}
                required
              >
                <option value="">Select a tote</option>
                {totes.map((tote) => (
                  <option key={tote.id} value={tote.id}>
                    {tote.name} {tote.location && `(${tote.location})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
        {items.map((item) => (
          <div key={item.id} className="card">
            <div className="card-header">
              <h3>{item.name}</h3>
              <div className="card-actions">
                <button className="btn btn-small" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button className="btn btn-small btn-danger" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </div>
            {item.description && <p className="card-description">{item.description}</p>}
            <div className="card-footer">
              <span className="badge-quantity">Qty: {item.quantity}</span>
              <span className="badge-location">{item.tote?.name}</span>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !showForm && totes.length > 0 && (
        <div className="empty-state">
          <p>No items yet. Create your first item to get started!</p>
        </div>
      )}
    </div>
  );
}

export default Items;
