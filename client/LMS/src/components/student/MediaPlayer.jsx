import React, { useState, useEffect } from 'react';
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

  // Reset loading state when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      // Set a timeout to hide loading after 3 seconds if onLoad doesn't fire
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Hide loading immediately for YouTube videos
  useEffect(() => {
    if (open && lesson && lesson.content_url && (lesson.content_url.includes('youtube.com') || lesson.content_url.includes('youtu.be'))) {
      setIsLoading(false);
    }
  }, [open, lesson]);

  if (!lesson) return null;

  const isVideo = lesson.content_type === 'video';
  const isPdf = lesson.content_type === 'text';
  const isYouTube = lesson.content_url && (lesson.content_url.includes('youtube.com') || lesson.content_url.includes('youtu.be'));

  // Extract YouTube video ID for embedding
  const getYouTubeVideoId = (url) => {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
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
    const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(lesson.content_url)}&embedded=true`;
    
    return (
      <Box sx={{ height: '600px', width: '100%', overflow: 'hidden' }}>
        <iframe
          src={googleDocsUrl}
          width="100%"
          height="100%"
          onLoad={() => setIsLoading(false)}
          style={{ border: 'none' }}
          title={lesson.title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          referrerPolicy="no-referrer"
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
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isVideo ? <PlayIcon /> : null}
          <Typography variant="h6">{lesson.title}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Typography>Loading...</Typography>
          </Box>
        )}
        
        <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
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