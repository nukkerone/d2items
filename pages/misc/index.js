import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';
import RuneMiscCard from '../../components/rune-misc-card';
import CustomMasonry from '../../components/custom-masonry';

export default function Misc({ miscitems }) {
  let miniSearch;

  const [items, setMiscItems] = useState(miscitems)

  useEffect(() => {
    miniSearch = new MiniSearch({
      idField: '_id',
      fields: ['name', 'type', 'insertProps', 'runeRecipes', 'runeWords', 'recipeProductOf'], // fields to index for full-text search
      storeFields: ['name'], // fields to return with search results
      searchOptions: {
        prefix: true,
      },
      extractField: (document, fieldName) => {
        switch (fieldName) {
          case 'insertProps':
            return document[fieldName]?.map(insertProp => insertProp.item + ' ' + insertProp.prop).join(' ');
          case 'runeRecipes':
            return document[fieldName]?.join(' ');
          case 'runeWords':
            return document[fieldName]?.join(' ');
          case 'recipeProductOf':
            return document[fieldName]?.join(' ');
          default:
            return document[fieldName];
        }
      }
    });

    miniSearch.addAll(miscitems);
  }, []);

  const searchHandler = (e) => {
    if (e.target.value) {
      const results = miniSearch.search(e.target.value).map(i => i.id);
      const items = miscitems.filter(i => results.indexOf(i._id) >= 0);
      setMiscItems(items);
    } else {
      setMiscItems(miscitems);
    }
  };

  const debouncedSearchHandler = useMemo(
    () => debounce(searchHandler, 300)
    , []);

  return (
    <div className="container container-bg container-misc">
      <Head>
        <title>Misc items</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        
      <div class="logo"><h1><span>D2</span>BASE</h1></div>


        <div className="row">
          <form className="col-lg-12">
            <div className="mb-3">
              <input type="text" className="form-control" id="search" placeholder="Type to search" onChange={debouncedSearchHandler} />
            </div>
          </form>
        </div>

        <UpperNav></UpperNav>

        <h1 className="title">
          Diablo 2 Resurrected Runes &amp; Misc Items
        </h1>

        <div className="row grid">
          <CustomMasonry
            items={items}
            render={({ data: item }) => {
              return item.type === 'rune' ?
                <RuneMiscCard item={item} key={item._id}></RuneMiscCard>
                :
                null
            }}></CustomMasonry>
        </div>

      </div>

    </div>
  )
}

export async function getStaticProps(context) {
  const { db } = await connectToDatabase()
  const miscitems = await db.collection('misc_scrapped_normalized').find({}).limit(500).toArray();

  return {
    props: { miscitems: JSON.parse(JSON.stringify(miscitems)) },
  }
}
