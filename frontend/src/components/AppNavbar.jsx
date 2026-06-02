function AppNavbar({ currentPage, setCurrentPage, onLogout }) {
  const navItems = [
    ['add', 'Add Computer'],
    ['search', 'Search Computer'],
    ['delete', 'Delete Computer'],
    ['modify', 'Modify Computer'],
    ['password', 'Change Password']
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <span className="navbar-brand">Computer Inventory</span>
        <div className="navbar-nav">
          {navItems.map(([key, label]) => (
            <button
              key={key}
              className={`nav-link btn btn-link ${currentPage === key ? 'active' : ''}`}
              onClick={() => setCurrentPage(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-outline-light" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AppNavbar;
