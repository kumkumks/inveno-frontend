import React from 'react'
import { useHealth } from '../../../shared/api/hooks';

const Servererror = () => {
  const { error } = useHealth();

  return (
    <div>
        <p>{error}</p>
        <p>Something went wrong on the server.</p>
    </div>
  )
}

export default Servererror