import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Container, Typography, CircularProgress,
  Card, CardContent, CardMedia, CardActionArea,
  Box, useTheme, alpha
} from '@mui/material';
import { Grid } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../Firebase/Firebase';
import { collection, query, where, getDocs, limit, orderBy, startAfter } from 'firebase/firestore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const CategoryPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [section, setSection] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const lastPostRef = useRef(null);
  const observerRef = useRef(null);
  const PAGE_SIZE = 12; // Number of posts per page

  const handleImageError = (postId) => {
    setImageErrors(prev => ({ ...prev, [postId]: true }))
  }

  // Load more posts function
  const loadMorePosts = useCallback(async (sectionData, lastPost = null) => {
    if (!sectionData || loadingMore || !hasMore) {
      console.log('loadMorePosts skipped:', { sectionData: !!sectionData, loadingMore, hasMore });
      return;
    }

    setLoadingMore(true);
    try {
      console.log('Loading posts for section:', sectionData.name, 'ID:', sectionData.id);

      // Query with proper ordering and pagination
      const baseQuery = [
        where('status', '==', 'Publicado'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      ];

      // Add startAfter if we have a last post
      if (lastPost) {
        baseQuery.push(startAfter(lastPost.createdAt));
      }

      // Try first with sectionId
      let pQ = query(
        collection(db, 'posts'),
        where('sectionId', '==', sectionData.id),
        ...baseQuery
      );

      let pSnap = await getDocs(pQ);
      let newPosts = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      console.log('Posts found by sectionId:', newPosts.length);

      // If no posts found and it's the first page, try with sectionName
      if (newPosts.length === 0 && !lastPost) {
        console.log('No posts by sectionId, trying sectionName');
        pQ = query(collection(db, 'posts'), ...baseQuery);
        pSnap = await getDocs(pQ);
        const allPosts = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const sectionNameNorm = String(sectionData.name || '').trim().toLowerCase();
        newPosts = allPosts.filter(p => {
          const pSecName = p.sectionName ? String(p.sectionName).trim().toLowerCase() : '';
          console.log('Checking post sectionName:', pSecName, 'vs', sectionNameNorm);
          return pSecName === sectionNameNorm;
        });
        console.log('Posts found by sectionName:', newPosts.length);
      }

      if (newPosts.length < PAGE_SIZE) {
        setHasMore(false);
      }

      console.log('Adding posts:', newPosts.length);
      setPosts(prev => [...prev, ...newPosts]);
    } catch (err) {
      console.error('Error loading more posts:', err);
      setHasMore(false); // Stop loading if there's an error
    } finally {
      setLoadingMore(false);
    }
  }, []); // Remove dependencies to prevent recreation

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setHasMore(true);
      setPosts([]);
      
      try {
        // find section by slug
        const sQ = query(collection(db, 'sections'), where('slug', '==', slug));
        const sSnap = await getDocs(sQ);
        if (sSnap.empty) {
          setSection(null);
          setLoading(false);
          return;
        }

        const sData = { id: sSnap.docs[0].id, ...sSnap.docs[0].data() };
        setSection(sData);
        
        // Load first page
        await loadMorePosts(sData);
      } catch (err) {
        console.error('Error loading category:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) load();
  }, [slug, loadMorePosts]);

  // Intersection Observer setup
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMorePosts(section, posts[posts.length - 1]);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    const currentTarget = lastPostRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, hasMore, loadMorePosts, posts, section, loadingMore]);

  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>

  // Helper to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to get a preview of the content (first ~150 chars)
  const getContentPreview = (content) => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // remove HTML tags
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.background.paper, 0.8)
        : alpha(theme.palette.grey[100], 0.5),
      pt: 4,
      pb: 6
    }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              textAlign: 'center',
              color: theme.palette.primary.main,
              mb: 2
            }}
          >
            {section ? section.name : 'Sección no encontrada'}
          </Typography>
          {section && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Últimas noticias de {section.name}
            </Typography>
          )}
        </Box>

        {/* Posts Grid */}
        <Grid container spacing={3}>
          {posts.map((post, index) => (
            <Grid 
              key={post.id} 
              xs={12} 
              sm={6} 
              md={4}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <Card 
                elevation={1}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/noticia/${post.id}`)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                >
                  {/* Card Media */}
                  {post.imageUrl && !imageErrors[post.id] && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.imageUrl}
                      alt={post.title}
                      onError={() => handleImageError(post.id)}
                      sx={{
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {(!post.imageUrl || imageErrors[post.id]) && (
                    <Box
                      sx={{
                        height: 200,
                        backgroundColor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'grey.500',
                        fontSize: '3rem'
                      }}
                    >
                      📰
                    </Box>
                  )}

                  {/* Card Content */}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {post.title}
                    </Typography>
                    
                    {post.subtitle && (
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {post.subtitle}
                      </Typography>
                    )}

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '4.5em'  // approximately 3 lines
                      }}
                    >
                      {getContentPreview(post.content)}
                    </Typography>

                    {/* Footer - Date */}
                    <Box sx={{ 
                      mt: 'auto', 
                      pt: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(post.createdAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}

          {/* Empty State */}
          {posts.length === 0 && !loading && (
            <Grid xs={12}>
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                px: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1
              }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay noticias publicadas en esta sección
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vuelve más tarde para ver las últimas actualizaciones
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Grid>
          )}

          {/* End Message */}
          {!hasMore && posts.length > 0 && (
            <Grid xs={12}>
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                px: 2
              }}>
                <Typography variant="body2" color="text.secondary">
                  Has llegado al final de las noticias en esta sección
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}

export default CategoryPage;