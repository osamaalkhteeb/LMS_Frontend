import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  Typography
} from "@mui/material";
import {
  Edit as EditIcon,
  Publish as PublishIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";

const CourseMenu = ({
  anchorEl,
  open,
  handleMenuClose,
  handleDialogOpen,
  currentCourse
}) => {
  return (
    <Menu
      id="course-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => handleDialogOpen("edit")}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        Edit Course
      </MenuItem>
      <MenuItem onClick={() => handleDialogOpen("publish")}>
        <ListItemIcon>
          <PublishIcon fontSize="small" />
        </ListItemIcon>
        {currentCourse?.is_published ? "Unpublish" : "Publish"}
      </MenuItem>
      <MenuItem onClick={() => handleDialogOpen("delete")}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <Typography color="error">Delete Course</Typography>
      </MenuItem>
    </Menu>
  );
};

export default CourseMenu;