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
  const url = 'https://diablo2.io/recipes';
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
    const name = $name.text().trim().replace('Recipe: ', '');
    const slug = urlSlug(name);
    const $type = $('h4', $item);
    const type = $type.text().trim();
    const $zVfHide = $item.children('div.z-vf-hide')[1];
    const $recipeInput = $('.z-recipe-input', $zVfHide);
    const $ingredients = $('span.z-smallstats', $recipeInput);
    const ingredients = [];

    $ingredients.each(function () {
      const qty = $(this).text().trim();
      let $image = $(this).next();
      let image = null;
      if ($image.is('div')) {
        image = $image[0].attribs['data-background-image'];
      }
      const $ingredient = $image.next().find('a').first();
      const ingredient = $ingredient.text().trim();
      ingredients.push({ qty, image: { src: image, width: '20', height: '20' }, ingredient });
    });

    const productQty = $('.z-recipe-outcome .z-smallstats', $zVfHide).text().trim();
    const $productImage = $('.z-recipe-outcome .z-smallstats', $zVfHide).next();
    let productImage = null;
    if ($productImage.is('div')) {
      productImage = $productImage[0].attribs['data-background-image'];
    }
    const product = $('.z-recipe-outcome .z-recipes', $zVfHide).text().trim();

    scrapped.push({
      image: {
        src: image,
        width,
        height
      }, slug, name, type, ingredients, productQty, productImage: { src: productImage, width: '20', height: '20' }, product
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
  if (exists.find(c => c.name === 'recipe_scrapped_normalized')) {
    await db.collection('recipe_scrapped_normalized').drop();
  }

  //await db.collection('unique_scrapped').insertMany(normalizeItems(items));
  await db.collection('recipe_scrapped_normalized').insertMany(normalizeItems(items));
}

const normalizeItems = (items) => {
  const normalizedItems = [];

  for (const item of items) {
    let normalized = { ...item };

    normalizedItems.push(normalized);
  }

  return normalizedItems;
}