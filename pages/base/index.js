import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';

export default function Base({ baseitems }) {
  let miniSearch;

  const [items, setItems] = useState(baseitems)

  useEffect(() => {
    miniSearch = new MiniSearch({
      idField: '_id',
      fields: ['name', 'tier', 'variant1', 'variant2', 'variant3', 'variant4', 'variant5', 'variant6', 'variant7', 'variant8', 'variant9', 'variant10', 'variant11', 'variant12', 'only'], // fields to index for full-text search
      storeFields: ['name'], // fields to return with search results
      searchOptions: {
        prefix: true,
      }
    });

    miniSearch.addAll(baseitems);
  }, []);

  const searchHandler = (e) => {
    if (e.target.value) {
      const results = miniSearch.search(e.target.value).map(i => i.id);
      const items = baseitems.filter(i => results.indexOf(i._id) >= 0);
      setItems(items);
    } else {
      setItems(baseitems);
    }
  };

  const debouncedSearchHandler = useMemo(
    () => debounce(searchHandler, 300)
    , []);

  return (
    <div className="container container-bg container-base">
      <Head>
        <title>Base items</title>
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
          Diablo 2 Resurrected Base Items
        </h1>

        <div className="row">
          {
            items.map(item =>
              <div key={item._id} className="col-lg-4">
                <div className="card mb-3">
                  <div className="card-body">

                    <h2>{item.name}</h2>
                    <h3>{item.tier}</h3>

                    <br />

                    {
                      Object.entries(item).map(([key, val], i) => {
                        // We avoid entries that are props
                        const match = key.match(/(variant)[0-9]+/g);
                        if (match && match.length > 0) {
                          return null;
                        }
                        // We avoid the following fields
                        if (['_id', 'name', 'tier', 'only', 'image'].indexOf(key) >= 0) {
                          return null;
                        }
                        // We print the stats 
                        return <p className="stat" key={key}>{key.charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}: <span>{val}</span></p>
                      })
                    }

                    <br />

                    {item.only ? <p className="only">{item.only}</p> : null}

                    <br />

                    {
                      Object.entries(item).map(([key, val], i) => {
                        // Print the props
                        const match = key.match(/(variant)[0-9]+/g);
                        if (match && match.length > 0) {
                          return <p className="variant" key={i}>{val}</p>
                        }
                      })
                    }
                  </div>

                </div>
              </div>
            )
          }
        </div>

      </div>

    </div>
  )
}


export async function getServerSideProps(context) {
  const { db } = await connectToDatabase()
  const baseitems = await db.collection('base_scrapped_normalized').find({}).limit(500).toArray();

  return {
    props: { baseitems: JSON.parse(JSON.stringify(baseitems)) },
  }
}
