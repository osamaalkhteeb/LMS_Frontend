
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Button,
  Input,
  Box,
  IconButton,
} from "@mui/material";
import { Close, AttachFile } from "@mui/icons-material";
import { validateFileUpload, getAcceptAttribute, SUPPORTED_FILE_TYPES } from '../../utils/constants';

const AssignmentDialog = ({
  open,
  assignment,
  file,
  fileError,
  onClose,
  onFileChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {assignment?.title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {assignment?.status === "Submitted" ? (
          <>
            <Typography variant="h6" gutterBottom>
              Assignment Details
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Course:</strong> {assignment?.course}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Due Date:</strong> {assignment?.dueDate}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Status:</strong>{" "}
              <Chip
                label={assignment?.status}
                color="success"
                size="small"
              />
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Grade:</strong> {assignment?.grade}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Description:</strong> {assignment?.description}
            </Typography>
            <Typography variant="body1">
              <strong>Instructions:</strong> {assignment?.instructions}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Submit Assignment
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Course:</strong> {assignment?.course}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Due Date:</strong> {assignment?.dueDate}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Description:</strong> {assignment?.description}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Instructions:</strong> {assignment?.instructions}
            </Typography>

            <Box mt={3}>
              <Input
                type="file"
                id="assignment-upload"
                onChange={onFileChange}
                style={{ display: "none" }}
                inputProps={{ accept: getAcceptAttribute('document') }}
              />
              <label htmlFor="assignment-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<AttachFile />}
                  sx={{ mr: 2 }}
                >
                  Select File
                </Button>
              </label>
              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {SUPPORTED_FILE_TYPES.DOCUMENT.description}
              </Typography>
              {fileError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {fileError}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {assignment?.status === "Pending" && (
          <Button
            onClick={onSubmit}
            variant="contained"
            color="primary"
            disabled={!file}
          >
            Submit Assignment
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentDialog;