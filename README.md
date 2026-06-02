
# Computer Inventory App

## Netcentric Computing Project: Node + Express + MongoDB + React + Bootstrap + Heroku

In this project you will build a full-stack web application for managing computer records.

The application will use:

- Node.js
- Express
- MongoDB
- Mongoose
- React with Vite
- Bootstrap
- JSON Web Tokens for authentication
- Docker Compose for local development
- MongoDB Atlas for production data
- Heroku for deployment
- GitHub for source control

The app will manage one main data model: `Computer`.

Each computer has:

```text
Brand
Model
Memory
HardDrive
type: laptop or desktop
processor: Intel, AMD, or Mx
```

The app will also include:

- A seeded admin user
- Login and logout
- Password change
- A REST API for computer records
- Filtering by computer type
- Filtering by memory range
- A React frontend with Bootstrap

---

# Phase 0: Create the GitHub Repository

In this phase you will create the GitHub repository first, then clone it into your computer.

## 0.1 Create the repository on GitHub

Go to GitHub and create a new repository.

Suggested repository name:

```text
computer-inventory-app
```

When creating the repository, select these options:

- Add a `README.md`
- Add `.gitignore`
- Select the `Node` template for `.gitignore`
- Choose Public or Private depending on your instructor's directions

Do not add a license unless your instructor tells you to.

## 0.2 Clone the repository

After creating the repository, clone it to your computer.

Replace `YOUR-USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR-USERNAME/computer-inventory-app.git
cd computer-inventory-app
```

Open the folder in Visual Studio Code.

```bash
code .
```

---

# Phase 1: Project Structure and Dev Container Files

In this phase you will create the folder structure and Docker development environment.

## 1.1 Create the project folders

> Note: The following instructions are assuming you are executing the commands from the terminal. You are welcome to create the directories (folders) from within VSC.ß

From the root of the repository, run:

```bash
mkdir backend frontend
mkdir .devcontainer
```

Your project should now look like this:

```text
computer-inventory-app/
  README.md
  .gitignore
  backend/
  frontend/
  .devcontainer/
```

## 1.2 Create `docker-compose.yml`

Create a file named `docker-compose.yml` in the root of the project. Remember to write your own secret in `JWT_SECRET`

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: computer_backend
    ports:
      - "3000:3000"
    volumes:
      - .:/workspaces/computer-inventory-app
    working_dir: /workspaces/computer-inventory-app/backend
    environment:
      - NODE_ENV=development
      - PORT=3000
      - MONGO_URL=mongodb://db:27017/computer_inventory
      - JWT_SECRET=YOUR_OWN_SECRET_LOVE
    depends_on:
      - db
    command: sleep infinity
    stdin_open: true
    tty: true

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: computer_frontend
    ports:
      - "5173:5173"
    volumes:
      - .:/workspaces/computer-inventory-app
    working_dir: /workspaces/computer-inventory-app/frontend
    environment:
      - VITE_API_URL=http://localhost:3000/api
    depends_on:
      - backend
    command: sleep infinity
    stdin_open: true
    tty: true

  db:
    image: mongo:7
    container_name: computer_db
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
  
```

## 1.3 Create `.devcontainer/devcontainer.json`

Create `.devcontainer/devcontainer.json`.

```json
{
  "name": "Computer Inventory App",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "backend",
  "workspaceFolder": "/workspaces/computer-inventory-app",
  "shutdownAction": "stopCompose",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-azuretools.vscode-docker",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

This allows VS Code to reopen the project using the backend container as the main development container.

---

# Phase 2: Create the Backend Application

## 2.1 Create the backend `Dockerfile`

Create `backend/Dockerfile`.

```dockerfile
FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    vim \
    curl \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["sleep", "infinity"]
```

Or this one that includes `mongosh`:

```dockerfile
FROM node:20-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y curl gnupg \
    && curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" > /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y vim \
    && apt-get install -y mongodb-mongosh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["sleep", "infinity"]
```

## 2.2 Initialize the backend app

From the project root, run:

```bash
cd backend
npm init -y
```

Install dependencies:

```bash
npm install express mongoose cors dotenv bcrypt jsonwebtoken
npm install --save-dev nodemon
```

Update `backend/package.json` so that the scripts section looks like this:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed:user": "node seed/seedUser.js",
  "seed:computers": "node seed/seedComputers.js"
}
```

## 2.3 Create backend folders

From inside `backend`, run:

```bash
mkdir config models controllers routes middleware seed
```

The backend folder should look like this:

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  seed/
  Dockerfile
  package.json
  server.js
```

