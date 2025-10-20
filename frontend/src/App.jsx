import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';
import Notebook from './components/Notebook';
import Boards from './components/Boards';
import ErrorReports from './components/ErrorReports';
import ProgressReports from './components/ProgressReports';
import CodeSnippets from './components/CodeSnippets';
import TimeTracking from './components/TimeTracking';
import Team from './components/Team';
import Projects from './pages/Projects/Projects';
import Settings from './pages/Settings/Settings';
import ProjectDashboard from './pages/Projects/ProjectDashboard';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);


  const [notes, setNotes] = useState([
    { id: 1, title: 'Quick Ideas', content: 'Remember to refactor the auth module...', timestamp: new Date().toISOString() }
  ]);
  const [currentNote, setCurrentNote] = useState(null);

  const [boards, setBoards] = useState([
    {
      id: 'board1',
      name: 'Main Project',
      columns: [
        {
          id: 'col1',
          name: 'Backlog',
          cards: [
            {
              id: 'card1',
              title: 'Fix login bug',
              description: 'Users reporting timeout issues when logging in after 5 minutes of inactivity',
              labels: ['bug', 'high-priority'],
              assignee: 'John',
              dueDate: '2025-10-25',
              comments: 2,
              checklist: [
                { id: 'c1', text: 'Reproduce issue', done: true },
                { id: 'c2', text: 'Identify root cause', done: false },
                { id: 'c3', text: 'Implement fix', done: false }
              ]
            }
          ]
        },
        {
          id: 'col2',
          name: 'In Progress',
          cards: [
            {
              id: 'card2',
              title: 'Implement new API',
              description: 'REST endpoints for user management and authentication',
              labels: ['feature', 'backend'],
              assignee: 'Sarah',
              dueDate: '2025-10-22',
              comments: 5,
              checklist: [
                { id: 'c1', text: 'Design API structure', done: true },
                { id: 'c2', text: 'Implement endpoints', done: true },
                { id: 'c3', text: 'Write tests', done: false }
              ]
            }
          ]
        },
        {
          id: 'col3',
          name: 'Review',
          cards: []
        },
        {
          id: 'col4',
          name: 'Done',
          cards: [
            {
              id: 'card3',
              title: 'Setup CI/CD',
              description: 'Configure GitHub Actions for automated testing and deployment',
              labels: ['devops'],
              assignee: 'Mike',
              dueDate: '2025-10-18',
              comments: 3,
              checklist: [
                { id: 'c1', text: 'Create workflow file', done: true },
                { id: 'c2', text: 'Test deployment', done: true }
              ]
            }
          ]
        }
      ]
    }
  ]);
  const [selectedBoard, setSelectedBoard] = useState(boards[0]?.id);

  const [errorReports, setErrorReports] = useState([
    {
      id: 1,
      timestamp: '2025-10-19T10:30:00Z',
      severity: 'high',
      status: 'open',
      errorType: 'NullPointerException',
      message: 'Cannot read property of undefined',
      stackTrace: 'at AuthService.validateToken (auth.js:45)\nat middleware (app.js:120)',
      environment: 'production',
      userAgent: 'Chrome 118.0',
      userId: 'user_12345',
      assignedTo: null,
      notes: '',
      reproduced: false
    },
    {
      id: 2,
      timestamp: '2025-10-19T09:15:00Z',
      severity: 'medium',
      status: 'investigating',
      errorType: 'TimeoutError',
      message: 'Request timeout after 30000ms',
      stackTrace: 'at fetch (api.js:23)\nat UserService.getProfile (user.js:67)',
      environment: 'staging',
      userAgent: 'Firefox 119.0',
      userId: 'user_67890',
      assignedTo: 'John',
      notes: 'Appears to be related to slow database queries',
      reproduced: true
    }
  ]);

  const [projects] = useState([
    { id: 1, name: 'Dagboek v1.0', status: 'In Progress', progress: 65, lastUpdate: '2 hours ago' }
  ]);

  const [snippets] = useState([
    { id: 1, title: 'Auth Helper', language: 'javascript', code: 'const validateToken = (token) => { ... }' }
  ]);

  const handleLogin = () => {
    if (loginForm.username) {
      setCurrentUser({ username: loginForm.username, role: 'Developer' });
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      timestamp: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setCurrentNote(newNote);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    if (currentNote?.id === id) setCurrentNote(null);
  };

  const updateNote = (id, updates) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    if (currentNote?.id === id) setCurrentNote({ ...currentNote, ...updates });
  };

  const addCard = (boardId, columnId) => {
    const newCard = {
      id: `card${Date.now()}`,
      title: 'New Task',
      description: '',
      labels: [],
      assignee: null,
      dueDate: null,
      comments: 0,
      checklist: []
    };

    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(col => {
            if (col.id === columnId) {
              return { ...col, cards: [...col.cards, newCard] };
            }
            return col;
          })
        };
      }
      return board;
    }));
  };

  const deleteCard = (boardId, columnId, cardId) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(col => {
            if (col.id === columnId) {
              return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
            }
            return col;
          })
        };
      }
      return board;
    }));
  };

  const updateCard = (boardId, columnId, cardId, updates) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(col => {
            if (col.id === columnId) {
              return {
                ...col,
                cards: col.cards.map(card =>
                  card.id === cardId ? { ...card, ...updates } : card
                )
              };
            }
            return col;
          })
        };
      }
      return board;
    }));
  };

  const moveCard = (boardId, fromColId, toColId, cardId) => {
    setBoards(boards.map(board => {
      if (board.id === boardId) {
        let cardToMove = null;
        const newColumns = board.columns.map(col => {
          if (col.id === fromColId) {
            cardToMove = col.cards.find(c => c.id === cardId);
            return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
          }
          return col;
        });

        return {
          ...board,
          columns: newColumns.map(col => {
            if (col.id === toColId && cardToMove) {
              return { ...col, cards: [...col.cards, cardToMove] };
            }
            return col;
          })
        };
      }
      return board;
    }));
  };

  const addColumn = (boardId) => {
    const newColumn = {
      id: `col${Date.now()}`,
      name: 'New Column',
      cards: []
    };

    setBoards(boards.map(board => {
      if (board.id === boardId) {
        return { ...board, columns: [...board.columns, newColumn] };
      }
      return board;
    }));
  };

  const parseErrorReport = (text) => {
    try {
      const report = JSON.parse(text);
      const newError = {
        id: Date.now(),
        timestamp: report.timestamp || new Date().toISOString(),
        severity: report.severity || 'medium',
        status: 'open',
        errorType: report.errorType || report.type || 'Unknown Error',
        message: report.message || report.error || '',
        stackTrace: report.stackTrace || report.stack || '',
        environment: report.environment || report.env || 'unknown',
        userAgent: report.userAgent || report.browser || '',
        userId: report.userId || report.user || '',
        assignedTo: null,
        notes: '',
        reproduced: false
      };
      setErrorReports([newError, ...errorReports]);
      alert('Error report imported successfully!');
    } catch (e) {
      alert('Invalid JSON format. Please check your error report format.');
    }
  };

  const updateErrorReport = (id, updates) => {
    setErrorReports(errorReports.map(err => err.id === id ? { ...err, ...updates } : err));
  };

  const deleteErrorReport = (id) => {
    setErrorReports(errorReports.filter(err => err.id !== id));
  };

  const getLabelColor = (label) => {
    const colors = {
      'bug': 'bg-red-600/20 text-red-400',
      'feature': 'bg-blue-600/20 text-blue-400',
      'high-priority': 'bg-orange-600/20 text-orange-400',
      'backend': 'bg-purple-600/20 text-purple-400',
      'devops': 'bg-green-600/20 text-green-400'
    };
    return colors[label] || 'bg-slate-600/20 text-slate-400';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'bg-red-600 text-white',
      'high': 'bg-orange-600 text-white',
      'medium': 'bg-yellow-600 text-white',
      'low': 'bg-blue-600 text-white'
    };
    return colors[severity] || 'bg-slate-600 text-white';
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-red-600/20 text-red-400',
      'investigating': 'bg-yellow-600/20 text-yellow-400',
      'fixed': 'bg-green-600/20 text-green-400',
      'closed': 'bg-slate-600/20 text-slate-400'
    };
    return colors[status] || 'bg-slate-600/20 text-slate-400';
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-background text-foreground`}>
        <Routes>
          {!isAuthenticated ? (
            <Route path="*" element={<LoginPage
              loginForm={loginForm}
              setLoginForm={setLoginForm}
              handleLogin={handleLogin}
            />} />
          ) : (
            <Route path="/" element={<MainLayout
              currentUser={currentUser}
              handleLogout={handleLogout}
              theme={theme}
              toggleTheme={toggleTheme}
            />}>
              <Route index element={<Navigate to="/projects" />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={
                <ProjectDashboard
                  notes={notes}
                  boards={boards}
                  errorReports={errorReports}
                  snippets={snippets}
                  addNote={addNote}
                  selectedBoard={selectedBoard}
                />
              } />
              <Route path="/projects/:projectId/notebook" element={
                <Notebook
                  notes={notes}
                  currentNote={currentNote}
                  setCurrentNote={setCurrentNote}
                  addNote={addNote}
                  updateNote={updateNote}
                  deleteNote={deleteNote}
                />
              } />
              <Route path="/projects/:projectId/boards" element={
                <Boards
                  boards={boards}
                  selectedBoard={selectedBoard}
                  setSelectedBoard={setSelectedBoard}
                  addColumn={addColumn}
                  addCard={addCard}
                  deleteCard={deleteCard}
                  updateCard={updateCard}
                  moveCard={moveCard}
                  getLabelColor={getLabelColor}
                />
              } />
              <Route path="/projects/:projectId/errors" element={
                <ErrorReports
                  errorReports={errorReports}
                  setErrorReports={setErrorReports}
                  parseErrorReport={parseErrorReport}
                  updateErrorReport={updateErrorReport}
                  deleteErrorReport={deleteErrorReport}
                  getSeverityColor={getSeverityColor}
                  getStatusColor={getStatusColor}
                />
              } />
              <Route path="/projects/:projectId/progress" element={<ProgressReports projects={projects} />} />
              <Route path="/projects/:projectId/snippets" element={<CodeSnippets snippets={snippets} />} />
              <Route path="/projects/:projectId/time" element={<TimeTracking />} />
              <Route path="/projects/:projectId/team" element={<Team currentUser={currentUser} />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
