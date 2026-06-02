require('dotenv').config();
const mongoose = require('mongoose');
const Computer = require('../models/Computer');
const connectDB = require('../config/db');

const brands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Acer', 'Asus', 'MSI', 'Samsung'];
const laptopModels = ['Latitude', 'ThinkPad', 'MacBook Air', 'ZenBook', 'Pavilion', 'Swift', 'Galaxy Book'];
const desktopModels = ['OptiPlex', 'ThinkCentre', 'iMac', 'Pavilion Desktop', 'ROG Desktop', 'Aspire Tower'];
const memories = [4, 8, 12, 16, 24, 32, 64];
const hardDrives = [128, 256, 512, 1024, 2048];
const processors = ['Intel', 'AMD', 'Mx'];

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function makeComputer(index) {
  const type = index % 2 === 0 ? 'laptop' : 'desktop';
  const modelList = type === 'laptop' ? laptopModels : desktopModels;

  return {
    Brand: pick(brands),
    Model: `${pick(modelList)} ${1000 + index}`,
    Memory: pick(memories),
    HardDrive: pick(hardDrives),
    type,
    processor: pick(processors)
  };
}

async function seedComputers() {
  try {
    await connectDB();

    await Computer.deleteMany({});

    const computers = [];

    for (let i = 1; i <= 100; i++) {
      computers.push(makeComputer(i));
    }

    await Computer.insertMany(computers);

    console.log('Inserted 100 computer records');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedComputers();
