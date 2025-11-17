import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, placeholder = "Search..." }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
        >
          ×
        </button>
      )}
      <button type="submit" className="search-btn">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
