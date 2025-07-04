import Constants from 'expo-constants';

// Get the API base URL from environment variable, app.json, or use default
export const API_BASE_URL = process.env.API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl || "https://feno-app-backendd.onrender.com/api";

// API endpoints
export const API_ENDPOINTS = {
    TASKS: `${API_BASE_URL}/tasks`,
    JOURNALS: `${API_BASE_URL}/journals`,
    MOODS: `${API_BASE_URL}/moods`,
};

// Helper function to get endpoint with user ID
export const getEndpointWithUser = (endpoint, userId) => `${endpoint}?userId=${userId}`;
export const getEndpointWithDate = (endpoint, date, userId) => `${endpoint}/by-date/${date}?userId=${userId}`; 