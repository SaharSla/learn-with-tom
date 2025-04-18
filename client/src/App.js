import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './componentes/Lobby/Lobby';
import CodeBlockPage from './componentes/CodeBlockPage/CodeBlockPage';
import Toolbar from './componentes/Toolbar/Toolbar'; // Toolbar imported

/*
  App Component

  - Wraps the entire app with a Router.
  - Defines the routing structure for the app:
    - "/" loads the Lobby page
    - "/block/:id" loads the CodeBlockPage for a specific code block
  - Toolbar is rendered outside the Routes to show on all pages
*/

function App() {
  return (
    <Router>
      <Toolbar /> {/* Toolbar shown on all pages */}
      <Routes>
        {/* Main lobby page */}
        <Route path="/" element={<Lobby />} />

        {/* Code block detail page, dynamic based on ID */}
        <Route path="/block/:id" element={<CodeBlockPage />} />
      </Routes>
    </Router>
  );
}

export default App;