## 2.4 Create `server.js`

Create `backend/server.js`.

```js
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

## 2.5 Create `app.js`

Create `backend/app.js`.

```js
// Why are we requiring these three? What are they for?
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const computerRoutes = require('./routes/computerRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Computer Inventory API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/computers', computerRoutes);

module.exports = app;
```

## 2.6 Create the database connection

Create `backend/config/db.js`.

```js
const mongoose = require('mongoose');

async function connectDB() {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('Missing MongoDB connection string');
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
```

---

# Phase 3: Create the Computer Model and REST API

## 3.1 Create the Computer model

Create `backend/models/Computer.js`.

```js
const mongoose = require('mongoose');

const computerSchema = new mongoose.Schema(
  {
    Brand: {
      type: String,
      required: true,
      trim: true
    },
    Model: {
      type: String,
      required: true,
      trim: true
    },
    Memory: {
      type: Number,
      required: true,
      min: 1
    },
    HardDrive: {
      type: Number,
      required: true,
      min: 1
    },
    type: {
      type: String,
      enum: ['laptop', 'desktop'],
      required: true
    },
    processor: {
      type: String,
      enum: ['Intel', 'AMD', 'Mx'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Computer', computerSchema);
```

## 3.2 Create the computer controller

Create `backend/controllers/computerController.js`.

```js
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
```

## 3.3 Create the computer routes

Create `backend/routes/computerRoutes.js`.

```js
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
```

The routes are protected. They will not work until authentication is added in a later phase.

---

# Phase 4: Seed 100 Computer Records

In this phase you will create a seed program that inserts 100 computer records into the database.

## 4.1 Create the seed script

Create `backend/seed/seedComputers.js`.

```js
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
```

## 4.2 Run the seed script

Make sure the Docker containers are running.

In a back-end container terminal:

```bash
npm run seed:computers
```

---

# Phase 5: Add Filtering by Type and Memory Range

The filtering code was already added in the `getComputers` controller.

The API accepts these query parameters:

```text
type
minMemory
maxMemory
```

Examples:

```text
GET /api/computers?type=laptop
GET /api/computers?type=desktop
GET /api/computers?minMemory=16
GET /api/computers?minMemory=8&maxMemory=32
GET /api/computers?type=laptop&minMemory=16&maxMemory=64
```

Later, once authentication is working, you will be able to test these using Postman or the frontend.

---

# Phase 6: Add the User Model and Seeded Admin User

## 6.1 Create the User model

Create `backend/models/User.js`.

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
```

## 6.2 Create the seed user script

Create `backend/seed/seedUser.js`.

```js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seedUser() {
  try {
    await connectDB();

    const username = 'admin';
    const password = 'secret321';
    const passwordHash = await bcrypt.hash(password, 10);

    await User.deleteMany({ username });

    await User.create({ username, passwordHash });

    console.log('Seeded user: admin / secret321');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedUser();
```

## 6.3 Run the user seed script

To keep consistence with the commands we have been using you can run:
```bash
npm run seed:user
```

If you want to try something else, you can run the command below *but* from your host operating system, **not** from the container terminal.

```bash
docker compose exec backend npm run seed:user
```

---

# Phase 7: Add Authentication with JWT

## 7.1 Create the authentication controller

Create `backend/controllers/authController.js`.

```js
// Why do we require each one of the followin? What are they for?
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = createToken(user);

    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // How does this condition work?
    if (!newPassword || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must include at least one number' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  login,
  changePassword
};
```

## 7.2 Create authentication middleware

Create `backend/middleware/authMiddleware.js`.

```js
const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized. Missing token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
}

module.exports = protect;
```

## 7.3 Create authentication routes

Create `backend/routes/authRoutes.js`.

```js
const express = require('express');
const router = express.Router();

const { login, changePassword } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/change-password', protect, changePassword);

module.exports = router;
```

## 7.4 Test login with Postman

Start the app:

```bash
npm run dev
```

Send this request:

```text
POST http://localhost:3000/api/auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "secret321"
}
```

You should receive a token.

Use the token in protected requests:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

---

# Phase 8: Test the Protected Computer API

## 8.1 Create a computer

```text
POST http://localhost:3000/api/computers
```

Headers:

```text
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Body:

```json
{
  "Brand": "Dell",
  "Model": "Latitude 7440",
  "Memory": 16,
  "HardDrive": 512,
  "type": "laptop",
  "processor": "Intel"
}
```

## 8.2 Get all computers

```text
GET http://localhost:3000/api/computers
```

## 8.3 Get computers by type

```text
GET http://localhost:3000/api/computers?type=laptop
```

## 8.4 Get computers by memory range

```text
GET http://localhost:3000/api/computers?minMemory=16&maxMemory=32
```

## 8.5 Update a computer

```text
PUT http://localhost:3000/api/computers/COMPUTER_ID_HERE
```

Body:

```json
{
  "Memory": 32,
  "HardDrive": 1024
}
```

## 8.6 Delete a computer

```text
DELETE http://localhost:3000/api/computers/COMPUTER_ID_HERE
```

## 8.7 Tests
1. Test to do a GET without the token set up.
1. Test to do a GET with a wrong token.

---

# Phase 9: Create the React Frontend

## 9.1 Create the frontend app

From the project root:

> Warning: you need to move to your repo directory first, and then to front end. Below is an example, but it might be different for you.

Moving to the `frontend` directory from the `backend` directory where you were working before:
```
root@27c40b578ffb:/workspaces/computer-inventory-app/backend# pwd
/workspaces/computer-inventory-app/backend
root@27c40b578ffb:/workspaces/computer-inventory-app/backend# cd ..
root@27c40b578ffb:/workspaces/computer-inventory-app# pwd
/workspaces/computer-inventory-app
root@27c40b578ffb:/workspaces/computer-inventory-app# cd frontend/
root@27c40b578ffb:/workspaces/computer-inventory-app/frontend# pwd
/workspaces/computer-inventory-app/frontend
root@27c40b578ffb:/workspaces/computer-inventory-app/frontend# 
```

Once you have confirmed you are in the `frontend` directory:

```bash
npm create vite@latest . -- --template react
npm install
npm install bootstrap
```

 

## 9.2 Create the frontend Dockerfile

Create `frontend/Dockerfile`.

```dockerfile
FROM node:20-bookworm

WORKDIR /app

COPY . .

EXPOSE 5173

CMD ["sleep", "infinity"]
```

## 9.3 Import Bootstrap

Edit `frontend/src/main.jsx`.

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 9.4 Create frontend folders

From inside `frontend/src`, create:

```bash
mkdir pages components
```

---

# Phase 10: Add Frontend API Helper

Create `frontend/src/api.js`.

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function changePassword(oldPassword, newPassword) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword })
  });
}

export async function getComputers(query = '') {
  return request(`/computers${query}`);
}

export async function getComputerById(id) {
  return request(`/computers/${id}`);
}

export async function createComputer(computer) {
  return request('/computers', {
    method: 'POST',
    body: JSON.stringify(computer)
  });
}

export async function updateComputer(id, computer) {
  return request(`/computers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(computer)
  });
}

export async function deleteComputer(id) {
  return request(`/computers/${id}`, {
    method: 'DELETE'
  });
}
```

---

# Phase 11: Build the Frontend Pages

## 11.1 Create the navigation bar

Create `frontend/src/components/AppNavbar.jsx`.

```jsx
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
```

## 11.2 Create the computer form component

Create `frontend/src/components/ComputerForm.jsx`.

```jsx
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
```

## 11.3 Create the computer table component

Create `frontend/src/components/ComputerTable.jsx`.

```jsx
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
```

## 11.4 Create the login page

Create `frontend/src/pages/LoginPage.jsx`.

```jsx
import { useState } from 'react';
import { login } from '../api';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin');
  // For demonstration purposes, the password is pre-filled. In a real application, you would not do this.
  const [password, setPassword] = useState('secret321');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      onLogin();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h1 className="mb-4">Computer Inventory Login</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card card-body">
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
```

## 11.5 Create the add computer page

Create `frontend/src/pages/AddComputerPage.jsx`.

```jsx
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
```

## 11.6 Create the search computer page

Create `frontend/src/pages/SearchComputerPage.jsx`.

```jsx
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
```

## 11.7 Create the delete computer page

Create `frontend/src/pages/DeleteComputerPage.jsx`.

```jsx
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
```

## 11.8 Create the modify computer page

Create `frontend/src/pages/ModifyComputerPage.jsx`.

```jsx
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
```

## 11.9 Create the change password page

Create `frontend/src/pages/ChangePasswordPage.jsx`.

```jsx
import { useState } from 'react';
import { changePassword } from '../api';

function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await changePassword(oldPassword, newPassword);
      setMessage('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Change Password</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card card-body">
        <div className="mb-3">
          <label className="form-label">Old Password</label>
          <input className="form-control" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <div className="form-text">The new password must contain at least one number.</div>
        </div>

        <button className="btn btn-primary" type="submit">Change Password</button>
      </form>
    </div>
  );
}

export default ChangePasswordPage;
```

## 11.10 Replace `App.jsx`

Replace `frontend/src/App.jsx`.

```jsx
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import AddComputerPage from './pages/AddComputerPage';
import SearchComputerPage from './pages/SearchComputerPage';
import DeleteComputerPage from './pages/DeleteComputerPage';
import ModifyComputerPage from './pages/ModifyComputerPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AppNavbar from './components/AppNavbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('token')));
  const [currentPage, setCurrentPage] = useState('search');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      <AppNavbar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />

      <main className="container">
        {currentPage === 'add' && <AddComputerPage />}
        {currentPage === 'search' && <SearchComputerPage />}
        {currentPage === 'delete' && <DeleteComputerPage />}
        {currentPage === 'modify' && <ModifyComputerPage />}
        {currentPage === 'password' && <ChangePasswordPage />}
      </main>
    </>
  );
}

