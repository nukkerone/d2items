import { connectToDatabase } from '../../lib/mongodb';
import * as cheerio from 'cheerio';
import urlSlug from 'url-slug';

export default async (req, res) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res);
  }
}

const get = async (req, res) => {
  try {
    const items = await scrap();
    await persist(items);
  } catch (e) {
    console.log('E ', e);
    return res.json({ success: false });
  }

  res.json({ success: true });
}

const scrap = async () => {
  const url = 'https://diablo2.io/uniques';
  let resp = await fetch(url, {
    method: 'GET',
  });
  const body = await resp.text();

  const $ = cheerio.load(body);
  const $items = $('.grid article');
  const scrapped = [];

  $items.each(function () {
    const $item = $(this);

    const $graphic = $('a .lozad', $item).first();
    const image = $graphic.length > 0 ? $graphic[0].attribs['data-background-image'] : null;
    const imageStyle = $graphic.length > 0 ? $graphic[0].attribs['style'] : null;
    const width = imageStyle.match(/width: \d+px/)[0].replace('width: ', '').replace('px', '');
    const height = imageStyle.match(/height: \d+px/)[0].replace('height: ', '').replace('px', '');

    const $name = $('h3 a', $item);
    const name = $name.text();
    const slug = urlSlug(name);
    const $tier = $('h4', $item);
    const tier = $tier.contents().first().text().trim();
    const $base = $('h4 span a', $item);
    const base = $base.text();

    const $smallstats = $('.z-smallstats', $item);

    const $statVals = $('span:not(.z-hidden):not(.z-white)', $smallstats);

    const stats = [];

    $statVals.each(function () {
      const $val = $(this);
      const $key = $val.prev();
      stats.push({ key: $key.text().replace(':', '').replace(' ', '_').toLowerCase(), val: $val.text() });
    });

    const props = [];
    $smallstats.contents().each(function () {
      if (this.type === 'text' && $(this).text().trim().length > 0) {
        props.push($(this).text().trim());
      }
    });

    const $zvfhide = $('.z-vf-hide', $item);
    const $patch = $('.z-vf-hide span a', $item);
    const patch = $patch.text() ?? null;
    const $only = $('.error', $zvfhide);
    const only = $only.text() ?? null;

    scrapped.push({
      image: {
        src: image,
        width,
        height
      },
      slug, name, tier, base, stats, props, patch, only
    });
  });

  return scrapped;
}

const persist = async (items) => {
  const { db } = await connectToDatabase();

  const exists = await db.listCollections().toArray();
  /* if (exists.find(c => c.name === 'unique_scrapped')) {
    await db.collection('unique_scrapped').drop();
  } */
  if (exists.find(c => c.name === 'unique_scrapped_normalized')) {
    await db.collection('unique_scrapped_normalized').drop();
  }
  
  //await db.collection('unique_scrapped').insertMany(normalizeItems(items));
  await db.collection('unique_scrapped_normalized').insertMany(normalizeItems(items));
}

const normalizeItems = (items) => {
  const normalizedItems = [];

  for (const item of items) {
    let normalized = { ...item };
    delete normalized.stats;
    delete normalized.props;
    for (const stat of item.stats) {
      normalized[stat.key] = stat.val;
    }
    for (let i=1; i <= item.props.length; i++) {
      normalized['prop' + i] = item.props[i-1];
    }
    normalizedItems.push(normalized);
  }

  return normalizedItems;
}