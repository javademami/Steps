import React from 'react';
import { ThemeProvider } from './context/ThemeContext'; // تغییر مسیر به مکان درست فایل
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
