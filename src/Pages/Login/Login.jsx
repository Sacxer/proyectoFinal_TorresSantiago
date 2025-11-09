import React, { useState } from 'react'
import { Container, Paper, Typography, TextField, Button, Box, Link as MuiLink, Alert } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login, signInWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
      login(email, password)
      .then(() => {
        navigate('/dashboard')
      })
      .catch((err) => setError(err.message || 'Error al iniciar sesión'))
      .finally(() => setLoading(false))
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error con Google Sign-In')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Iniciar sesión
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="contained" color="primary">
            Entrar
          </Button>

          <Button variant="outlined" color="inherit" onClick={handleGoogle} disabled={loading}>
            Entrar con Google
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <MuiLink component={Link} to="/register">¿No tienes cuenta? Regístrate</MuiLink>
            <MuiLink component={Link} to="/">Volver al inicio</MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default Login
