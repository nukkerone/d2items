import { connectToDatabase } from '../../lib/mongodb';

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res);
  }
}

const get = async (req, res) => {
  const { db } = await connectToDatabase();
  const uniqueItems = await db.collection('uniqueitems').find({}).limit(3).toArray();
  let items = [];

  items = await Promise.all(uniqueItems.map(async uniqueItem => {
    let elementRef;
    let proccessedUniqueItem = null;
    const weaponRef = await db.collection('weapons').findOne({ code: uniqueItem.code });
    //console.log('weaponRef ', weaponRef);
    if (!weaponRef) {
      const armorRef = await db.collection('armors').findOne({ code: uniqueItem.code });
      //console.log('armorRef ', armorRef);
      if (!armorRef) {
        const miscRef = await db.collection('misc').findOne({ code: uniqueItem.code });
        elementRef = miscRef ?? null;
        if (elementRef) {
          proccessedUniqueItem = processAsMisc({ ...uniqueItem, ...{ elementRef } });
        }
      } else {
        elementRef = armorRef;
        proccessedUniqueItem = processAsArmor({ ...uniqueItem, ...{ elementRef } });
      }
    } else {
      elementRef = weaponRef;
      proccessedUniqueItem = processAsWeapon({ ...uniqueItem, ...{ elementRef } });
    }

    return proccessedUniqueItem;

  }));

  res.json(items);
}

const processAsWeapon = (uniqueWeaponItem) => {
  const proccessed = {
    _id: uniqueWeaponItem._id,
    baseElement: 'weapon',
    index: uniqueWeaponItem.index,
    lvl: uniqueWeaponItem.lvl,
    'lvl req': uniqueWeaponItem['lvl req'],
    '*type': uniqueWeaponItem['*type'],
    durability: uniqueWeaponItem.elementRef.durability,
  };

  /* const proccessed = { ...uniqueWeaponItem }; */
  
  proccessed.speed = uniqueWeaponItem.elementRef.speed || 0;
  proccessed.avgdam = (uniqueWeaponItem.elementRef.mindam + uniqueWeaponItem.elementRef.maxdam) / 2 || 0;
  proccessed.dps = uniqueWeaponItem.elementRef.avgdam * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  proccessed['2handavgdam'] = (uniqueWeaponItem.elementRef['2handmindam'] + uniqueWeaponItem.elementRef['2handmaxdam']) / 2 || 0;
  proccessed['2handdps'] = uniqueWeaponItem.elementRef['2handavgdam'] * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  proccessed.avgmisdam = (uniqueWeaponItem.elementRef.minmisdam + uniqueWeaponItem.elementRef.maxmisdam) / 2 || 0;
  proccessed.misdps = uniqueWeaponItem.elementRef.avgmisdam * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  proccessed.levelreq = uniqueWeaponItem.elementRef.levelreq || 0;
  proccessed.tier = uniqueWeaponItem.elementRef.code === uniqueWeaponItem.elementRef.ultracode ? 3 : uniqueWeaponItem.elementRef.code === uniqueWeaponItem.elementRef.ubercode ? 2 : 1;
  proccessed.tierName = ['None', 'Norm', 'Excep', 'Elite'][proccessed.tier];

  return proccessed;
}

const processAsArmor = (uniqueArmorItem) => {
  return uniqueArmorItem;
}

const processAsMisc = (uniqueMiscItem) => {
  return uniqueMiscItem;
}