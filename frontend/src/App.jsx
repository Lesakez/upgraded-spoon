import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Characters from './pages/Characters';
import CharacterCreation from './pages/CharacterCreation';
import Game from './pages/Game';
import PrivateRoute from './components/PrivateRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GameProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/characters"
                element={
                  <PrivateRoute>
                    <Characters />
                  </PrivateRoute>
                }
              />
              <Route
                path="/character-creation"
                element={
                  <PrivateRoute>
                    <CharacterCreation />
                  </PrivateRoute>
                }
              />
              <Route
                path="/game"
                element={
                  <PrivateRoute>
                    <Game />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </GameProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;