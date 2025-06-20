import React from "react";
import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";

const StatCard = ({ title, value, icon: IconComponent, color = "primary" }) => (
  <Card sx={{ minHeight: '100%', borderRadius: 2 }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark` }}>
          <IconComponent />
        </Avatar>
        <Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;