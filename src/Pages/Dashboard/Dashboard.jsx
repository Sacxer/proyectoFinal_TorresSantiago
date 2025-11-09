import React from 'react'
import { Container, Typography } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import ReporterDashboard from './ReporterDashboard'
import EditorDashboard from './EditorDashboard'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()

  if (!currentUser) {
    // If not authenticated, redirect to login
    navigate('/login')
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel administrativo
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Hola {currentUser.displayName || currentUser.email} — Rol: {userRole || 'Sin rol'}
      </Typography>

      {userRole === 'Editor' ? (
        <EditorDashboard />
      ) : (
        <ReporterDashboard />
      )}
    </Container>
  )
}

export default Dashboard
