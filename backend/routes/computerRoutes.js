const express = require('express');
const router = express.Router();

const {
  getComputers,
  getComputerById,
  createComputer,
  updateComputer,
  deleteComputer
} = require('../controllers/computerController');

const protect = require('../middleware/authMiddleware');

router.get('/', protect, getComputers);
router.get('/:id', protect, getComputerById);
router.post('/', protect, createComputer);
router.put('/:id', protect, updateComputer);
router.delete('/:id', protect, deleteComputer);

module.exports = router;
