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
    const user = await db.collection('users').findOne({ email });
    const [type, slug] = req.query.gid;
    const grailItem = await db.collection('grailitems').findOne({ email: user.email, type, slug });
    console.log('Grail item', grailItem);

    return res.status(200).json(grailItem ?? 'null');
  } else {
    return res.status(401).json('null');
  }
}
