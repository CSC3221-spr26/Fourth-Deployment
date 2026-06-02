function ComputerTable({ computers }) {
  if (!computers.length) {
    return <p>No computers found.</p>;
  }

  return (
    <table className="table table-striped table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Brand</th>
          <th>Model</th>
          <th>Memory</th>
          <th>Hard Drive</th>
          <th>Type</th>
          <th>Processor</th>
        </tr>
      </thead>
      <tbody>
        {computers.map((computer) => (
          <tr key={computer._id}>
            <td>{computer._id}</td>
            <td>{computer.Brand}</td>
            <td>{computer.Model}</td>
            <td>{computer.Memory}</td>
            <td>{computer.HardDrive}</td>
            <td>{computer.type}</td>
            <td>{computer.processor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ComputerTable;
