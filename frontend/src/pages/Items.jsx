import { useState, useEffect } from 'react';
import { getAllItems, createItem, updateItem, deleteItem, searchItems } from '../services/itemsService';
import { getAllTotes } from '../services/totesService';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import './Items.css';

function Items() {
  const [items, setItems] = useState([]);
  const [totes, setTotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    toteId: '',
    quantity: 1,
    condition: 'good',
    tags: '',
  });

  useEffect(() => {
    loadTotes();
  }, []);

  useEffect(() => {
    loadItems();
  }, [currentPage, sortBy, sortOrder, searchQuery]);

  const loadTotes = async () => {
    try {
      const data = await getAllTotes();
      setTotes(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error loading totes:', err);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (searchQuery) {
        data = await searchItems(searchQuery, {
          page: currentPage,
          limit: 12,
          sortBy,
          sortOrder,
        });
      } else {
        data = await getAllItems({
          page: currentPage,
          limit: 12,
          sortBy,
          sortOrder,
        });
      }

      if (data.pagination) {
        setItems(data.data);
        setPagination(data.pagination);
      } else {
        setItems(data);
        setPagination(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load items');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        toteId: item.toteId || '',
        quantity: item.quantity || 1,
        condition: item.condition || 'good',
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        toteId: '',
        quantity: 1,
        condition: 'good',
        tags: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      toteId: '',
      quantity: 1,
      condition: 'good',
      tags: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 1,
        tags: formData.tags
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : [],
      };

      if (editingItem) {
        await updateItem(editingItem.id, submitData);
      } else {
        await createItem(submitData);
      }
      handleCloseModal();
      setCurrentPage(1);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.errors?.join(', ') || err.response?.data?.error || 'Failed to save item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deleteItem(itemId);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const getToteName = (toteId) => {
    const tote = totes.find(t => t.id === toteId);
    return tote ? tote.name : 'Unknown Tote';
  };

  const getConditionColor = (condition) => {
    const colors = {
      new: '#4caf50',
      excellent: '#8bc34a',
      good: '#2196f3',
      fair: '#ff9800',
      poor: '#ff5722',
      damaged: '#f44336',
    };
    return colors[condition] || '#999';
  };

  return (
    <div className="items-page">
      <div className="page-header">
        <h1>Items</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add Item
        </button>
      </div>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search items by name, category, or tags..."
      />

      {error && <div className="error-message">{error}</div>}

      <div className="controls-row">
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="quantity">Quantity</option>
            <option value="condition">Condition</option>
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

        {searchQuery && (
          <div className="search-info">
            Searching for: <strong>{searchQuery}</strong>
            <button className="clear-search" onClick={() => handleSearch('')}>
              Clear
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>
            {searchQuery
              ? `No items found matching "${searchQuery}"`
              : 'No items found. Create your first item to get started!'}
          </p>
        </div>
      ) : (
        <>
          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <h3>{item.name}</h3>
                  <span
                    className="item-condition-badge"
                    style={{ backgroundColor: getConditionColor(item.condition) }}
                  >
                    {item.condition}
                  </span>
                </div>

                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}

                <div className="item-details">
                  {item.category && (
                    <div className="item-detail">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{item.category}</span>
                    </div>
                  )}
                  {item.toteId && (
                    <div className="item-detail">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">📦 {getToteName(item.toteId)}</span>
                    </div>
                  )}
                  <div className="item-detail">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{item.quantity}</span>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="item-tags">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="item-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleOpenModal(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(item.id)}
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
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <form onSubmit={handleSubmit} className="item-form">
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Describe the item"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Kitchen, Tools"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="toteId">Tote</label>
              <select
                id="toteId"
                value={formData.toteId}
                onChange={(e) => setFormData({ ...formData, toteId: e.target.value })}
              >
                <option value="">No tote (unassigned)</option>
                {totes.map((tote) => (
                  <option key={tote.id} value={tote.id}>
                    {tote.name} {tote.location && `(${tote.location})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="new">New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., kitchen, appliance, small"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Items;
