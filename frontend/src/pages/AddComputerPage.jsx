import { useState } from 'react';
import { createComputer } from '../api';
import ComputerForm from '../components/ComputerForm';

const emptyComputer = {
  Brand: '',
  Model: '',
  Memory: 8,
  HardDrive: 256,
  type: 'laptop',
  processor: 'Intel'
};

function AddComputerPage() {
  const [form, setForm] = useState(emptyComputer);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const computer = await createComputer(form);
      setMessage(`Created computer with ID: ${computer._id}`);
      setForm(emptyComputer);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Add Computer</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <ComputerForm form={form} setForm={setForm} onSubmit={handleSubmit} buttonText="Add Computer" />
    </div>
  );
}

export default AddComputerPage;
