import React from 'react';
import {getHealth} from './health';

export const useHealth = () => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const healthData = await getHealth();
                setData(healthData);
            } catch (error: any) {
                setError(error);
            } finally {
                setLoading(false);
            }   
        };  
        fetchData();
    }, []);

    return {data, loading, error};
}