import React, { useEffect, useState } from 'react'
import { Container, Grid, Typography, Box, CircularProgress, Chip, IconButton } from '@mui/material'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../Firebase/Firebase'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

const Noticia = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      try {
        const ref = doc(db, 'posts', id)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          setError('Noticia no encontrada')
          setPost(null)
        } else {
          setPost({ id: snap.id, ...snap.data() })
        }
      } catch (err) {
        console.error(err)
        setError('Error cargando la noticia')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const formatDate = (ts) => {
    try {
      if (!ts) return ''
      if (ts.toDate) return ts.toDate().toLocaleString()
      return new Date(ts).toLocaleString()
    } catch (e) {
      return ''
    }
  }

  if (loading) return <Container sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>

  if (error) return <Container sx={{ mt: 6 }}><Typography color="error">{error}</Typography></Container>

  if (!post) return null

  // Only allow public visibility for published posts
  if (post.status !== 'Publicado') {
    return <Container sx={{ mt: 6 }}><Typography color="text.secondary">Noticia no disponible</Typography></Container>
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Article Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: '800', lineHeight: 1.2 }}>
              {post.title}
            </Typography>
            {post.subtitle && (
              <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: '400', fontStyle: 'italic' }}>
                {post.subtitle}
              </Typography>
            )}

            {/* Article Meta */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Por {post.authorName || post.authorEmail || 'Autor desconocido'}
              </Typography>
              <Typography variant="body2" color="text.secondary">•</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(post.createdAt)}
              </Typography>
              {post.sectionName && (
                <>
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Chip
                    label={post.sectionName}
                    size="small"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 500
                    }}
                  />
                </>
              )}
            </Box>
          </Box>

          {/* Featured Image */}
          {post.imageUrl && !imageError && (
            <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
              <img
                src={post.imageUrl}
                alt={post.title}
                onError={() => setImageError(true)}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '500px',
                  objectFit: 'cover'
                }}
              />
            </Box>
          )}
          {(!post.imageUrl || imageError) && (
            <Box
              sx={{
                mb: 4,
                height: 300,
                backgroundColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                color: 'grey.500',
                fontSize: '6rem'
              }}
            >
              📰
            </Box>
          )}

          {/* Share Buttons */}
          <Box sx={{
            display: 'flex',
            gap: 1,
            mb: 4,
            alignItems: 'center',
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mr: 1 }}>
              Compartir:
            </Typography>
            <IconButton
              aria-label="Compartir en Twitter"
              component="a"
              target="_blank"
              rel="noreferrer"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              sx={{ color: '#1DA1F2', '&:hover': { backgroundColor: 'rgba(29, 161, 242, 0.1)' } }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              aria-label="Compartir en Facebook"
              component="a"
              target="_blank"
              rel="noreferrer"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              sx={{ color: '#1877F2', '&:hover': { backgroundColor: 'rgba(24, 119, 242, 0.1)' } }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              aria-label="Compartir en WhatsApp"
              component="a"
              target="_blank"
              rel="noreferrer"
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`}
              sx={{ color: '#25D366', '&:hover': { backgroundColor: 'rgba(37, 211, 102, 0.1)' } }}
            >
              <WhatsAppIcon />
            </IconButton>
            <IconButton
              aria-label="Compartir en LinkedIn"
              component="a"
              target="_blank"
              rel="noreferrer"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              sx={{ color: '#0077B5', '&:hover': { backgroundColor: 'rgba(0, 119, 181, 0.1)' } }}
            >
              <LinkedInIcon />
            </IconButton>
          </Box>

          {/* Article Content */}
          <Box sx={{
            '& p': {
              mb: 2,
              lineHeight: 1.8,
              fontSize: '1.1rem'
            },
            '& p:first-of-type': {
              fontSize: '1.2rem',
              fontWeight: 500,
              textAlign: 'justify',
              mb: 3
            }
          }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {post.content}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{
            position: { md: 'sticky' },
            top: 96,
            p: 3,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              Información del Artículo
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Autor
                </Typography>
                <Typography variant="body2">
                  {post.authorName || post.authorEmail || 'Autor desconocido'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Estado
                </Typography>
                <Typography variant="body2">
                  {post.status || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Última actualización
                </Typography>
                <Typography variant="body2">
                  {formatDate(post.updatedAt)}
                </Typography>
              </Box>
              {post.responsibleName && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Responsable editorial
                  </Typography>
                  <Typography variant="body2">
                    {post.responsibleName} {post.responsibleRole ? `(${post.responsibleRole})` : ''}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Noticia
