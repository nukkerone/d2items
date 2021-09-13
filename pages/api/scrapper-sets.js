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
  const url = 'https://diablo2.io/sets';
  let resp = await fetch(url, {
    method: 'GET',
  });
  const body = await resp.text();

  const $ = cheerio.load(body);
  const $items = $('.grid article');
  const scrapped = [];

  $items.each(function () {
    const $item = $(this);

    const $tier = $('h4', $item).first();
    const tierContents = $tier.contents();
    const tier = $tier.contents().first().text().trim();

    if (tier === 'Full Set') {
      const $name = $('h3 a', $item);
      const name = $name.text();
      const slug = urlSlug(name);

      const $setItems = $('span a .z-sets-title', $item);
      const setItems = [];
      $setItems.each(function () {
        const $item = $(this);
        const $itemType = $('.z-grey', $item);
        const $graphic = $item.prev();
        const image = $graphic.length > 0 ? $graphic[0].attribs['data-background-image'] : null;
        const width = '20';
        const height = '20';
          
        setItems.push({
          image: {
            src: image,
            width,
            height
          },
          item: $item.contents().first().text().trim(),
          type: $itemType.contents().last().text().trim()
        });
      });

      const $zVfHide = $('.z-vf-hide', $item);
      const $partialSetProps = $('.z-smallstats', $zVfHide.first()).eq(0);
      const partialSetProps = [];

      $partialSetProps.contents().each(function () {
        if (this.type === 'text' && $(this).text().trim().length > 0) {
          partialSetProps.push($(this).text().trim());
        }
      });

      const $fullSetProps = $('.z-smallstats', $zVfHide.first()).eq(1);
      const fullSetProps = [];

      $fullSetProps.contents().each(function () {
        if (this.type === 'text' && $(this).text().trim().length > 0) {
          fullSetProps.push($(this).text().trim());
        }
      });

      scrapped.push({
        slug, name, tier, setItems, partialSetProps, fullSetProps
      });
    } else {
      const $graphic = $('a .lozad', $item).first();
      const image = $graphic.length > 0 ? $graphic[0].attribs['data-background-image'] : null;
      const imageStyle = $graphic.length > 0 ? $graphic[0].attribs['style'] : null;
      const width = imageStyle.match(/width: \d+px/)[0].replace('width: ', '').replace('px', '');
      const height = imageStyle.match(/height: \d+px/)[0].replace('height: ', '').replace('px', '');

      const $name = $('h3 a', $item);
      const name = $name.text();
      const slug = urlSlug(name);

      let base;
      if (tierContents.length === 3) {
        base = $tier.contents().eq(2).text().trim();
      } else {
        const $base = $('h4 span a', $item).first();
        base = $base.text();
      }

      const $smallstats = $('p.z-smallstats', $item);

      const $statVals = $('span:not(.z-hidden):not(.z-white):not(.z-grey):not(.z-sets-title)', $smallstats[0]);
      const stats = [];
      $statVals.each(function () {
        const $val = $(this);
        const $key = $val.prev();
        stats.push({ key: $key.text().replace(':', '').replace(' ', '_').toLowerCase(), val: $val.text() });
      });

      const $setStatsVals = $('span:not(.z-grey)', $smallstats[1]);
      const setStats = [];
      $setStatsVals.each(function () {
        const $prop = $(this);
        const $qty = $prop.next();
        setStats.push({ prop: $prop.text(), qty: $qty.text() });
      });

      const props = [];
      $smallstats.contents().each(function () {
        if (this.type === 'text' && $(this).text().trim().length > 0) {
          props.push($(this).text().trim());
        }
      });

      const $setTitle = $('h4 span .z-sets-title', $item);
      const setTitle = $setTitle.text().trim();

      const $only = $('span a.error', $item);
      const only = $only.text() ?? null;

      scrapped.push({
        image: {
          src: image,
          width,
          height
        }, slug, name, tier, base, stats, props, setStats, setTitle, only
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
  if (exists.find(c => c.name === 'set_scrapped_normalized')) {
    await db.collection('set_scrapped_normalized').drop();
  }

  //await db.collection('unique_scrapped').insertMany(normalizeItems(items));
  await db.collection('set_scrapped_normalized').insertMany(normalizeItems(items));
}

const normalizeItems = (items) => {
  const normalizedItems = [];

  for (const item of items) {
    let normalized = { ...item };
    if (item.tier !== 'Full Set') {
      delete normalized.stats;
      delete normalized.props;
      
      for (const stat of item.stats) {
        normalized[stat.key] = stat.val;
      }
      for (let i = 1; i <= item.props.length; i++) {
        normalized['prop' + i] = item.props[i - 1];
      }
    } else {
      delete normalized.partialSetProps;
      delete normalized.fullSetProps;
      for (let i = 1; i <= item.partialSetProps.length; i++) {
        normalized['partialSetProp' + i] = item.partialSetProps[i - 1];
      }
      for (let i = 1; i <= item.fullSetProps.length; i++) {
        normalized['fullSetProp' + i] = item.fullSetProps[i - 1];
      }
    }
    
    normalizedItems.push(normalized);
  }

  /* debugger; */
  return normalizedItems;
}