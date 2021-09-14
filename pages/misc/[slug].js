import React from 'react';
import { connectToDatabase } from '../../lib/mongodb';
import Head from 'next/head';
import UpperNav from '../../components/upper-nav';
import RuneMiscCard from '../../components/rune-misc-card';

function ItemPage({ item }) {
  return (
    <div className="container container-bg container-uniques">
      <Head>
        <title>Misc</title>
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
          {
          item.type === 'rune' ?
            <RuneMiscCard item={item} key={item._id}></RuneMiscCard>
            :
            null
          }
        </div>

      </div>

    </div>
  )
}

export default ItemPage;

export const getStaticProps = async ({ params: { slug } }) => {
  const { db } = await connectToDatabase();
  const item = await db.collection('misc_scrapped_normalized').findOne({ slug });
  delete item._id;

  return {
    props: { item: item }
  }
}

export const getStaticPaths = async () => {
  const { db } = await connectToDatabase();
  let paths = [];
  const miscItems = await db.collection('misc_scrapped_normalized').find({}).limit(3).toArray();
  const miscItemsSlug = miscItems.map(i => i.slug);

  paths = [...paths, ...miscItemsSlug.map(s => { return { params: { slug: s } } })];

  return {
    paths,
    fallback: false
  }
}


