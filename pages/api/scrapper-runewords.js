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
    console.log('exception ', e);
    return res.json({ success: false });
  }

  res.json({ success: true });
}

const scrap = async () => {
  const url = 'https://diablo2.io/runewords';
  let resp = await fetch(url, {
    method: 'GET',
  });
  const body = await resp.text();

  const $ = cheerio.load(body);
  const $items = $('.grid article');
  const scrapped = [];

  $items.each(function () {
    const $item = $(this);
    const $name = $('h3 a', $item);
    const name = $name.text().trim();
    const slug = urlSlug(name);

    const patch = $('h4 .zso_rwpatch', $item).text().trim();

    const $runeList = $item.children('span.ajax_catch');
    const runeList = [];

    $runeList.each(function () {
      const $image = $(this).find('div').first();
      const image = $image.length > 0 ? $image[0].attribs['data-background-image'] : null;
      const width = '20';
      const height = '20';
      const rune = $(this).find('.z-recipes').text().trim();
      runeList.push({ image: { src: image, width, height }, rune });
    });

    const level = $('.zso_rwlvlrq', $item).text().trim();

    const $mainZVfHide = $item.children('div.z-vf-hide')[2];
    const sockets = $('.zso_rwsock', $mainZVfHide).text().trim();
    const $itemsToInsertTo = $('a.z-white', $mainZVfHide);
    const itemsToInsertTo = [];

    $itemsToInsertTo.each(function () {
      itemsToInsertTo.push($(this).text().trim());
    });

    const props = [];
    $('span.z-smallstats', $mainZVfHide).contents().each(function () {
      if (this.type === 'text' && $(this).text().trim().length > 0) {
        props.push($(this).text().trim());
      }
    });

    const ladderOnly = $('a.z-uniques-title.z-mtop', $item).length > 0;

    scrapped.push({
      slug, name, patch, level, runeList, sockets, itemsToInsertTo, props, ladderOnly
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
  if (exists.find(c => c.name === 'runeword_scrapped_normalized')) {
    await db.collection('runeword_scrapped_normalized').drop();
  }

  //await db.collection('unique_scrapped').insertMany(normalizeItems(items));
  await db.collection('runeword_scrapped_normalized').insertMany(normalizeItems(items));
}

const normalizeItems = (items) => {
  const normalizedItems = [];

  for (const item of items) {
    let normalized = { ...item };

    normalizedItems.push(normalized);
  }

  return normalizedItems;
}