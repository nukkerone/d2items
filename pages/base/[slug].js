import React from 'react';
import { connectToDatabase } from '../../lib/mongodb';
import Head from 'next/head';
import Image from 'next/image';
import UpperNav from '../../components/upper-nav';

function ItemPage({ item }) {
  return (
    <div className="container container-bg container-uniques">
      <Head>
        <title>Base</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">

        <div className="logo"><h1><span>D2</span>BASE</h1></div>

        <UpperNav></UpperNav>

        <h1 className="title">
          {item.name}
        </h1>

        <div className="row grid">
          <div key={item._id} className="grid-item">
            <div className="card mb-3">
              <div className="card-body">

                <Image
                  src={'https://diablo2.io' + item.image.src}
                  alt={item.name}
                  width={item.image.width}
                  height={item.image.height}
                />

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
        </div>

      </div>

    </div>
  )
}

export default ItemPage;

export const getStaticProps = async ({ params: { slug } }) => {
  const { db } = await connectToDatabase();
  const item = await db.collection('base_scrapped_normalized').findOne({ slug });
  delete item._id;

  return {
    props: { item: item }
  }
}

export const getStaticPaths = async () => {
  const { db } = await connectToDatabase();
  let paths = [];
  const baseItems = await db.collection('base_scrapped_normalized').find({}).limit(3).toArray();
  const baseItemsSlug = baseItems.map(i => i.slug);

  paths = [...paths, ...baseItemsSlug.map(s => { return { params: { slug: s } } })];

  return {
    paths,
    fallback: false
  }
}


