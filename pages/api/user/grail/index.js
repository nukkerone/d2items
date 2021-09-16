import { getSession } from 'next-auth/client';
import { connectToDatabase } from '../../../../lib/mongodb';

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      return get(req, res);
    case 'POST':
      return post(req, res);
    case 'DELETE':
      return remove(req, res);
  }
}

const get = async (req, res) => {
  const session = await getSession({ req })
  if (session && session.user) {
    // Signed in
    const email = session.user.email;
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });

    const grail = user.grail ?? [];

    return res.status(200).json(grail);
  } else {
    // Not Signed in
    return res.status(401).json(null);
  }
}

const post = async (req, res) => {
  debugger;
  const session = await getSession({ req });
  if (session && session.user) {
    // Signed in
    const email = session.user.email;
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });
    const grail = user.grail ?? [];
    const slug = req.body.slug;
    const category = req.body.category;
    const found = grail.find((grailItem) => grailItem.category === category && grailItem.slug === slug);
    if (!found) {
      grail.push({ category, slug });
      await db.collection('users').updateOne({ email }, [
        { $set: { grail } }
      ]);
    }

    return res.status(200).json(grail);
  } else {
    // Not Signed in
    return res.status(401).json(null);
  }
}

const remove = async (req, res) => {
  debugger;
  const session = await getSession({ req });
  if (session && session.user) {
    // Signed in
    const email = session.user.email;
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });
    let grail = user.grail ?? [];
    const slug = req.body.slug;
    const category = req.body.category;
    const index = grail.findIndex((grailItem) => grailItem.category === category && grailItem.slug === slug);
    if (index >= 0) {
      grail = grail.splice(index, 1);
      await db.collection('users').updateOne({ email }, [
        { $set: { grail } }
      ]);
    }

    return res.status(200).json(grail);
  } else {
    // Not Signed in
    return res.status(401).json(null);
  }
}