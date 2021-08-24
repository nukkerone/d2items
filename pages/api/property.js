import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async (req, res) => {
  switch (req.method) {
    case 'POST':
      return post(req, res);
  }
}

const post = async (req, res) => {
  const { db } = await connectToDatabase();
  const {_id, readable} = req.body;

  if (_id) {
    try {
      const result = await db.collection('properties').updateOne({ _id: new ObjectId(_id) }, { $set: { readable } });
      if (result.matchedCount) {
        res.json({ success: true });
      } else {
        res.status(500).send();
      }
    } catch (e) {
      res.status(500).send();
    }
  }
}