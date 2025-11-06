import { AuthProvider } from './components/AuthProvider';
import { AppWithAuth } from './components/AppWithAuth';
import AppContent from './App';

export default function AppMain() {
  return (
    <AuthProvider>
      <AppWithAuth>
        <AppContent />
      </AppWithAuth>
    </AuthProvider>
  );
}
