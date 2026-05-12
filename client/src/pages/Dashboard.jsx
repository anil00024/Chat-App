import { useNavigate } from 'react-router-dom'

function Dashboard() {

  const navigate = useNavigate()

  const username =
    localStorage.getItem('username')

  return (

    <div
      style={{
        height: '100vh',
        background: '#050816',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '20px',
      }}
    >

      <h1>
        Welcome {username}
      </h1>

      <button
        onClick={() =>
          navigate('/chat')
        }
        style={{
          padding: '14px 24px',
          background: '#4f46e5',
          border: 'none',
          color: 'white',
          borderRadius: '10px',
        }}
      >
        Open Chat
      </button>
      

    </div>
  )
}

export default Dashboard