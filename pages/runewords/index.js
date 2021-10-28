import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { getSession } from 'next-auth/client';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';
import CustomMasonry from '../../components/custom-masonry';
import GrailItemModal from '../../components/grail-item-modal';
import { Dropdown } from 'react-bootstrap';
import SearchInput from '../../components/search-input';

export default function Runewords({ runewords }) {
  let miniSearch = new MiniSearch({
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

  const [session, setSession] = useState(null);
  const [items, setRunewords] = useState(runewords);
  const [grailItem, setGrailItem] = useState(null);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setSession(session);
      } else {
        setSession(null);
      }
    });

    miniSearch.addAll(runewords);
  }, []);

  const searchHandler = (searchQuery) => {
    if (searchQuery) {
      const results = miniSearch.search(searchQuery).map(i => i.id);
      const items = runewords.filter(i => results.indexOf(i._id) >= 0);
      setRunewords(items);
    } else {
      setRunewords(runewords);
    }
  };

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
            <SearchInput onSearch={searchHandler}></SearchInput>
          </form>
        </div>

        <UpperNav></UpperNav>

        <GrailItemModal category="runeword" item={grailItem} onHide={() => { setGrailItem(null); }}></GrailItemModal>

        <h1 className="title">
          Diablo 2 Resurrected Runewords
        </h1>

        <div className="row grid">
          <CustomMasonry
            items={items}
            render={({ data: item }) => {
              return <div key={item._id} className="grid-item">
                <div className="card mb-3 item-card">
                  <div className="card-body">
                    <Dropdown>
                      <Dropdown.Toggle variant="transparent" className="item-card-options">
                        Opts
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {session &&
                          <Dropdown.Item onClick={() => setGrailItem(item)}>Configure in Holy Grail</Dropdown.Item>
                        }
                        <Dropdown.Item as={Link} href={'/runewords/' + item.slug} className="dropdown-item">View Details</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

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

export async function getStaticProps(context) {
  const { db } = await connectToDatabase()
  const runewords = await db.collection('runeword_scrapped_normalized').find({}).limit(500).toArray();

  return {
    props: { runewords: JSON.parse(JSON.stringify(runewords)) },
  }
}
