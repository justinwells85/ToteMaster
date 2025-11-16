const API_BASE_URL = '/api';

// Locations API
export const locationsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/locations`);
    if (!response.ok) throw new Error('Failed to fetch locations');
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`);
    if (!response.ok) throw new Error('Failed to fetch location');
    return response.json();
  },
  
  create: async (location) => {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });
    if (!response.ok) throw new Error('Failed to create location');
    return response.json();
  },
  
  update: async (id, location) => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...location, id }),
    });
    if (!response.ok) throw new Error('Failed to update location');
    return response.status === 204 ? null : response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete location');
    return response.status === 204 ? null : response.json();
  },
};

// Containers API
export const containersApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/containers`);
    if (!response.ok) throw new Error('Failed to fetch containers');
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/containers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch container');
    return response.json();
  },
  
  create: async (container) => {
    const response = await fetch(`${API_BASE_URL}/containers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(container),
    });
    if (!response.ok) throw new Error('Failed to create container');
    return response.json();
  },
  
  update: async (id, container) => {
    const response = await fetch(`${API_BASE_URL}/containers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...container, id }),
    });
    if (!response.ok) throw new Error('Failed to update container');
    return response.status === 204 ? null : response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/containers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete container');
    return response.status === 204 ? null : response.json();
  },
};

// Items API
export const itemsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/items`);
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`);
    if (!response.ok) throw new Error('Failed to fetch item');
    return response.json();
  },
  
  create: async (item) => {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to create item');
    return response.json();
  },
  
  update: async (id, item) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, id }),
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.status === 204 ? null : response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return response.status === 204 ? null : response.json();
  },
};
