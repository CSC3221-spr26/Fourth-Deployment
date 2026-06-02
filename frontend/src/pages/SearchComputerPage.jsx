import { useState } from 'react';
import { getComputers, getComputerById } from '../api';
import ComputerTable from '../components/ComputerTable';

function SearchComputerPage() {
  const [id, setId] = useState('');
  const [type, setType] = useState('');
  const [minMemory, setMinMemory] = useState('');
  const [maxMemory, setMaxMemory] = useState('');
  const [computers, setComputers] = useState([]);
  const [error, setError] = useState('');

  async function searchById(event) {
    event.preventDefault();
    setError('');

    try {
      const computer = await getComputerById(id);
      setComputers([computer]);
    } catch (error) {
      setComputers([]);
      setError(error.message);
    }
  }

  async function searchByFilters(event) {
    event.preventDefault();
    setError('');

    const params = new URLSearchParams();

    if (type) params.append('type', type);
    if (minMemory) params.append('minMemory', minMemory);
    if (maxMemory) params.append('maxMemory', maxMemory);

    try {
      const results = await getComputers(`?${params.toString()}`);
      setComputers(results);
    } catch (error) {
      setComputers([]);
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Search Computer</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <form onSubmit={searchById} className="card card-body mb-3">
            <h4>Search by ID</h4>
            <input className="form-control mb-3" value={id} onChange={(e) => setId(e.target.value)} placeholder="Computer ID" />
            <button className="btn btn-primary" type="submit">Search by ID</button>
          </form>
        </div>

        <div className="col-md-6">
          <form onSubmit={searchByFilters} className="card card-body mb-3">
            <h4>Search by Type or Memory</h4>

            <select className="form-select mb-3" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Any type</option>
              <option value="laptop">laptop</option>
              <option value="desktop">desktop</option>
            </select>

            <input className="form-control mb-3" type="number" value={minMemory} onChange={(e) => setMinMemory(e.target.value)} placeholder="Minimum memory" />
            <input className="form-control mb-3" type="number" value={maxMemory} onChange={(e) => setMaxMemory(e.target.value)} placeholder="Maximum memory" />

            <button className="btn btn-primary" type="submit">Search by Filters</button>
          </form>
        </div>
      </div>

      <ComputerTable computers={computers} />
    </div>
  );
}

export default SearchComputerPage;
