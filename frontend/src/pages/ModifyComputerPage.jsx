import { useState } from 'react';
import { getComputerById, updateComputer } from '../api';
import ComputerForm from '../components/ComputerForm';

function ModifyComputerPage() {
  const [id, setId] = useState('');
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadComputer(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const computer = await getComputerById(id);
      setForm({
        Brand: computer.Brand,
        Model: computer.Model,
        Memory: computer.Memory,
        HardDrive: computer.HardDrive,
        type: computer.type,
        processor: computer.processor
      });
    } catch (error) {
      setForm(null);
      setError(error.message);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await updateComputer(id, form);
      setMessage('Computer updated');
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Modify Computer</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={loadComputer} className="card card-body mb-3">
        <label className="form-label">Computer ID</label>
        <input className="form-control mb-3" value={id} onChange={(e) => setId(e.target.value)} required />
        <button className="btn btn-primary" type="submit">Load Computer</button>
      </form>

      {form && (
        <ComputerForm form={form} setForm={setForm} onSubmit={handleUpdate} buttonText="Update Computer" />
      )}
    </div>
  );
}

export default ModifyComputerPage;
