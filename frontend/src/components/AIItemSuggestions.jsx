import { useState } from 'react';
import PropTypes from 'prop-types';
import './AIItemSuggestions.css';

/**
 * AIItemSuggestions Component
 * Displays AI-identified items with options to review and create them
 */
export default function AIItemSuggestions({
  items = [],
  toteId,
  onCreateItem,
  onCreateAll,
  onClose,
}) {
  const [editedItems, setEditedItems] = useState(
    items.map((item, index) => ({ ...item, id: index, selected: true }))
  );
  const [creatingItems, setCreatingItems] = useState(false);

  const handleFieldChange = (id, field, value) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleToggleSelect = (id) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleCreateSelected = async () => {
    setCreatingItems(true);
    try {
      const selectedItems = editedItems.filter((item) => item.selected);
      if (onCreateAll) {
        await onCreateAll(selectedItems);
      }
    } finally {
      setCreatingItems(false);
    }
  };

  const selectedCount = editedItems.filter((item) => item.selected).length;

  if (items.length === 0) {
    return (
      <div className="ai-suggestions-empty">
        <p>No items identified in the photos.</p>
        <p className="ai-suggestions-hint">
          Try uploading clearer photos or photos with more visible items.
        </p>
      </div>
    );
  }

  return (
    <div className="ai-suggestions-container">
      <div className="ai-suggestions-header">
        <h3>AI Identified Items ({items.length})</h3>
        <p className="ai-suggestions-subtitle">
          Review and edit the items before adding them to your inventory
        </p>
      </div>

      <div className="ai-suggestions-list">
        {editedItems.map((item) => (
          <div
            key={item.id}
            className={`ai-suggestion-card ${
              !item.selected ? 'ai-suggestion-card-unselected' : ''
            }`}
          >
            <div className="ai-suggestion-header">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => handleToggleSelect(item.id)}
                className="ai-suggestion-checkbox"
              />
              <div className="ai-suggestion-confidence">
                <span
                  className={`confidence-badge confidence-${item.confidence}`}
                >
                  {item.confidence} confidence
                </span>
              </div>
            </div>

            <div className="ai-suggestion-fields">
              <div className="ai-field">
                <label>Item Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    handleFieldChange(item.id, 'name', e.target.value)
                  }
                  disabled={!item.selected}
                />
              </div>

              <div className="ai-field">
                <label>Category</label>
                <select
                  value={item.category}
                  onChange={(e) =>
                    handleFieldChange(item.id, 'category', e.target.value)
                  }
                  disabled={!item.selected}
                >
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="toys">Toys</option>
                  <option value="tools">Tools</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="sports">Sports</option>
                  <option value="books">Books</option>
                  <option value="decorations">Decorations</option>
                  <option value="office">Office</option>
                  <option value="uncategorized">Other</option>
                </select>
              </div>

              <div className="ai-field ai-field-small">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleFieldChange(
                      item.id,
                      'quantity',
                      parseInt(e.target.value) || 1
                    )
                  }
                  disabled={!item.selected}
                />
              </div>

              <div className="ai-field ai-field-small">
                <label>Condition</label>
                <select
                  value={item.condition}
                  onChange={(e) =>
                    handleFieldChange(item.id, 'condition', e.target.value)
                  }
                  disabled={!item.selected}
                >
                  <option value="new">New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <div className="ai-field ai-field-full">
                <label>Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    handleFieldChange(item.id, 'description', e.target.value)
                  }
                  rows="2"
                  disabled={!item.selected}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ai-suggestions-footer">
        <p className="ai-suggestions-selected">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </p>
        <div className="ai-suggestions-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleCreateSelected}
            disabled={selectedCount === 0 || creatingItems}
            className="btn btn-primary"
          >
            {creatingItems
              ? 'Creating...'
              : `Add ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

AIItemSuggestions.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      category: PropTypes.string.isRequired,
      quantity: PropTypes.number,
      condition: PropTypes.string,
      confidence: PropTypes.string,
    })
  ),
  toteId: PropTypes.string.isRequired,
  onCreateItem: PropTypes.func,
  onCreateAll: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
