import { connectToDatabase } from '../../lib/mongodb';

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      return get(req, res);
  }
}

const get = async (req, res) => {
  const { db } = await connectToDatabase();

  const uniqueItems = await db.collection('uniqueitems').find({}).limit(20).toArray();

  res.json(uniqueItems);
}