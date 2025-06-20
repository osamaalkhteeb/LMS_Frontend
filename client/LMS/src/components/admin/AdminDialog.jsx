import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

const AdminDialog = ({ open, onClose, dialogType, currentItem, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    role: 'STUDENT',
    password: ''
  });

  React.useEffect(() => {
    if (dialogType === 'editUser' && currentItem) {
      setFormData({
        name: currentItem.name || '',
        email: currentItem.email || '',
        role: currentItem.role ? currentItem.role.toUpperCase() : 'STUDENT',
        password: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'STUDENT',
        password: ''
      });
    }
  }, [dialogType, currentItem, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialogType === "createUser" && "Create New User"}
        {dialogType === "editUser" && `Edit User: ${currentItem?.name}`}
        {dialogType === "approveCourse" && `Approve Course: ${currentItem?.name}`}
        {dialogType === "rejectCourse" && `Reject Course: ${currentItem?.name}`}
        {dialogType === "viewCourse" && `Course Details: ${currentItem?.name}`}
        {dialogType === "customReport" && "Create Custom Report"}
        {dialogType === "systemSettings" && "System Settings"}
        {dialogType === "changeStatus" && 
          `${currentItem?.is_active ? "Suspend" : "Activate"} User: ${currentItem?.name}`}
        {dialogType === "deleteUser" && "Delete User"}
      </DialogTitle>
      <DialogContent>
        {dialogType === "deleteUser" ? (
          <Typography>
            Are you sure you want to delete user "{currentItem?.name}"? This action cannot be undone.
          </Typography>
        ) : dialogType === "approveCourse" ? (
          <Typography>
            Approve this course to make it available to students. The instructor will be notified.
          </Typography>
        ) : dialogType === "rejectCourse" ? (
          <>
            <Typography mb={2}>
              Are you sure you want to reject this course submission? The instructor will be notified.
            </Typography>
            <TextField
              label="Rejection Reason"
              fullWidth
              multiline
              rows={3}
              placeholder="Provide details about why this course was rejected..."
            />
          </>
        ) : dialogType === "changeStatus" ? (
          <Typography>
            {currentItem?.is_active 
              ? `Suspend user ${currentItem?.name}? They will not be able to access the system until reactivated.`
              : `Activate user ${currentItem?.name}? They will regain full access to the system.`}
          </Typography>
        ) : dialogType === "createUser" || dialogType === "editUser" ? (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              SelectProps={{
                native: true,
              }}
            >
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
              <option value="ADMIN">Admin</option>
            </TextField>
            {dialogType === "createUser" && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            )}
          </Box>
        ) : dialogType === "customReport" ? (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Report Name"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Report Type"
              defaultValue="Daily"
              SelectProps={{
                native: true,
              }}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Custom">Custom Range</option>
            </TextField>
            <TextField
              margin="normal"
              fullWidth
              select
              label="Report Category"
              defaultValue="All"
              SelectProps={{
                native: true,
              }}
            >
              <option value="All">All Data</option>
              <option value="Users">User Activity</option>
              <option value="Courses">Course Metrics</option>
              <option value="System">System Performance</option>
            </TextField>
          </Box>
        ) : dialogType === "systemSettings" ? (
          <Box component="form" sx={{ mt: 1 }}>
            <Typography variant="subtitle1" mb={2}>
              System Configuration
            </Typography>
            <TextField
              margin="normal"
              fullWidth
              label="Maintenance Mode"
              select
              defaultValue="false"
              SelectProps={{
                native: true,
              }}
            >
              <option value="false">Disabled</option>
              <option value="true">Enabled</option>
            </TextField>
            <TextField
              margin="normal"
              fullWidth
              label="New User Registration"
              select
              defaultValue="true"
              SelectProps={{
                native: true,
              }}
            >
              <option value="true">Allowed</option>
              <option value="false">Disabled</option>
            </TextField>
            <TextField
              margin="normal"
              fullWidth
              label="Course Submission"
              select
              defaultValue="true"
              SelectProps={{
                native: true,
              }}
            >
              <option value="true">Allowed</option>
              <option value="false">Disabled</option>
            </TextField>
          </Box>
        ) : (
          <Typography>
            Viewing details for: {currentItem?.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={dialogType === "createUser" || dialogType === "editUser" ? handleSubmit : onSubmit} 
          variant="contained"
          color={
            dialogType === "deleteUser" ? "error" : 
            dialogType === "changeStatus" && currentItem?.is_active ? "warning" :
            dialogType === "approveCourse" ? "success" : 
            dialogType === "rejectCourse" ? "error" : "primary"
          }
        >
          {dialogType === "createUser" && "Create User"}
          {dialogType === "editUser" && "Save Changes"}
          {dialogType === "approveCourse" && "Approve"}
          {dialogType === "rejectCourse" && "Reject"}
          {dialogType === "customReport" && "Generate"}
          {dialogType === "systemSettings" && "Save Settings"}
          {dialogType === "changeStatus" && (currentItem?.is_active ? "Suspend" : "Activate")}
          {dialogType === "deleteUser" && "Delete"}
          {dialogType === "viewCourse" && "Close"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminDialog;