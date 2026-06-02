function ComputerForm({ form, setForm, onSubmit, buttonText }) {
  function updateField(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: name === 'Memory' || name === 'HardDrive' ? Number(value) : value
    });
  }

  return (
    <form onSubmit={onSubmit} className="card card-body">
      <div className="mb-3">
        <label className="form-label">Brand</label>
        <input name="Brand" className="form-control" value={form.Brand} onChange={updateField} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Model</label>
        <input name="Model" className="form-control" value={form.Model} onChange={updateField} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Memory</label>
        <input name="Memory" type="number" className="form-control" value={form.Memory} onChange={updateField} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Hard Drive</label>
        <input name="HardDrive" type="number" className="form-control" value={form.HardDrive} onChange={updateField} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Type</label>
        <select name="type" className="form-select" value={form.type} onChange={updateField} required>
          <option value="laptop">laptop</option>
          <option value="desktop">desktop</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Processor</label>
        <select name="processor" className="form-select" value={form.processor} onChange={updateField} required>
          <option value="Intel">Intel</option>
          <option value="AMD">AMD</option>
          <option value="Mx">Mx</option>
        </select>
      </div>

      <button className="btn btn-primary" type="submit">{buttonText}</button>
    </form>
  );
}

export default ComputerForm;
