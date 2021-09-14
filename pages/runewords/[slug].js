import React from 'react';
import { connectToDatabase } from '../../lib/mongodb';
import Head from 'next/head';
import Image from 'next/image';
import UpperNav from '../../components/upper-nav';

function ItemPage({ item }) {
  return (
    <div className="container container-bg container-uniques">
      <Head>
        <title>Runewords</title>
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
        </div>

      </div>

    </div>
  )
}

export default ItemPage;

export const getStaticProps = async ({ params: { slug } }) => {
  const { db } = await connectToDatabase();
  const item = await db.collection('runeword_scrapped_normalized').findOne({ slug });
  delete item._id;

  return {
    props: { item: item }
  }
}

export const getStaticPaths = async () => {
  const { db } = await connectToDatabase();
  let paths = [];
  const runewordItems = await db.collection('runeword_scrapped_normalized').find({}).limit(3).toArray();
  const runewordItemsSlug = runewordItems.map(i => i.slug);

  paths = [...paths, ...runewordItemsSlug.map(s => { return { params: { slug: s } } })];

  return {
    paths,
    fallback: false
  }
}


