import { connectToDatabase } from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export default async (req, res) => {
  switch (req.method) {
    case 'POST':
      return signup(req, res);
    default:
      res.status(500).json({ message: 'Route not valid' });
  }
}

const signup = async (req, res) => {
  const { db } = await connectToDatabase();
  const { username, email, password } = req.body;

  //Validate
  if (!email || !email.includes('@') || !username || !password) {
    res.status(422).json({ message: 'Invalid Data', error: true });
    return;
  }

  //Check existing username
  let checkExisting = await db.collection('users').findOne({ username });
  if (checkExisting) {
    res.status(422).json({ message: 'Username already exists', error: true });
    return;
  }

  //Check existing email
  checkExisting = await db.collection('users').findOne({ email });
  if (checkExisting) {
    res.status(422).json({ message: 'Email already exists', error: true });
    return;
  }

  //Hash password and insert
  const status = await db.collection('users').insertOne({
    username,
    email,
    password: await hash(password, 12),
  });

  //Send success response
  res.status(201).json({ message: 'User created', email, error: false });
}