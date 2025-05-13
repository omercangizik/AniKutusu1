import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Fade,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, PhotoCamera, ZoomIn } from '@mui/icons-material';
import { format, isValid, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const formatDate = (dateString) => {
  if (!dateString) return 'Tarih belirtilmemiş';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Geçersiz tarih';
    return format(date, 'd MMMM yyyy', { locale: tr });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Geçersiz tarih';
  }
};

const MemoryPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    photo: null,
  });

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/memories/${id}`);
      setMemories(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewMemory({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      photo: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMemory((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setNewMemory((prev) => ({ ...prev, photo: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const formData = new FormData();
      formData.append('title', newMemory.title);
      formData.append('description', newMemory.description);
      formData.append('date', newMemory.date);
      if (newMemory.photo) {
        formData.append('photo', newMemory.photo);
      }

      await axios.post(`${API_URL}/memories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      handleClose();
      fetchMemories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (memoryId) => {
    try {
      setError(null);
      await axios.delete(`${API_URL}/memories/${id}/${memoryId}`);
      fetchMemories();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Anılarım
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            px: 3,
            py: 1
          }}
        >
          Yeni Anı Ekle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Anı Ekle</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Başlık"
                  name="title"
                  value={newMemory.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tarih"
                  name="date"
                  type="date"
                  value={newMemory.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  name="description"
                  value={newMemory.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{ borderRadius: '20px' }}
                >
                  Fotoğraf Yükle
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </Button>
                {newMemory.photo && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Seçilen dosya: {newMemory.photo.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedMemory && (
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                image={selectedMemory.photoUrl}
                alt={selectedMemory.title}
                sx={{
                  width: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  p: 2
                }}
              >
                <Typography variant="h6">{selectedMemory.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {formatDate(selectedMemory.date)}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {selectedMemory.description}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>

      <Grid container spacing={3}>
        {memories.map((memory) => (
          <Grid item xs={12} sm={6} md={4} key={memory.memoryId}>
            <Fade in={true}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    '& .memory-overlay': {
                      opacity: 1
                    }
                  }
                }}
              >
                {memory.photoUrl && (
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="250"
                      image={memory.photoUrl}
                      alt={memory.title}
                      sx={{
                        objectFit: 'cover',
                        backgroundColor: 'grey.200',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedMemory(memory)}
                      onError={(e) => {
                        console.error('Error loading image:', memory.photoUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                    <Box
                      className="memory-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedMemory(memory)}
                    >
                      <ZoomIn sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {memory.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formatDate(memory.date)}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      flexGrow: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {memory.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(memory.memoryId)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'white'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MemoryPage; 