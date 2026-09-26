import { useHealth } from '@/hooks/use-health'

const ServerError = () => {
  const { error } = useHealth()

  return (
    <div>
      <p>{error ? `Server Error: ${error} ` : 'loading...'}</p>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  )
}

export default ServerError
