import {useHealth} from '../../../pages/landingpage/api/hooks';

const Pages404 = () => {
  const{error} = useHealth();

  return (
    <div>
        <p>{error ? `Error: ${error}` : ' '}</p>
    </div>
  )
}

export default Pages404;