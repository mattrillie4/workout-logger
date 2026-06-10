import { createTheme } from "@mui/material/styles";

const trainingTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF5A1F",
      contrastText: "#101214",
    },
    secondary: {
      main: "#B6FF3B",
      contrastText: "#101214",
    },
    background: {
      default: "#101214",
      paper: "#1A1D21",
    },
    text: {
      primary: "#F5F7FA",
      secondary: "#A8B0BA",
      disabled: "#707A86",
    },
    divider: "#323840",
    success: {
      main: "#39E58C",
      contrastText: "#101214",
    },
    error: {
      main: "#FF4D5E",
      contrastText: "#101214",
    },
    warning: {
      main: "#FFB020",
      contrastText: "#101214",
    },
    info: {
      main: "#38BDF8",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      letterSpacing: 0,
    },
    h6: {
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#101214",
        },
        a: {
          color: "#FF5A1F",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#101214",
          backgroundImage: "none",
          borderBottom: "1px solid #323840",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderColor: "#323840",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          boxShadow: "0 0 0 1px rgba(255, 90, 31, 0.2)",
        },
        outlined: {
          borderColor: "#323840",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#24282E",
        },
        notchedOutline: {
          borderColor: "#323840",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          backgroundColor: "#24282E",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "50%",
        },
      },
    },
  },
});

export default trainingTheme;
