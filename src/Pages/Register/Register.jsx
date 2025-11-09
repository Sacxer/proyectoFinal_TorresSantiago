import React, { useState } from 'react'
import { Container, Paper, Typography, TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('Reportero')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
		try {
			await signup(email, password, name, role)
			navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

	return (
		<Container maxWidth="sm" sx={{ mt: 6 }}>
			<Paper sx={{ p: 4 }} elevation={3}>
				<Typography variant="h5" component="h1" gutterBottom>
					Crear cuenta
				</Typography>

						<Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
							{error && <Alert severity="error">{error}</Alert>}
					<TextField
						label="Nombre completo"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>

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

					<TextField
						label="Confirmar contraseña"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>

					<FormControl fullWidth>
						<InputLabel id="role-label">Rol</InputLabel>
						<Select
							labelId="role-label"
							value={role}
							label="Rol"
							onChange={(e) => setRole(e.target.value)}
						>
							<MenuItem value="Reportero">Reportero</MenuItem>
							<MenuItem value="Editor">Editor</MenuItem>
						</Select>
					</FormControl>

					{/* error shown above as Alert */}

								<Button type="submit" variant="contained" color="primary" disabled={loading}>
									{loading ? 'Creando cuenta...' : 'Registrarse'}
								</Button>
				</Box>
			</Paper>
		</Container>
	)
}

export default Register
