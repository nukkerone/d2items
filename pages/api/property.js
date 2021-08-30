import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import fetch from 'node-fetch';

export default async (req, res) => {
  switch (req.method) {
    case 'POST':
      return post(req, res);
  }
}

/**
 * Changes a property and updates the proper generated items
 * @param {*} req 
 * @param {*} res 
 */
const post = async (req, res) => {
  const { db } = await connectToDatabase();
  const {_id, readable} = req.body;

  if (_id) {
    try {
      const result = await db.collection('properties').updateOne({ _id: new ObjectId(_id) }, { $set: { readable } });
      if (result.matchedCount) {
        const prop = await db.collection('properties').findOne({ _id: new ObjectId(_id) });
        if (prop) {
          const code = prop.code;
          // generated ids to update
          let generatedIds = await db.collection('generated').find({ propsAsArray: code }).toArray();
          generatedIds = generatedIds.map(i => i._id.toString()) ?? [];
          const resp = await fetch('http://localhost:3000/api/generator', {
            method: 'POST',
            body: JSON.stringify({
              ids: generatedIds
            }),
            headers: { 'Content-Type': 'application/json' }
          });

          res.json({ success: resp });
        } else {
          res.json({ success: true });
        }

        /* res.json({ success: true }); */
        
      } else {
        res.status(500).send();
      }
    } catch (e) {
      res.status(500).send();
    }
  }
}