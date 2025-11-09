import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Button,
    IconButton,
    InputBase,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Container,
    useTheme,
    useMediaQuery,
    Paper,
    Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../Firebase/Firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const NavBar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    // Minimal static menu; sections are loaded dynamically from Firestore
    const menuItems = [
        { text: 'Inicio', path: '/' }
    ];

    const [sections, setSections] = useState([])

    useEffect(() => {
        const load = async () => {
            try {
                const q = query(collection(db, 'sections'), orderBy('name'))
                const snap = await getDocs(q)
                const secs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                setSections(secs)
            } catch (err) {
                console.error('Error loading sections', err)
            }
        }
        load()
    }, [])

    const handleNavigation = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    return (
        <>
            <AppBar position="sticky" color="primary">
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {menuItems.map((item) => (
                                    <Button
                                        key={item.path}
                                        color="inherit"
                                        component={Link}
                                        to={item.path}
                                    >
                                        {item.text}
                                    </Button>
                                ))}

                                {/* Dynamic sections from Firestore */}
                                {sections.map((s) => (
                                    <Button key={s.id} color="inherit" component={Link} to={`/section/${s.slug}`}>
                                        {s.name}
                                    </Button>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Paper
                                component="form"
                                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 200 }}
                            >
                                <InputBase
                                    sx={{ ml: 1, flex: 1 }}
                                    placeholder="Buscar noticias..."
                                    inputProps={{ 'aria-label': 'buscar noticias' }}
                                />
                                <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                                    <SearchIcon />
                                </IconButton>
                            </Paper>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Box sx={{ bgcolor: 'error.main', color: 'white', py: 1 }}>
                <Container maxWidth="lg">
                    <Typography variant="subtitle2" sx={{ display: 'flex', gap: 2 }}>
                        <strong>ÚLTIMA HORA:</strong>
                        <span>Últimas actualizaciones sobre eventos importantes...</span>
                    </Typography>
                </Container>
            </Box>

            <Drawer
                variant="temporary"
                anchor="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
            >
                <Box sx={{ width: 250 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}

                        {sections.map((s) => (
                            <ListItem key={s.id} onClick={() => handleNavigation(`/section/${s.slug}`)}>
                                <ListItemText primary={s.name} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default NavBar;
 
