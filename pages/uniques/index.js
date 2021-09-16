import { useEffect, useMemo, useState, useRef, forwardRef} from 'react';
import { debounce } from 'lodash';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { getSession } from 'next-auth/client';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';
import CustomMasonry from '../../components/custom-masonry';
import { Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Uniques({ uniqueitems }) {
  let miniSearch = new MiniSearch({
    idField: '_id',
    fields: ['name', 'tier', 'base', 'prop1', 'prop2', 'prop3', 'prop4', 'prop5', 'prop6', 'prop7', 'prop8', 'prop9', 'prop10', 'prop11', 'prop12', 'only'], // fields to index for full-text search
    storeFields: ['name', 'base'], // fields to return with search results
    searchOptions: {
      prefix: true,
    }
  });

  const [session, setSession] = useState(null);
  const [items, setItems] = useState(uniqueitems);
  const [grail, setGrail] = useState([]);

  useEffect(function () {
    getSession().then((session) => {
      if (session) {
        setSession(session);
        fechtGrail();
      } else {
        setSession(null);
      }
    });
    miniSearch.addAll(uniqueitems);
  }, []);

  const searchHandler = (e) => {
    if (e.target.value) {
      const results = miniSearch.search(e.target.value).map(i => i.id);
      const i = uniqueitems.filter(i => results.indexOf(i._id) >= 0);
      setItems(i);
    } else {
      setItems(uniqueitems);
    }
  };

  const debouncedSearchHandler = useMemo(
    () => debounce(searchHandler, 300)
    , []);

  const fechtGrail = async () => {
    const response = await fetch('/api/user/grail', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response && response.ok) {
      const body = await response.json();
      setGrail(body);
      console.log('Grail ', body);
    }

  }
  
  const addToGrail = async (item) => {
    const response = await fetch('/api/user/grail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category: 'unique', slug: item.slug }) // body data type must match "Content-Type" header
    });
    if (response && response.ok) {
      const body = await response.json();
      setGrail(body);
      toast.success('Holy grail item added');
    }
  }

  const removeFromGrail = async (item) => {
    const response = await fetch('/api/user/grail', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category: 'unique', slug: item.slug }) // body data type must match "Content-Type" header
    });
    if (response && response.ok) {
      const body = await response.json();
      setGrail(body);
      toast.success('Holy grail item remove');
    }
  }

  return (
    <div className="container container-bg container-uniques">
      <Head>
        <title>Unique items</title>
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
          Diablo 2 Resurrected Uniques
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
                      { session && (grail.findIndex((grailItem) => grailItem.category === 'unique' && grailItem.slug === item.slug) < 0) &&
                        <Dropdown.Item><a href="#" onClick={() => addToGrail(item)}>Add to Holy Grail</a></Dropdown.Item>
                      }
                      { session && (grail.findIndex((grailItem) => grailItem.category === 'unique' && grailItem.slug === item.slug) >= 0) &&
                        <Dropdown.Item><a href="#" onClick={() => removeFromGrail(item)}>Remove from Holy Grail</a></Dropdown.Item>
                      }
                      <Dropdown.Item><Link href={'/uniques/' + item.slug}>View Details</Link></Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Image
                    src={'https://diablo2.io' + item.image.src}
                    alt={item.name}
                    width={item.image.width}
                    height={item.image.height}
                  />

                  <h2>{item.name}</h2>
                  <h3>{item.tier}</h3>
                  <h4>{item.base}</h4>

                  <br />

                  {
                    Object.entries(item).map(([key, val], i) => {
                      // We avoid entries that are props
                      const match = key.match(/(prop)[0-9]+/g);
                      if (match && match.length > 0) {
                        return null;
                      }
                      // We avoid the following fields
                      if (['_id', 'name', 'tier', 'base', 'patch', 'only', 'image'].indexOf(key) >= 0) {
                        return null;
                      }
                      // We print the stats 
                      return <p className="stat" key={key}>{key.charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}: <span>{val}</span></p>
                    })
                  }

                  <br />

                  {
                    Object.entries(item).map(([key, val], i) => {
                      // Print the props
                      const match = key.match(/(prop)[0-9]+/g);
                      if (match && match.length > 0) {
                        return <p className="property" key={i}>{val}</p>
                      }
                    })
                  }

                  <br />

                  {item.patch ? <p className="patch">{item.patch}</p> : null}
                  {item.only ? <p className="only">{item.only}</p> : null}
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
  const uniqueitems = await db.collection('unique_scrapped_normalized').find({}).limit(500).toArray();

  return {
    props: { uniqueitems: JSON.parse(JSON.stringify(uniqueitems)) },
  }
}
