import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  CloudUpload as UploadIcon
} from "@mui/icons-material";
import { createCourse, updateCourse, deleteCourse, publishCourse } from "../../services/courseService";
import { getCategories } from "../../services/categoryService";

const CourseDialog = ({
  openDialog,
  handleDialogClose,
  dialogType,
  currentCourse,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    thumbnail_url: "",
    thumbnail_image: null
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (openDialog) {
      fetchCategories();
      if (dialogType === "edit" && currentCourse) {
        setFormData({
          title: currentCourse.title || "",
          description: currentCourse.description || "",
          category_id: currentCourse.category_id || "",
          thumbnail_url: currentCourse.thumbnail_url || "",
          thumbnail_image: null
        });
      } else {
        setFormData({
          title: "",
          description: "",
          category_id: "",
          thumbnail_url: "",
          thumbnail_image: null
        });
      }
      setError(null);
      setThumbnailFile(null);
    }
  }, [openDialog, dialogType, currentCourse]);

  const fetchCategories = async () => {
    try {
      const categories = await getCategories();
      setCategories(categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        thumbnail_url: previewUrl
      }));
      
      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          thumbnail_image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Client-side validation for create and edit operations
    if (dialogType === "create" || dialogType === "edit") {
      if (!formData.title.trim()) {
        setError("Course title is required");
        return;
      }
      if (!formData.description.trim()) {
        setError("Course description is required");
        return;
      }
      if (!formData.category_id) {
        setError("Please select a category");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (dialogType === "create") {
        result = await createCourse(formData);
      } else if (dialogType === "edit") {
        result = await updateCourse(currentCourse.id, formData);
      } else if (dialogType === "publish") {
        result = await publishCourse(currentCourse.id, { is_published: !currentCourse.is_published });
      } else if (dialogType === "delete") {
        result = await deleteCourse(currentCourse.id);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      handleDialogClose();
    } catch (error) {
      console.error(`Error ${dialogType}ing course:`, error);
      
      // Parse detailed validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => 
          `${err.field}: ${err.message}`
        ).join(', ');
        setError(`Validation failed: ${errorMessages}`);
      } else {
        setError(error.response?.data?.message || `Failed to ${dialogType} course`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "create": return "Create New Course";
      case "edit": return `Edit Course: ${currentCourse?.title}`;
      case "publish": return `${currentCourse?.is_published ? "Unpublish" : "Publish"} Course`;
      case "delete": return "Delete Course";
      default: return "Course";
    }
  };

  const getActionButtonText = () => {
    switch (dialogType) {
      case "create": return "Create Course";
      case "edit": return "Save Changes";
      case "publish": return currentCourse?.is_published ? "Unpublish" : "Publish";
      case "delete": return "Delete";
      default: return "Submit";
    }
  };

  return (
    <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {dialogType === "delete" ? (
          <Typography>
            Are you sure you want to delete "{currentCourse?.title}"? This action cannot be undone.
          </Typography>
        ) : dialogType === "publish" ? (
          <Typography>
            {currentCourse?.is_published 
              ? "Are you sure you want to unpublish this course? Students will no longer be able to access it."
              : "Publish this course to make it available to students."}
          </Typography>
        ) : (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Course Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              autoFocus
              helperText="Title must be at least 3 characters long"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Upload Thumbnail
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </Button>
              {formData.thumbnail_url && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      objectFit: "cover",
                      borderRadius: 8
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color={dialogType === "delete" ? "error" : "primary"}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {getActionButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDialog;