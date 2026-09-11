import {useHealth} from './healthapi/hooks';
import React from 'react';
import {useNavigate} from 'react-router-dom';

const Landingpage = () => {
    const{data, loading, error} = useHealth();
    const navigate = useNavigate();
    React.useEffect(()=>{
        if(error){
            navigate('/error');
        }
    }, [error, navigate]);

  return (
    <div>
        landing page
        <p>{data ? JSON.stringify(data) : null}</p>
        <p>{loading ?'Loading...':null}</p>
    </div>
  )
}

export default Landingpage