import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  FitnessCenter as FitnessCenterIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

export default function AdminLayout({ children, onLogout }) {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: "#1976d2" }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            <FitnessCenterIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            GymFreak Admin
          </Typography>
          <Avatar sx={{ bgcolor: "white", color: "#1976d2" }}>AD</Avatar>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#f5f5f5",
          },
        }}
      >
        <Toolbar /> {/* Spacer */}
        <List>
          {[
            {
              text: "Dashboard",
              icon: <DashboardIcon color="primary" />,
              path: "/admin",
            },
            { text: "Members", icon: <PeopleIcon />, path: "/admin/members" },
            {
              text: "Workouts",
              icon: <FitnessCenterIcon />,
              path: "/admin/workouts",
            },
            {
              text: "Payments",
              icon: <PaymentIcon />,
              path: "/admin/payments",
            },
            {
              text: "Settings",
              icon: <SettingsIcon />,
              path: "/admin/settings",
            },
          ].map((item) => (
            <ListItem button key={item.text} component="a" href={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: "auto", p: 2 }}>
          <ListItem button onClick={onLogout}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Spacer for app bar */}
        {children}
      </Box>
    </Box>
  );
}