export default App;
```

---

# Phase 12: Run the Full App Locally

## 12.1 Run the Backend
Your VSC is currently running on the backend container, so we can use VSC Terminal to run the backend server, as we have done before:
```bash
root@60dc5961736b:/workspaces/computer-inventory-app# cd backend/
root@60dc5961736b:/workspaces/computer-inventory-app/backend# npm run dev

> backend@1.0.0 dev
> nodemon server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
◇ injected env (0) from .env // tip: ⌘ override existing { override: true }
Connected to MongoDB
Server running on port 3000
```
## 12.2 Run the Frontend
Now, we need to run the frontend too! But it is on a different container, so we will need to use your host operating system terminal (PowerShell for Windows, Terminal for Mac). Open a terminal and run the following commands **from your project root (your repo) directory**:

This command will open a terminal to your frontend container
```bash
docker compose exec frontend bash

```
After running it, it will look like this:
```bash
root@643790d62949:/workspaces/computer-inventory-app/frontend#
```

Very much like it does in VSC, but now you are 'attached' to a different computer.

Now you can run the frontend:
```bash
npm run dev -- --host 0.0.0.0
```

You will get an output similar to:
```bash

  VITE v8.0.14  ready in 128 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://255.25.0.254:5173/
  ➜  press h + enter to show help


