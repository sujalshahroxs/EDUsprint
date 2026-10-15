import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './layouts/Layout';

// Placeholders for pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Sprints from './pages/Sprints';
import Tasks from './pages/Tasks';
import Risks from './pages/Risks';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="sprints" element={<Sprints />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="risks" element={<Risks />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
