const Computer = require('../models/Computer');

async function getComputers(req, res) {
  try {
    const filter = {};

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.minMemory || req.query.maxMemory) {
      filter.Memory = {};

      if (req.query.minMemory) {
        filter.Memory.$gte = Number(req.query.minMemory);
      }

      if (req.query.maxMemory) {
        filter.Memory.$lte = Number(req.query.maxMemory);
      }
    }

    const computers = await Computer.find(filter).sort({ Brand: 1, Model: 1 });
    res.json(computers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getComputerById(req, res) {
  try {
    const computer = await Computer.findById(req.params.id);

    if (!computer) {
      return res.status(404).json({ message: 'Computer not found' });
    }

    res.json(computer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createComputer(req, res) {
  try {
    const computer = await Computer.create(req.body);
    res.status(201).json(computer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateComputer(req, res) {
  try {
    const computer = await Computer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!computer) {
      return res.status(404).json({ message: 'Computer not found' });
    }

    res.json(computer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteComputer(req, res) {
  try {
    const computer = await Computer.findByIdAndDelete(req.params.id);

    if (!computer) {
      return res.status(404).json({ message: 'Computer not found' });
    }

    res.json({ message: 'Computer deleted', computer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getComputers,
  getComputerById,
  createComputer,
  updateComputer,
  deleteComputer
};
