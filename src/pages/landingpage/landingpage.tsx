import {useHealth} from './api/hooks';
import {useNavigate} from 'react-router-dom';

const Landingpage = () => {
    const{data, loading, error} = useHealth();
    const navigate = useNavigate();
    if(error){
        navigate('/error');
    }

  return (
    <div>
        landing page
        <p>{data ? JSON.stringify(data) : null}</p>
        <p>{loading ?'Loading...':null}</p>
    </div>
  )
}

export default Landingpage