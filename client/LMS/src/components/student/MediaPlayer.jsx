import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Link
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  PlayArrow as PlayIcon,
  CheckCircle,
  CheckCircleOutline
} from '@mui/icons-material';

const MediaPlayer = ({ open, onClose, lesson, onMarkComplete, isCompleted }) => {
  const [isLoading, setIsLoading] = useState(true);

  if (!lesson) return null;

  const isVideo = lesson.content_type === 'video';
  const isPdf = lesson.content_type === 'text';
  const isYouTube = lesson.content_url && lesson.content_url.includes('youtube.com' || 'youtu.be');

  // Extract YouTube video ID for embedding
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = lesson.content_url;
    link.download = `${lesson.title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderVideoPlayer = () => {
    if (isYouTube) {
      const videoId = getYouTubeVideoId(lesson.content_url);
      if (videoId) {
        return (
          <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
              onLoad={() => setIsLoading(false)}
            />
          </Box>
        );
      }
    }
    
    // For direct video files
    return (
      <video
        controls
        width="100%"
        height="400"
        onLoadedData={() => setIsLoading(false)}
        style={{ maxWidth: '100%' }}
      >
        <source src={lesson.content_url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  const renderPdfViewer = () => {
    return (
      <Box sx={{ height: '600px', width: '100%' }}>
        <iframe
          src={`${lesson.content_url}#toolbar=1`}
          width="100%"
          height="100%"
          title={lesson.title}
          onLoad={() => setIsLoading(false)}
          style={{ border: 'none' }}
        />
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isVideo ? <PlayIcon /> : null}
          <Typography variant="h6">{lesson.title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isPdf && (
            <IconButton onClick={handleDownload} title="Download PDF">
              <DownloadIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Typography>Loading...</Typography>
          </Box>
        )}
        
        <Box sx={{ flex: 1, p: 2 }}>
          {isVideo && renderVideoPlayer()}
          {isPdf && renderPdfViewer()}
        </Box>
        
        {lesson.duration > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Duration: {lesson.duration} minutes
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        {isPdf && (
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            variant="outlined"
          >
            Download PDF
          </Button>
        )}
        {onMarkComplete && (
          <Button
            onClick={() => onMarkComplete(lesson.id)}
            variant={isCompleted ? "outlined" : "contained"}
            color={isCompleted ? "success" : "primary"}
            disabled={isCompleted}
            startIcon={isCompleted ? <CheckCircle /> : <CheckCircleOutline />}
          >
            {isCompleted ? "Completed" : "Mark as Complete"}
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaPlayer;