
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

const AssignmentDialog = ({
  open,
  assignment,
  file,
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
                  Selected file: {file.name}
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