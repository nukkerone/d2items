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
  const propertiesWithReadable = await db.collection('properties').find({ readable: { $exists: true } }).toArray();

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
      proccessedUniqueItem = processAsWeapon({ ...uniqueItem, ...{ elementRef } }, propertiesWithReadable);
      /* proccessedUniqueItem = { ...uniqueItem, ...{ elementRef } }; */
    }

    return proccessedUniqueItem;
    
  }));

  db.collection('generated').drop();
  db.collection('generated').insertMany(items);

  res.json(items);
}

const processAsWeapon = (uniqueWeaponItem, propertiesWithReadable) => {
  let proccessed = {
    _id: uniqueWeaponItem._id,
    baseElement: 'weapon',
    index: uniqueWeaponItem.index,
    lvl: uniqueWeaponItem.lvl,
    'lvl req': uniqueWeaponItem['lvl req'],
    '*type': uniqueWeaponItem['*type'],
    durability: uniqueWeaponItem.elementRef.durability,
  };

  const readableProperties = getReadableProperties(uniqueWeaponItem, propertiesWithReadable);
  proccessed = { ...proccessed, ...readableProperties };
  /* console.log('readableProperties ', readableProperties); */
  
  proccessed.speed = uniqueWeaponItem.elementRef.speed || 0;
  proccessed.mindam = uniqueWeaponItem.elementRef.mindam;
  proccessed.maxdam = uniqueWeaponItem.elementRef.maxdam;
  proccessed.avgdam = (uniqueWeaponItem.elementRef.mindam + uniqueWeaponItem.elementRef.maxdam) / 2 || 0;
  proccessed.dps = uniqueWeaponItem.elementRef.avgdam * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  proccessed['is2handed'] = proccessed['2handmindam'] > 0;
  proccessed['2handmindam'] = uniqueWeaponItem.elementRef['2handmindam'];
  proccessed['2handmaxdam'] = uniqueWeaponItem.elementRef['2handmaxdam'];
  proccessed['2handavgdam'] = (uniqueWeaponItem.elementRef['2handmindam'] + uniqueWeaponItem.elementRef['2handmaxdam']) / 2 || 0;
  proccessed['2handdps'] = uniqueWeaponItem.elementRef['2handavgdam'] * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  proccessed.avgmisdam = (uniqueWeaponItem.elementRef.minmisdam + uniqueWeaponItem.elementRef.maxmisdam) / 2 || 0;
  proccessed.misdps = uniqueWeaponItem.elementRef.avgmisdam * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  /* proccessed.levelreq = uniqueWeaponItem.elementRef.levelreq || 0; */
  proccessed.tier = uniqueWeaponItem.elementRef.code === uniqueWeaponItem.elementRef.ultracode ? 3 : uniqueWeaponItem.elementRef.code === uniqueWeaponItem.elementRef.ubercode ? 2 : 1;
  proccessed.tierName = ['None', 'Normal', 'Exceptional', 'Elite'][proccessed.tier];

  return proccessed;
}

const getReadableProperties = (uniqueItem, propertiesWithReadable) => {
  const result = {};
  const propRegex = /(prop)[0-9]+/g;

  for (const prop in uniqueItem) {
    let match = prop.match(propRegex);
    match = match && match.length > 0 ? match[0] : null;
    if (match) {
      const propNumber = match.replace('prop', '');
      const propValue = uniqueItem[prop];
      let readableProperty = propertiesWithReadable.find(pwr => pwr.code === propValue);
      readableProperty = readableProperty ? readableProperty.readable : null;
      if (readableProperty) {
        readableProperty = readableProperty.replace(/<\*min>+/g, uniqueItem['min'+propNumber]);
        readableProperty = readableProperty.replace(/<\*max>+/g, uniqueItem['max'+propNumber]);
        readableProperty = readableProperty.replace(/<\*param>+/g, uniqueItem['par'+propNumber]);
      }
      result[prop] = readableProperty ?? 'unset - ' + propValue;
    }
  }

  return result;
}

const processAsArmor = (uniqueArmorItem) => {
  return uniqueArmorItem;
}

const processAsMisc = (uniqueMiscItem) => {
  return uniqueMiscItem;
}