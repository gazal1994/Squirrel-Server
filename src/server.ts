// Import necessary modules and setup Express server
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

const app: Application = express();

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(express.json());

// Get all users endpoint
app.get('/api/users', (req: Request, res: Response) => {
  res.json(users);
});

// Logging middleware
app.use(morgan('dev')); // 'dev' format provides concise output

// Example data store (replace with your database implementation)
let users: { id: number; name: string; email: string }[] = [];

// Save user endpoint
app.post('/api/save-user', (req, res) => {
  const userData = req.body;
  
  // Check if userData is provided
  if (!userData || !userData.name || !userData.email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  
  // Check if user already exists
  const existingUser = users.find(user => user.email === userData.email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const id = users.length + 1; // Generate a unique ID (replace with your own logic)
  userData.id = id;
  const newUser = { id, ...userData };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user endpoint
app.put('/api/update-user/:id', (req: Request, res: Response) => {
  const id = parseInt(req.body.id);
  const index = users.findIndex(user => user.id === id);
  console.log(users);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Delete user endpoint
app.delete('/api/delete-user/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const deletedUser = users.splice(index, 1)[0];
    res.json(deletedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to your Express server!');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
