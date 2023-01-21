import React from 'react';
import ReactDOM from 'react-dom';
import { MemberstackProvider } from "@memberstack/react";
import './index.css';
import App from './App';
import { AuthContextProvider } from "./Context/AuthContext"

ReactDOM.render(
  <MemberstackProvider config={{ publicKey: "pk_sb_0669edd901db4905608e" }}>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </MemberstackProvider>,
  document.getElementById('root')
);