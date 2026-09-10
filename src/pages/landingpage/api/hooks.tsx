import React from 'react';
import {getHealth} from './health';

type HealthContextType = {
    data: any |null;
    loading: boolean;
    error: any|null;
};

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
                setTimeout(()=>{
                 setLoading(false);
                },1000)
            }   
        };  
        fetchData();
    }, []);

    return {data, loading, error};
}