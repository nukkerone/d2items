import { getSession } from 'next-auth/client';
import { connectToDatabase } from '../../../../lib/mongodb';

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      return get(req, res);
  }
}

const get = async (req, res) => {
  const session = await getSession({ req })
  if (session && session.user) {
    const email = session.user.email;
    const { db } = await connectToDatabase();
    const itemType = req.query.type;
    
    let grail = await db.collection('grail').aggregate([
        { $unwind: "$items" },
        { $match: { 'email': email } },
        { $match: { 'items.category': itemType } },
        { $group: { _id: '$items.slug' } },
    ]).toArray();
    grail = grail.map(i => i._id);

    return res.status(200).json(grail);
  } else {
    return res.status(401).json(null);
  }
}