```

Once both the frontend and backend servers are running you can go to your webapp frontpage using your browser. Open the address `http://localhost:5173`


## 12.3 Start testing your site

Login with:

```text
username: admin
password: secret321
```

Open the backend health route:

```text
http://localhost:3000/api/health
```

Seed data if needed:

```bash
docker compose exec backend npm run seed:user
docker compose exec backend npm run seed:computers
```

---

# Phase 13: Prepare for Heroku Deployment

For Heroku, we will deploy a single Node app. The backend will serve the built React frontend.

## OPTIONAL
If you want to keep your working code, you can c/p to another place, because the following steps will modify the code. Alternatively you can do the following steps.

- Commit and push your code to your main branch.
- Create and move to a new branch `for-deploy`. If you are using the command line to use git, then the command is `git checkout -b for-deploy` From now on, your previous code is "safe" in the main branch, and you would be working on a different branch.
- Later when you are asked to push to Heroku instead of `git push heroku main` you will `git push heroku for-deploy:main`


## 13.1 Update backend `app.js` to serve frontend in production

Replace `backend/app.js` with this version.

```js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const computerRoutes = require('./routes/computerRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Computer Inventory API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/computers', computerRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

module.exports = app;
```

## 13.2 Create a production build script

From the root of the repository, create `package.json`.

```json
{
  "scripts": {
    "build": "cd frontend && npm install --include=dev && npm run build && cd ../backend && npm install && rm -rf public && mkdir public && cp -r ../frontend/dist/* public/",
    "start": "cd backend && npm start",
    "seed:user": "cd backend && npm run seed:user",
    "seed:computers": "cd backend && npm run seed:computers"
  },
  "engines": {
    "node": "20.x"
  }
}
```

Heroku will run the root `build` script and then the root `start` script.

## 13.3 Update frontend API URL for production

For production, the frontend can call the API using a relative URL.

Update `frontend/src/api.js` so the first line is:

