import { useState } from 'react';
import { deleteComputer } from '../api';

function DeleteComputerPage() {
  const [id, setId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await deleteComputer(id);
      setMessage('Computer deleted');
      setId('');
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Delete Computer</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card card-body">
        <label className="form-label">Computer ID</label>
        <input className="form-control mb-3" value={id} onChange={(e) => setId(e.target.value)} required />
        <button className="btn btn-danger" type="submit">Delete Computer</button>
      </form>
    </div>
  );
}

export default DeleteComputerPage;
