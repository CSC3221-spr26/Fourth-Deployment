import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import AddComputerPage from './pages/AddComputerPage';
import SearchComputerPage from './pages/SearchComputerPage';
import DeleteComputerPage from './pages/DeleteComputerPage';
import ModifyComputerPage from './pages/ModifyComputerPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AppNavbar from './components/AppNavbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('token')));
  const [currentPage, setCurrentPage] = useState('search');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      <AppNavbar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />

      <main className="container">
        {currentPage === 'add' && <AddComputerPage />}
        {currentPage === 'search' && <SearchComputerPage />}
        {currentPage === 'delete' && <DeleteComputerPage />}
        {currentPage === 'modify' && <ModifyComputerPage />}
        {currentPage === 'password' && <ChangePasswordPage />}
      </main>
    </>
  );
}

export default App;
