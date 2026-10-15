const API_URL = 'http://localhost:5001/api';

export const fetchProjects = async () => (await fetch(`${API_URL}/projects`)).json();
export const fetchProject = async (id: string) => (await fetch(`${API_URL}/projects/${id}`)).json();
export const createProject = async (data: any) => {
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const updateProject = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const deleteProject = async (id: string) => {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const fetchSprints = async (projectId?: string) => {
  const url = projectId ? `${API_URL}/sprints?projectId=${projectId}` : `${API_URL}/sprints`;
  return (await fetch(url)).json();
};
export const createSprint = async (data: any) => {
  const res = await fetch(`${API_URL}/sprints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchTasks = async (projectId?: string, sprintId?: string) => {
  let url = `${API_URL}/tasks?`;
  if (projectId) url += `projectId=${projectId}&`;
  if (sprintId) url += `sprintId=${sprintId}`;
  return (await fetch(url)).json();
};
export const createTask = async (data: any) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const updateTask = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchRisks = async (projectId?: string) => {
  const url = projectId ? `${API_URL}/risks?projectId=${projectId}` : `${API_URL}/risks`;
  return (await fetch(url)).json();
};
export const createRisk = async (data: any) => {
  const res = await fetch(`${API_URL}/risks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
export const updateRisk = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/risks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const resetDemoData = async () => {
  const res = await fetch(`${API_URL}/seed`, { method: 'POST' });
  return res.json();
};

export const fetchAnalytics = async (projectId?: string) => {
  const url = projectId ? `${API_URL}/analytics/${projectId}` : `${API_URL}/analytics`;
  return (await fetch(url)).json();
};

export const fetchReports = async (projectId: string) => {
  return (await fetch(`${API_URL}/reports/${projectId}`)).json();
};
