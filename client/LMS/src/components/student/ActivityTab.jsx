
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";

const ActivityTab = ({ recentActivities }) => {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Recent Activity
        </Typography>
        <List>
          {recentActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem>
                <ListItemIcon>
                  <activity.icon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={activity.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {activity.course}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < recentActivities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ActivityTab;