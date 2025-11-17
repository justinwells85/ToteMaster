import { useState, useEffect } from 'react';
import { getAllTotes, createTote, updateTote, deleteTote } from '../services/totesService';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import './Totes.css';

function Totes() {
  const [totes, setTotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTote, setEditingTote] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    color: '',
    label: '',
    size: '',
  });

  useEffect(() => {
    loadTotes();
  }, [currentPage, sortBy, sortOrder]);

  const loadTotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTotes({
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      });

      if (data.pagination) {
        setTotes(data.data);
        setPagination(data.pagination);
      } else {
        setTotes(data);
        setPagination(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load totes');
      console.error('Error loading totes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tote = null) => {
    if (tote) {
      setEditingTote(tote);
      setFormData({
        name: tote.name || '',
        location: tote.location || '',
        description: tote.description || '',
        color: tote.color || '',
        label: tote.label || '',
        size: tote.size || '',
      });
    } else {
      setEditingTote(null);
      setFormData({
        name: '',
        location: '',
        description: '',
        color: '',
        label: '',
        size: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTote(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      color: '',
      label: '',
      size: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTote) {
        await updateTote(editingTote.id, formData);
      } else {
        await createTote(formData);
      }
      handleCloseModal();
      loadTotes();
    } catch (err) {
      alert(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Failed to save tote');
    }
  };

  const handleDelete = async (toteId) => {
    if (!window.confirm('Are you sure you want to delete this tote?')) {
      return;
    }

    try {
      await deleteTote(toteId);
      loadTotes();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete tote');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="totes-page">
      <div className="page-header">
        <h1>Totes</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add Tote
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="sort-controls">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="location">Location</option>
          <option value="size">Size</option>
          <option value="createdAt">Date Created</option>
          <option value="updatedAt">Date Updated</option>
        </select>
        <button
          className="sort-order-btn"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading totes...</div>
      ) : totes.length === 0 ? (
        <div className="empty-state">
          <p>No totes found. Create your first tote to get started!</p>
        </div>
      ) : (
        <>
          <div className="totes-grid">
            {totes.map((tote) => (
              <div key={tote.id} className="tote-card">
                <div className="tote-header">
                  <h3>{tote.name}</h3>
                  {tote.color && (
                    <div
                      className="tote-color-badge"
                      style={{ backgroundColor: tote.color }}
                      title={tote.color}
                    />
                  )}
                </div>
                {tote.location && (
                  <p className="tote-location">📍 {tote.location}</p>
                )}
                {tote.description && (
                  <p className="tote-description">{tote.description}</p>
                )}
                <div className="tote-meta">
                  {tote.label && <span className="tote-label">{tote.label}</span>}
                  {tote.size && <span className="tote-size">{tote.size}</span>}
                </div>
                <div className="tote-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleOpenModal(tote)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(tote.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTote ? 'Edit Tote' : 'Add New Tote'}
      >
        <form onSubmit={handleSubmit} className="tote-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Garage - Shelf A"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="What's inside this tote?"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., blue, red"
              />
            </div>

            <div className="form-group">
              <label htmlFor="label">Label</label>
              <input
                type="text"
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., KITCHEN-01"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="size">Size</label>
            <select
              id="size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            >
              <option value="">Select size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTote ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Totes;
