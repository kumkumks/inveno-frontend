import axios from 'axios';
import api from '../../services/api';


export const getHealth = async () => {
    try {
        const response = await api.get('/api/health/');
        return response.data;
    } catch (error) {
        console.error('Error fetching health data:', error);
        throw error;
    }
}