import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
  Box,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { getSystemStats } from "../../services/systemService";

const SystemHealth = () => {
  const [systemData, setSystemData] = useState({
    components: [],
    serverUptime: 0,
    serverStatus: 'unknown',
    timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveUptime, setLiveUptime] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());

  useEffect(() => {
    fetchSystemHealth();
  }, []);
  
  // Real-time uptime clock - increments every second
  useEffect(() => {
    const uptimeTimer = setInterval(() => {
      setLiveUptime(prevUptime => prevUptime + 1);
    }, 1000);
    
    return () => clearInterval(uptimeTimer);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSystemStats();
      setSystemData(response);
      
      // Set initial live uptime and fetch time for real-time clock
      const currentUptime = response.uptime || response.serverUptime || response.server?.uptime || 0;
      setLiveUptime(currentUptime);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Error fetching system health:', error);
      setError('Failed to load system health data');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                System Components Health
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchSystemHealth}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Component</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Uptime</TableCell>
                      <TableCell>Response Time</TableCell>
                      <TableCell>Last Incident</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {systemData.components.map((component) => (
                      <TableRow key={component.id}>
                        <TableCell>{component.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={component.status} 
                            color={
                              component.status === "Healthy" || component.status === "Operational" ? "success" : 
                              component.status === "Degraded Performance" ? "warning" : "error"
                            } 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{component.uptime}</TableCell>
                        <TableCell>{component.responseTime}</TableCell>
                        <TableCell>{component.lastIncident}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Server Status
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box mb={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip 
                    label={systemData.serverStatus} 
                    color={systemData.serverStatus === 'healthy' ? 'success' : 'error'} 
                    size="small" 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Uptime: {formatUptime(liveUptime)}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Last Updated: {systemData.timestamp ? new Date(systemData.timestamp).toLocaleString() : 'Unknown'}
                </Typography>
                
                <Typography variant="body2" mb={1}>
                  Server Load: {systemData.serverLoad !== undefined && systemData.serverLoad !== null ? `${systemData.serverLoad}%` : 'N/A'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={systemData.serverLoad || 0}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                
                <Typography variant="body2" mb={1}>
                  CPU Usage: {systemData.cpuUsage !== undefined && systemData.cpuUsage !== null ? `${systemData.cpuUsage}%` : 'N/A'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={systemData.cpuUsage || 0}
                  color={systemData.cpuUsage > 80 ? "error" : systemData.cpuUsage > 60 ? "warning" : "success"}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                
                <Typography variant="body2" mb={1}>
                  Memory Usage: {systemData.memory ? `${Math.round((systemData.memory.used / systemData.memory.total) * 100)}%` : 'N/A'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={systemData.memory ? Math.round((systemData.memory.used / systemData.memory.total) * 100) : 0}
                  color={systemData.memory && (systemData.memory.used / systemData.memory.total) > 0.8 ? "error" : "warning"}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                
                <Typography variant="body2" mb={1}>
                  Storage Usage: {systemData.storageUsage ? `${systemData.storageUsage}%` : 'N/A'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={systemData.storageUsage || 0}
                  color="info"
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                /> 
              </Box>
            )} 
            

          </CardContent>
        </Card>
      </Grid>


    </Grid> 
  );
};

export default SystemHealth;