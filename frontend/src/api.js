const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function changePassword(oldPassword, newPassword) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword })
  });
}

export async function getComputers(query = '') {
  return request(`/computers${query}`);
}

export async function getComputerById(id) {
  return request(`/computers/${id}`);
}

export async function createComputer(computer) {
  return request('/computers', {
    method: 'POST',
    body: JSON.stringify(computer)
  });
}

export async function updateComputer(id, computer) {
  return request(`/computers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(computer)
  });
}

export async function deleteComputer(id) {
  return request(`/computers/${id}`, {
    method: 'DELETE'
  });
}