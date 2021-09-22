import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      return get(req, res);
  }
}

/**
 * Changes a property and updates the proper generated items
 * @param {*} req 
 * @param {*} res 
 */
const get = async (req, res) => {
  const { db } = await connectToDatabase();
  const { character, gameType } = req.query;

  const totalUniques = await db.collection('unique_scrapped_normalized').find().count();
  const totalRunewordItems = await db.collection('runeword_scrapped_normalized').find().count();
  const totalSetItems = await db.collection('set_scrapped_normalized').find({ tier: { $ne: 'Full Set' } }).count();
  const total = totalUniques + totalRunewordItems + totalSetItems;

  const leaderboard = await db.collection('grail').aggregate([
    { $unwind: "$items" },
    { $match: { 'items.gameType': gameType } },
    { $match: { 'items.character': character } },
    { $group: { _id: "$_id", username: { '$first': '$username'}, size: { $sum: 1 } } },
    { $sort: { size: 1 } }
  ]).toArray();

  res.json({
    character,
    gameType,
    total,
    leaderboard,
  });
  
}