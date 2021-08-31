import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res);
    case 'POST':
      return await post(req, res);
  }
}

const get = async (req, res) => {
  const { db } = await connectToDatabase();
  const uniqueItems = await db.collection('uniqueitems').find({}).limit(400).toArray();
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
      proccessedUniqueItem = processAsWeapon({ ...uniqueItem, ...{ elementRef } });
      /* proccessedUniqueItem = { ...uniqueItem, ...{ elementRef } }; */
    }

    const { propsAsArray, readableProperties } = processProperties(uniqueItem, propertiesWithReadable);
    proccessedUniqueItem = { ...proccessedUniqueItem, ...{ propsAsArray }, ...readableProperties };

    return proccessedUniqueItem;

  }));

  items = items.filter(i => !!i);

  db.collection('generated').drop();
  db.collection('generated').insertMany(items);

  res.json(items);
}

const getWeaponRef = async (uniqueItem) => {
  const { db } = await connectToDatabase();
  const weaponRef = await db.collection('weapons').findOne({ code: uniqueItem.code });
  return weaponRef;
}

const getArmorRef = async (uniqueItem) => {
  const { db } = await connectToDatabase();
  const armorRef = await db.collection('armors').findOne({ code: uniqueItem.code });
  return armorRef;
}

const getMiscRef = async (uniqueItem) => {
  const { db } = await connectToDatabase();
  const miscRef = await db.collection('misc').findOne({ code: uniqueItem.code });
  return miscRef;
}

const processAsWeapon = (uniqueWeaponItem) => {
  if (!uniqueWeaponItem) {
    return null;
  }
  let proccessed = {
    _id: uniqueWeaponItem._id,
    baseElement: 'weapon',
    index: uniqueWeaponItem.index,
    lvl: uniqueWeaponItem.lvl,
    'lvl req': uniqueWeaponItem['lvl req'],
    '*type': uniqueWeaponItem['*type'],
    durability: uniqueWeaponItem.elementRef.durability,
    reqstr: uniqueWeaponItem.elementRef.reqstr,
  };
  
  proccessed.speed = uniqueWeaponItem.elementRef.speed || 0;
  proccessed.mindam = uniqueWeaponItem.elementRef.mindam;
  proccessed.maxdam = uniqueWeaponItem.elementRef.maxdam;
  proccessed.avgdam = (uniqueWeaponItem.elementRef.mindam + uniqueWeaponItem.elementRef.maxdam) / 2 || 0;
  proccessed.dps = uniqueWeaponItem.elementRef.avgdam * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  proccessed['2handmindam'] = uniqueWeaponItem.elementRef['2handmindam'];
  proccessed['2handmaxdam'] = uniqueWeaponItem.elementRef['2handmaxdam'];
  proccessed['2handavgdam'] = (uniqueWeaponItem.elementRef['2handmindam'] + uniqueWeaponItem.elementRef['2handmaxdam']) / 2 || 0;
  proccessed['2handdps'] = uniqueWeaponItem.elementRef['2handavgdam'] * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  proccessed['is2handed'] = proccessed['2handmindam'] > 0;
  proccessed.avgmisdam = (uniqueWeaponItem.elementRef.minmisdam + uniqueWeaponItem.elementRef.maxmisdam) / 2 || 0;
  proccessed.misdps = uniqueWeaponItem.elementRef.avgmisdam * (100 - uniqueWeaponItem.elementRef.speed) / 100 || 0;
  /* proccessed.levelreq = uniqueWeaponItem.elementRef.levelreq || 0; */
  proccessed.tier = uniqueWeaponItem.elementRef.code === uniqueWeaponItem.elementRef.ultracode ? 3 : uniqueWeaponItem.elementRef.code === uniqueWeaponItem.elementRef.ubercode ? 2 : 1;
  proccessed.tierName = ['None', 'Normal Unique', 'Exceptional Unique', 'Elite Unique'][proccessed.tier];

  return proccessed;
}

const processProperties = (uniqueItem, propertiesWithReadable) => {
  const propsAsArray = [];
  const readableProperties = {};
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
      propsAsArray.push(propValue);
      readableProperties[prop] = readableProperty ?? 'unset - ' + propValue;
    }
  }

  return {
    propsAsArray,
    readableProperties
  };
}

const processAsArmor = (uniqueArmorItem) => {

  let proccessed = {
    _id: uniqueArmorItem._id,
    baseElement: 'armor',
    index: uniqueArmorItem.index,
    lvl: uniqueArmorItem.lvl,
    'lvl req': uniqueArmorItem['lvl req'],
    '*type': uniqueArmorItem['*type'],
    durability: uniqueArmorItem.elementRef.durability,
    weightClass: uniqueArmorItem.speed === 10 ? 'Heavy' : uniqueArmorItem.speed === 5 ? 'Medium' : 'Light',
    reqstr: uniqueArmorItem.elementRef.reqstr,
  };

  proccessed.tier = uniqueArmorItem.elementRef.code === uniqueArmorItem.elementRef.ultracode ? 3 : uniqueArmorItem.elementRef.code === uniqueArmorItem.elementRef.ubercode ? 2 : 1;
  proccessed.tierName = ['None', 'Normal Unique', 'Exceptional Unique', 'Elite Unique'][proccessed.tier];

  return proccessed;
}

const processAsMisc = (uniqueMiscItem) => {
  return uniqueMiscItem;
}

const post = async (req, res) => {
  const { db } = await connectToDatabase();
  const ids = req.body.id ? [req.body.id] : [...req.body.ids];
  // These are all the readable properties, I cache this since I use it in several places
  const propertiesWithReadable = await db.collection('properties').find({ readable: { $exists: true } }).toArray();

  // For all the generated items I need to update
  const toWait = await Promise.all(ids.map(async(id) => {
    const generatedItem = await generateSingleItem(id, propertiesWithReadable);
    await db.collection('generated').replaceOne({ _id: ObjectId(id) }, generatedItem, { upsert: true });

    return id;
  }));

  res.send(true);

}

const generateSingleItem = async (id, propertiesWithReadable) => {
  const { db } = await connectToDatabase();
  const uniqueItem = await db.collection('uniqueitems').findOne({ _id: ObjectId(id) });
  let generatedItem = await db.collection('generated').findOne({ _id: ObjectId(id) });
  const { propsAsArray, readableProperties } = processProperties(uniqueItem, propertiesWithReadable);

  if (!generatedItem) {
    const weaponRef = await getWeaponRef(uniqueItem);
    if (weaponRef) {
      generatedItem = processAsWeapon({ ...uniqueItem, ...{ elementRef: weaponRef } });
    } else {
      const armorRef = await getArmorRef(uniqueItem);
      if (armorRef) {
        generatedItem = processAsArmor({ ...uniqueItem, ...{ elementRef: armorRef } });
      } else {
        const miscRef = await getMiscRef(uniqueItem);
        generatedItem = processAsArmor({ ...uniqueItem, ...{ elementRef: miscRef } });
      }
    }
  }

  generatedItem = { ...generatedItem, ...{ propsAsArray }, ...readableProperties };

  return generatedItem;
}