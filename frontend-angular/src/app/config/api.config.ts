const origin = typeof window === 'undefined' ? '' : window.location.origin;
const isAngularDevServer = origin.includes('localhost:4200') || origin.includes('127.0.0.1:4200');

export const API_BASE_URL = isAngularDevServer ? 'http://localhost:8080/api' : '/api';
export const AI_SERVICE_BASE_URL = isAngularDevServer ? 'http://localhost:8000' : '/ai';
