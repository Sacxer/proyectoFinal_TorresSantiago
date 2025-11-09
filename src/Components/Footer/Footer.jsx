import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Link as MuiLink,
    TextField,
    Button,
    IconButton,
    Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
    const mainSections = [
        { text: 'Internacional', path: '/internacional' },
        { text: 'Economía', path: '/economia' },
        { text: 'Tecnología', path: '/tecnologia' },
        { text: 'Deportes', path: '/deportes' }
    ];

    const moreSections = [
        { text: 'Entretenimiento', path: '/entretenimiento' },
        { text: 'Ciencia', path: '/ciencia' },
        { text: 'Salud', path: '/salud' },
        { text: 'Opinión', path: '/opinion' }
    ];

    return (
        <Box component="footer" sx={{ bgcolor: 'primary.dark', color: 'white', pt: 6, pb: 3, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Brand Section */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="h6" gutterBottom>
                            Global News
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Manteniéndote informado con las noticias más relevantes del momento.
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <IconButton color="inherit" aria-label="Facebook">
                                <FacebookIcon />
                            </IconButton>
                            <IconButton color="inherit" aria-label="Twitter">
                                <TwitterIcon />
                            </IconButton>
                            <IconButton color="inherit" aria-label="Instagram">
                                <InstagramIcon />
                            </IconButton>
                            <IconButton color="inherit" aria-label="YouTube">
                                <YouTubeIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Main Sections */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" gutterBottom>
                            Secciones
                        </Typography>
                        <Box component="nav">
                            {mainSections.map((section) => (
                                <Box key={section.path} sx={{ mb: 1 }}>
                                    <MuiLink
                                        component={Link}
                                        to={section.path}
                                        color="inherit"
                                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        {section.text}
                                    </MuiLink>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* More Sections */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="h6" gutterBottom>
                            Más Secciones
                        </Typography>
                        <Box component="nav">
                            {moreSections.map((section) => (
                                <Box key={section.path} sx={{ mb: 1 }}>
                                    <MuiLink
                                        component={Link}
                                        to={section.path}
                                        color="inherit"
                                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        {section.text}
                                    </MuiLink>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Newsletter Section */}
                    <Grid item xs={12} md={3}>
                        <Typography variant="h6" gutterBottom>
                            Suscríbete
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Recibe las últimas noticias en tu correo
                        </Typography>
                        <Box component="form" noValidate>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Tu correo electrónico"
                                size="small"
                                sx={{
                                    mb: 2,
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ bgcolor: 'secondary.main' }}
                            >
                                Suscribirse
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: { xs: 2, sm: 0 } }}>
                        <MuiLink component={Link} to="/sobre-nosotros" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Sobre Nosotros
                        </MuiLink>
                        <MuiLink component={Link} to="/contacto" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Contacto
                        </MuiLink>
                        <MuiLink component={Link} to="/privacidad" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Privacidad
                        </MuiLink>
                    </Box>
                    <Typography variant="body2" color="inherit">
                        © {new Date().getFullYear()} Global News. Todos los derechos reservados.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};
export default Footer;