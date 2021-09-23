import React from 'react';
import { connectToDatabase } from '../../lib/mongodb';
import Head from 'next/head';
import Image from 'next/image';
import UpperNav from '../../components/upper-nav';
import SetRigCard from '../../components/set-rig-card';

function SetItemPage({ item }) {
  return (
    <div className="container container-bg container-uniques">
      <Head>
        <title>Set items</title>
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
          <SetRigCard item={item} key={item._id}></SetRigCard>
        </div>

      </div>

    </div>
  )
}

export default SetItemPage;

export const getStaticProps = async ({ params: { slug } }) => {
  const { db } = await connectToDatabase();
  const item = await db.collection('set_scrapped_normalized').findOne({ slug });
  delete item._id;

  return {
    props: { item: item }
  }
}

export const getStaticPaths = async () => {
  const { db } = await connectToDatabase();
  let paths = [];
  const sets = await db.collection('set_scrapped_normalized').find({ tier: 'Full Set' }).limit(500).toArray();
  const setItemsSlug = sets.map(i => i.slug);

  paths = [...paths, ...setItemsSlug.map(s => { return { params: { slug: s } } })];

  return {
    paths,
    fallback: false
  }
}


