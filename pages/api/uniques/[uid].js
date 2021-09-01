import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import fetch from 'node-fetch';

export default async (req, res) => {
  switch (req.method) {
    case 'POST':
      switch (req.body.action) {
        case 'update':
          update(req, res);
          break;
        case 'add-entry':
          addEntry(req, res);
          break;
        case 'remove-entry':
          removeEntry(req, res);
          break;
      }  
      break;
    
  }
}

const update = async (req, res) => {
  const { db } = await connectToDatabase();
  const data = req.body.data;
  delete data._id;
  const uid = req.query.uid;
  const result = await db.collection('unique_scrapped_normalized').updateOne({ _id: new ObjectId(uid) }, { $set: data });
  res.json({ success: true });
}

const addEntry = async (req, res) => {
  const { db } = await connectToDatabase();
  const { key, value } = req.body.data;
  const uid = req.query.uid;
  const result = await db.collection('unique_scrapped_normalized').updateOne({ _id: new ObjectId(uid) }, { $set: {[key]: value} });
  res.json({ success: true });
}

const removeEntry = async (req, res) => {
  const { db } = await connectToDatabase();
  const { key } = req.body.data;
  const uid = req.query.uid;
  const result = await db.collection('unique_scrapped_normalized').updateOne({ _id: new ObjectId(uid) }, { $unset: { [key]: true } });
  res.json({ success: true });
}

/**
 * Changes a property and updates the proper generated items
 * @param {*} req 
 * @param {*} res 
 */
const post = async (req, res) => {
  const { db } = await connectToDatabase();
  const { _id, readable } = req.body;

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