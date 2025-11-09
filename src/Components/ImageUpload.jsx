import React, { useState, useRef } from 'react'
import {
  Box, Button, Typography, CircularProgress,
  Alert, Card, CardMedia, IconButton
} from '@mui/material'
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material'
import { uploadNewsImage, deleteNewsImage, validateImage } from '../utils/imageUpload'

const ImageUpload = ({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl = null,
  label = 'Seleccionar imagen',
  bucket = 'images',
  maxSizeText = 'Máximo 5MB',
  allowedTypesText = 'JPEG, PNG, WebP'
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Limpiar mensajes anteriores
    setError('')
    setSuccess('')

    // Validar archivo
    const validationErrors = validateImage(file)
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '))
      return
    }

    // Mostrar preview
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target.result)
    reader.readAsDataURL(file)

    // Subir archivo
    setUploading(true)
    try {
      const result = await uploadNewsImage(file)
      setPreviewUrl(result.url)
      setSuccess('Imagen subida correctamente')
      onImageUploaded && onImageUploaded(result)
    } catch (err) {
      setError(err.message || 'Error al subir la imagen')
      setPreviewUrl(currentImageUrl) // Restaurar imagen anterior
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!previewUrl || previewUrl === currentImageUrl) {
      // Solo limpiar preview local
      setPreviewUrl(null)
      setError('')
      setSuccess('')
      onImageRemoved && onImageRemoved()
      return
    }

    // Intentar eliminar del storage
    setUploading(true)
    try {
      await deleteNewsImage(previewUrl)
      setPreviewUrl(null)
      setSuccess('Imagen eliminada correctamente')
      onImageRemoved && onImageRemoved()
    } catch (err) {
      setError('Error al eliminar la imagen del servidor')
    } finally {
      setUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Área de preview/imagen */}
      {previewUrl ? (
        <Card sx={{ mb: 2, position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={previewUrl}
            alt="Preview"
            sx={{ objectFit: 'cover' }}
          />
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1
          }}>
            <IconButton
              onClick={handleButtonClick}
              disabled={uploading}
              sx={{
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              <CloudUpload />
            </IconButton>
            <IconButton
              onClick={handleRemoveImage}
              disabled={uploading}
              sx={{
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              <Delete />
            </IconButton>
          </Box>
          {uploading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.5)'
            }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          )}
        </Card>
      ) : (
        // Área de drop/upload cuando no hay imagen
        <Card
          sx={{
            mb: 2,
            minHeight: 150,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: 'grey.300',
            bgcolor: 'grey.50',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'grey.100'
            }
          }}
          onClick={handleButtonClick}
        >
          {uploading ? (
            <CircularProgress />
          ) : (
            <>
              <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography variant="body1" color="text.secondary" align="center">
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center">
                {maxSizeText} • {allowedTypesText}
              </Typography>
            </>
          )}
        </Card>
      )}

      {/* Botón alternativo */}
      <Button
        variant="outlined"
        startIcon={<CloudUpload />}
        onClick={handleButtonClick}
        disabled={uploading}
        fullWidth
        sx={{ mb: 2 }}
      >
        {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
      </Button>

      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 1 }}>
          {success}
        </Alert>
      )}
    </Box>
  )
}

export default ImageUpload
