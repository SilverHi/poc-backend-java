import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, AgentCreate } from './pages';
import WorkflowApp from './pages/workflow/App';

function App(): React.JSX.Element {
  return (
    <Router basename="/ui">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agent-create" element={<AgentCreate />} />
        <Route path="/agent-create/:id" element={<AgentCreate />} />
        <Route path="/workflow" element={<WorkflowApp />} />
      </Routes>
    </Router>
  );
}

export default App; 