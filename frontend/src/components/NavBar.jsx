// imports
import { AppBar, Box, Toolbar, IconButton, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => navigate("/dashboard")}
          >
            <HomeIcon />
          </IconButton>
          <Button onClick={() => navigate("/login")} color="inherit">
            Login
          </Button>
          <Button onClick={() => navigate("/register")} color="inherit">
            Sign up
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
