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
    let grail = await db.collection('grail').findOne({ email });
    const lastProfile = grail?.lastProfile ?? null;

    return res.status(200).json(lastProfile);
  } else {
    return res.status(401).json(null);
  }
}