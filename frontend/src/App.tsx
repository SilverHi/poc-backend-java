import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, AgentCreate } from './pages';

function App(): React.JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agent-create" element={<AgentCreate />} />
        <Route path="/agent-create/:id" element={<AgentCreate />} />
      </Routes>
    </Router>
  );
}

export default App; 