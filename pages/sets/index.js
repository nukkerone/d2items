import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { getSession } from 'next-auth/client';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';
import CustomMasonry from '../../components/custom-masonry';
import SetItemCard from '../../components/set-item-card';
import SetRigCard from '../../components/set-rig-card';
import GrailItemModal from '../../components/grail-item-modal';
import SearchInput from '../../components/search-input';

export default function Sets({ setitems }) {
  let miniSearch = new MiniSearch({
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

  const [session, setSession] = useState(null);
  const [items, setItems] = useState(setitems);
  const [setItemGrailItem, setSetItemGrailItem] = useState(null);
  const [addedItems, setAddedItems] = useState([]);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setSession(session);
        updateAddedItems();
      } else {
        setSession(null);
      }
    });

    miniSearch.addAll(setitems);
  }, []);

  const searchHandler = (searchQuery) => {
    if (searchQuery) {
      const results = miniSearch.search(searchQuery).map(i => i.id);
      const items = setitems.filter(i => results.indexOf(i._id) >= 0);
      setItems(items);
    } else {
      setItems(setitems);
    }
  };

  const fetchAddedItems = async () => {
    const res = await fetch('/api/user/grail/added-items?type=set-item', {
      method: 'GET',
    });
    return await res.json();
  }

  const updateAddedItems = async () => {
    const ai = await fetchAddedItems();
    setAddedItems(ai);
  }

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
            <SearchInput onSearch={searchHandler}></SearchInput>
          </form>
        </div>

        <UpperNav></UpperNav>

        <GrailItemModal category="set-item" item={setItemGrailItem} onHide={() => { setSetItemGrailItem(null); updateAddedItems(); }}></GrailItemModal>

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
                <SetItemCard
                  item={item}
                  key={item._id}
                  session={session}
                  inGrail={addedItems.indexOf(item.slug) >= 0}
                  editInGrail={() => setSetItemGrailItem(item)}
                ></SetItemCard>
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
