import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

if (!new class { x:any }().hasOwnProperty('x')) throw new Error('Transpiler is not configured correctly');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);