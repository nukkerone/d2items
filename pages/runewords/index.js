import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import Head from 'next/head';
import Image from 'next/image';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';
import CustomMasonry from '../../components/custom-masonry';

export default function Runewords({ runewords }) {
  let miniSearch;

  const [items, setRunewords] = useState(runewords)

  useEffect(() => {
    miniSearch = new MiniSearch({
      idField: '_id',
      fields: ['name', 'level', 'sockets', 'runeList', 'itemsToInsertTo', 'props'], // fields to index for full-text search
      storeFields: ['name'], // fields to return with search results
      searchOptions: {
        prefix: true,
      },
      extractField: (document, fieldName) => {
        switch (fieldName) {
          case 'runeList':
            return document[fieldName]?.map(insertProp => insertProp.rune).join(' ');
          case 'itemsToInsertTo':
            return document[fieldName]?.join(' ');
          case 'props':
            return document[fieldName]?.join(' ');
          default:
            return document[fieldName];
        }
      }
    });

    miniSearch.addAll(runewords);
  }, []);

  const searchHandler = (e) => {
    if (e.target.value) {
      const results = miniSearch.search(e.target.value).map(i => i.id);
      const items = runewords.filter(i => results.indexOf(i._id) >= 0);
      setRunewords(items);
    } else {
      setRunewords(runewords);
    }
  };

  const debouncedSearchHandler = useMemo(
    () => debounce(searchHandler, 300)
    , []);

  return (
    <div className="container container-bg container-runewords">
      <Head>
        <title>Misc items</title>
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
          Diablo 2 Resurrected Runewords
        </h1>

        <div className="row grid">
          <CustomMasonry
            items={items}
            render={({ data: item }) => {
              return <div key={item._id} className="grid-item">
                <div className="card mb-3">
                  <div className="card-body">
                    <h2>{item.name}</h2>
                    <h3>Patch {item.patch} Runeword</h3>

                    <br />

                    {
                      item.runeList.map((runeItem, i) => <span className="rune" key={i}>
                        <Image
                          src={'https://diablo2.io' + runeItem.image.src}
                          alt={runeItem.rune}
                          width={runeItem.image.width}
                          height={runeItem.image.height}
                        />
                        {runeItem.rune}
                      </span>)
                    }

                    <br />

                    <p>Req level: {item.level}</p>

                    <br />

                    <p>
                      {item.sockets} socket
                      {
                        item.itemsToInsertTo.map((itemsToInsertTo, i) => <span className="item-to-insert-to" key={i}>{itemsToInsertTo}</span>)
                      }
                    </p>

                    <br />

                    {
                      item.props.map((prop, i) => <p className="property" key={i}>{prop}</p>)
                    }

                    {item.ladderOnly ? <p className="ladder-only">Ladder only</p> : null}

                  </div>
                </div>
              </div>
            }}></CustomMasonry>
        </div>

      </div>

    </div>
  )
}

export async function getServerSideProps(context) {
  const { db } = await connectToDatabase()
  const runewords = await db.collection('runeword_scrapped_normalized').find({}).limit(500).toArray();

  return {
    props: { runewords: JSON.parse(JSON.stringify(runewords)) },
  }
}
