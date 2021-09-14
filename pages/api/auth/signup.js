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
  const { email, password } = req.body;

  //Validate
  if (!email || !email.includes('@') || !password) {
    res.status(422).json({ message: 'Invalid Data', error: true });
    return;
  }

  //Check existing
  const checkExisting = await db.collection('users').findOne({ email: email });

  //Send error response if duplicate user is found
  if (checkExisting) {
    res.status(422).json({ message: 'User already exists', error: true });
    return;
  }

  //Hash password and insert
  const status = await db.collection('users').insertOne({
    email,
    password: await hash(password, 12),
  });

  //Send success response
  res.status(201).json({ message: 'User created', email, error: false });
}