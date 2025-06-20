import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

const InstructorProfile = ({ instructor }) => {
  return (
    <Box mb={4} display="flex" alignItems="center" gap={3}>
      <Avatar
        sx={{ width: 80, height: 80, fontSize: "2rem", bgcolor: "primary.main" }}
        src={instructor?.avatar ? `${instructor.avatar}?t=${Date.now()}` : instructor?.avatar}
      >
        {instructor?.name
          ? instructor.name
              .split(" ")
              .map((n) => n[0])
              .join("")
          : "I"}
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          {instructor?.name || "Instructor Name"}
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={0.5}>
          {instructor?.email || "instructor@example.com"}
        </Typography>
      </Box>
    </Box>
  );
};

export default InstructorProfile;