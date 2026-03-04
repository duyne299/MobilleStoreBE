// Theme configuration for the admin dashboard
export const themes = {
  light: {
    name: "Light",
    colors: {
      background: "255 255 255",
      foreground: "15 23 42",
      card: "255 255 255",
      cardForeground: "15 23 42",
      popover: "255 255 255",
      popoverForeground: "15 23 42",
      primary: "37 99 235",
      primaryForeground: "255 255 255",
      secondary: "248 250 252",
      secondaryForeground: "15 23 42",
      muted: "248 250 252",
      mutedForeground: "100 116 139",
      accent: "248 250 252",
      accentForeground: "15 23 42",
      destructive: "239 68 68",
      destructiveForeground: "255 255 255",
      border: "226 232 240",
      input: "226 232 240",
      ring: "37 99 235",
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
  },
  dark: {
    name: "Dark",
    colors: {
      background: "2 6 23",
      foreground: "248 250 252",
      card: "15 23 42",
      cardForeground: "248 250 252",
      popover: "15 23 42",
      popoverForeground: "248 250 252",
      primary: "59 130 246",
      primaryForeground: "15 23 42",
      secondary: "30 41 59",
      secondaryForeground: "248 250 252",
      muted: "30 41 59",
      mutedForeground: "148 163 184",
      accent: "30 41 59",
      accentForeground: "248 250 252",
      destructive: "239 68 68",
      destructiveForeground: "255 255 255",
      border: "30 41 59",
      input: "30 41 59",
      ring: "59 130 246",
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
    },
  },
  blue: {
    name: "Blue",
    colors: {
      background: "248 250 252",
      foreground: "15 23 42",
      card: "255 255 255",
      cardForeground: "15 23 42",
      popover: "255 255 255",
      popoverForeground: "15 23 42",
      primary: "29 78 216",
      primaryForeground: "255 255 255",
      secondary: "239 246 255",
      secondaryForeground: "29 78 216",
      muted: "241 245 249",
      mutedForeground: "100 116 139",
      accent: "239 246 255",
      accentForeground: "29 78 216",
      destructive: "220 38 38",
      destructiveForeground: "255 255 255",
      border: "203 213 225",
      input: "203 213 225",
      ring: "29 78 216",
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(29 78 216 / 0.1)",
      md: "0 4px 6px -1px rgb(29 78 216 / 0.1), 0 2px 4px -2px rgb(29 78 216 / 0.1)",
      lg: "0 10px 15px -3px rgb(29 78 216 / 0.1), 0 4px 6px -4px rgb(29 78 216 / 0.1)",
    },
  },
};

export type ThemeName = keyof typeof themes;
export type ThemeColors = typeof themes.light.colors;

// Generate CSS variables for themes
export function generateThemeCSS(themeName: ThemeName) {
  const theme = themes[themeName];
  let css = `[data-theme="${themeName}"] {\n`;

  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    css += `  --${cssKey}: ${value};\n`;
  });

  css += "}\n";
  return css;
}

// Utility function to get current theme colors
export function getThemeColors(themeName: ThemeName): ThemeColors {
  return themes[themeName].colors;
}

// Common component variants
export const componentVariants = {
  button: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  input: {
    default:
      "border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent",
  },
  card: {
    default: "bg-card text-card-foreground border border-border shadow-sm",
    elevated: "bg-card text-card-foreground border border-border shadow-lg",
  },
  table: {
    header: "bg-muted text-muted-foreground border-b border-border",
    row: "border-b border-border hover:bg-accent/50",
    cell: "text-foreground",
  },
};
