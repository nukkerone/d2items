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
  const url = 'https://diablo2.io/misc';
  let resp = await fetch(url, {
    method: 'GET',
  });
  const body = await resp.text();

  const $ = cheerio.load(body);
  const $items = $('.grid article');
  const scrapped = [];

  $items.each(function () {
    const $item = $(this);

    const $h3 = $('h3', $item);
    const h3Text = $h3.contents().text().trim();
    const slug = urlSlug(h3Text);

    const name = $('h4', $item).first().contents().text().trim();

    const isRune = name && name.indexOf('Rune') >= 0 && name.indexOf('Level') >= 0
    if (isRune) {
      const $image = $item.first().children('a').first().children('div').first();
      const image = $image.length > 0 ? $image[0].attribs['data-background-image'] : null;
      const imageStyle = $image.length > 0 ? $image[0].attribs['style'] : null;
      const width = imageStyle.match(/width: \d+px/)[0].replace('width: ', '').replace('px', '');
      const height = imageStyle.match(/height: \d+px/)[0].replace('height: ', '').replace('px', '');

      const level = /(\d+)/.exec(name)[0];
      const type = 'rune';
      const $zVfHideInsert = $('.z-vf-hide', $item)[1];
      const $itemToInsert = $('.z-white', $zVfHideInsert);
      const insertProps = [];
      $itemToInsert.each(function () {
        insertProps.push({ item: $(this).text().trim(), prop: $(this).next().next().text().trim() })
      });

      const $zVfHideIngredients = $('.z-vf-hide', $item)[2];
      const $runeRecipes = $('.z-recipes.z-lh-usedin', $zVfHideIngredients);
      const runeRecipes = [];
      $runeRecipes.each(function () {
        runeRecipes.push($(this).text().trim().replace('Recipe: ', ''));
      });
      const $runeWords = $('.z-uniques-title.z-lh-usedin', $zVfHideIngredients);
      const runeWords = [];
      $runeWords.each(function () {
        runeWords.push($(this).text().trim());
      });

      const $zVfHideProductOf = $('.z-vf-hide', $item)[3];
      const $recipeProductOf = $('.z-recipes.z-lh-usedin', $zVfHideProductOf);
      const recipeProductOf = [];
      $recipeProductOf.each(function () {
        recipeProductOf.push($(this).text().trim().replace('Recipe: ', ''));
      });

      scrapped.push({
        image: { src: image, width, height }, slug, name: h3Text, type, level, insertProps, runeRecipes, runeWords, recipeProductOf
      });
    }

  });

  return scrapped;
}

const persist = async (items) => {
  const { db } = await connectToDatabase();

  const exists = await db.listCollections().toArray();
  /* if (exists.find(c => c.name === 'unique_scrapped')) {
    await db.collection('unique_scrapped').drop();
  } */
  if (exists.find(c => c.name === 'misc_scrapped_normalized')) {
    await db.collection('misc_scrapped_normalized').drop();
  }

  //await db.collection('unique_scrapped').insertMany(normalizeItems(items));
  await db.collection('misc_scrapped_normalized').insertMany(normalizeItems(items));
}

const normalizeItems = (items) => {
  const normalizedItems = [];

  for (const item of items) {
    let normalized = { ...item };

    normalizedItems.push(normalized);
  }

  /* debugger; */
  return normalizedItems;
}