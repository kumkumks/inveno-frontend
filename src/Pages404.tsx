import {useHealth} from './pages/landingpage/healthapi/hooks';
import  api  from './services/api';

const Pages404 = () => {
  const{error} = useHealth();
    
  return (
    <div>
        <p>{error ? `Server Error: ${error} ` : 'loading...'}</p>
        <button>Refresh</button>
    </div>
  )
}

export default Pages404;