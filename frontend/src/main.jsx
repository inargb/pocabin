import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import './app-extra.css';
import { applyTheme } from './lib/theme.js';
import App from './App.jsx';

applyTheme();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
