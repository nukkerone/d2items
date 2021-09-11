import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';
import CustomMasonry from '../../components/custom-masonry';
import SetItemCard from '../../components/set-item-card';
import SetRigCard from '../../components/set-rig-card';

export default function Sets({ setitems }) {
  let miniSearch;

  const [items, setItems] = useState(setitems)

  useEffect(() => {
    miniSearch = new MiniSearch({
      idField: '_id',
      fields: ['name', 'tier', 'setItems', 'partialSetProps', 'fullSetProps', 'base', 'stats', 'props', 'setTitle', 'only'], // fields to index for full-text search
      storeFields: ['name'], // fields to return with search results
      searchOptions: {
        prefix: true,
      },
      extractField: (document, fieldName) => {
        switch (fieldName) {
          case 'setStats':
            return document[fieldName]?.map(setStat => setStat.prop).join(' ');
          case 'setItems':
            return document[fieldName]?.map(setStat => setStat.item + ' ' + setStat.type).join(' ');
          default:
            return document[fieldName];
        }
      }
    });

    miniSearch.addAll(setitems);
  }, []);

  const searchHandler = (e) => {
    if (e.target.value) {
      const results = miniSearch.search(e.target.value).map(i => i.id);
      const items = setitems.filter(i => results.indexOf(i._id) >= 0);
      setItems(items);
    } else {
      setItems(setitems);
    }
  };

  const debouncedSearchHandler = useMemo(
    () => debounce(searchHandler, 300)
    , []);

  return (
    <div className="container container-bg container-sets">
      <Head>
        <title>Set items</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        
        <div className="logo"><h1><span>D2</span>BASE</h1></div>

        <div className="row">
          <form className="col-lg-12">
            <div className="mb-3">
              <input type="text" className="form-control" id="search" placeholder="Type to search" onChange={debouncedSearchHandler} />
            </div>
          </form>
        </div>

        <UpperNav></UpperNav>

        <h1 className="title">
          Diablo 2 Resurrected Sets
        </h1>

        <div className="row grid">
          <CustomMasonry
            items={items}
            render={({ data: item }) => {
              return item.tier === 'Full Set' ?
                <SetRigCard item={item} key={item._id}></SetRigCard>
                :
                <SetItemCard item={item} key={item._id}></SetItemCard>
            }}></CustomMasonry>
        </div>

      </div>

    </div>
  )
}

export async function getStaticProps(context) {
  const { db } = await connectToDatabase()
  const setitems = await db.collection('set_scrapped_normalized').find({}).limit(500).toArray();

  return {
    props: { setitems: JSON.parse(JSON.stringify(setitems)) },
  }
}
