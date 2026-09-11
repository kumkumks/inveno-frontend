import {useHealth} from './pages/landingpage/healthapi/hooks';

const Pages404 = () => {
  const{error} = useHealth();

  return (
    <div>
        <p>{error ? `Server Error: ${error} ` : 'loading...'}</p>
    </div>
  )
}

export default Pages404;