```js
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

For local development, Docker Compose still provides:

```text
VITE_API_URL=http://localhost:3000/api
```

For Heroku, the app will use:

```text
/api
```

---

# Phase 14: Deploy to Heroku

This section assumes you already have:

- A Heroku account
- Heroku CLI installed
- A MongoDB Atlas cluster already created
- An Atlas connection string

## 14.1 Login to Heroku

```bash
heroku login
```

## 14.2 Create a Heroku app

From the root of the repository:

```bash
heroku create YOUR-HEROKU-APP-NAME
```

Example:

```bash
heroku create computer-inventory-demo
```

## 14.3 Set environment variables

Set the Atlas connection string.

```bash
heroku config:set MONGODB_URI="YOUR_ATLAS_CONNECTION_STRING"
```

Set the JWT secret.

```bash
heroku config:set JWT_SECRET="use-a-long-random-secret-here"
```

Set Node environment.

```bash
heroku config:set NODE_ENV=production
```

## 14.4 Commit your files

```bash
git status
git add .
git commit -m "Build computer inventory full-stack app"
```

## 14.5 Push to GitHub

```bash
git push origin main
```

If your branch is named `master`, use:

```bash
git push origin master
```

## 14.6 Deploy to Heroku

```bash
git push heroku main
```

If your branch is named `master`, use:

```bash
git push heroku master
```

## 14.7 Seed the production database

Run the seed scripts on Heroku.

```bash
heroku run "npm run seed:user"
heroku run "npm run seed:computers"
```


## 14.8 Open the deployed app

```bash
heroku open
```

Login with:

```text
username: admin
password: secret321
```

---

# Phase 15: Suggested Student Checkpoints

## Checkpoint 1

Students should have:

- GitHub repo created
- Repo cloned locally
- Docker Compose file created
- Backend and frontend folders created

## Checkpoint 2

Students should have:

- Backend running
- MongoDB running
- `/api/health` working

## Checkpoint 3

Students should have:

- Computer model created
- Computer REST routes created
- Seed script inserting 100 records

## Checkpoint 4

Students should have:

- Admin user seeded
- Login working
- JWT token returned
- Protected API routes working

## Checkpoint 5

Students should have:

- React frontend running
- Login page working
- CRUD operations working through the frontend

## Checkpoint 6

Students should have:

- App deployed on Heroku
- App connected to MongoDB Atlas
- Production app working through browser

---

# Troubleshooting

## Problem: `getaddrinfo ENOTFOUND db`

This usually means the backend is trying to connect to a hostname named `db`, but it is not running inside Docker Compose.

Use this connection string only inside Docker Compose:

```text
mongodb://db:27017/computer_inventory
```

If running directly on your host computer, use:

```text
mongodb://localhost:27017/computer_inventory
```

## Problem: frontend cannot reach backend

Check that Docker Compose has this variable for the frontend:

```text
VITE_API_URL=http://localhost:3000/api
```

Also make sure the backend container is running.

## Problem: login fails

Run the seed user script again:

```bash
docker compose exec backend npm run seed:user
```

Then try:

```text
admin / secret321
```

## Problem: protected routes return 401

Make sure your frontend or Postman request sends the token as:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

## Problem: Heroku cannot connect to Atlas

Check:

- Atlas network access allows Heroku connections
- The Atlas username and password are correct
- The Heroku `MONGODB_URI` config variable is correct

View Heroku config:

```bash
heroku config
```

View Heroku logs:

```bash
heroku logs --tail
```

---

# Final Project Structure

At the end, your project should look similar to this:

```text
computer-inventory-app/
  README.md
  .gitignore
  package.json
  docker-compose.yml
  .devcontainer/
    devcontainer.json
  backend/
    Dockerfile
    package.json
    server.js
    app.js
    config/
      db.js
    controllers/
      authController.js
      computerController.js
    middleware/
      authMiddleware.js
    models/
      Computer.js
      User.js
    routes/
      authRoutes.js
      computerRoutes.js
    seed/
      seedComputers.js
      seedUser.js
  frontend/
    Dockerfile
    package.json
    index.html
    src/
      main.jsx
      App.jsx
      api.js
      components/
        AppNavbar.jsx
        ComputerForm.jsx
        ComputerTable.jsx
      pages/
        AddComputerPage.jsx
        ChangePasswordPage.jsx
        DeleteComputerPage.jsx
        LoginPage.jsx
        ModifyComputerPage.jsx
        SearchComputerPage.jsx
```

---

# Suggested Enhancements

After completing the main project, you could add:

- Better form validation
- Pagination
- Search by brand or model
- Confirmation dialogs before deleting
- User registration
- More roles, such as admin and viewer
- Better error messages
- Loading spinners
- A dashboard summary page
- Unit tests or API integration tests