import React from 'react';
import { connectToDatabase } from '../../lib/mongodb';
import Head from 'next/head';
import Image from 'next/image';
import UpperNav from '../../components/upper-nav';

function ItemPage({ item }) {
  return (
    <div className="container container-bg container-uniques">
      <Head>
        <title>Recipes</title>
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
                {item.image?.src && <Image
                  src={'https://diablo2.io' + item.image.src}
                  alt={item.name}
                  width={item.image.width}
                  height={item.image.height}
                />}

                <h2>{item.name}</h2>
                <h3>{item.type}</h3>

                <br />

                <div className="ingredients">
                  {
                    item.ingredients.map((ingredient, i) => <p className="ingredient" key={i}>
                      <span className="qty">{ingredient.qty}</span>
                      {ingredient.image?.src && <Image
                        src={'https://diablo2.io' + ingredient.image.src}
                        alt={ingredient.ingredient}
                        width={ingredient.image.width}
                        height={ingredient.image.height}
                      />}
                      <span>{ingredient.ingredient}</span>
                    </p>)
                  }
                </div>

                <br />

                <p>Produces</p>
                <p className="produces">
                  <span className="qty">{item.productQty}</span>
                  {item.productImage?.src && <Image
                    src={'https://diablo2.io' + item.productImage.src}
                    alt={item.product}
                    width={item.productImage.width}
                    height={item.productImage.height}
                  />}
                  <span className="product">{item.product}</span>
                </p>

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
  const item = await db.collection('recipes_scrapped_normalized').findOne({ slug });
  delete item._id;

  return {
    props: { item: item }
  }
}

export const getStaticPaths = async () => {
  const { db } = await connectToDatabase();
  let paths = [];
  const recipeItems = await db.collection('recipes_scrapped_normalized').find({}).limit(3).toArray();
  const recipeItemsSlug = recipeItems.map(i => i.slug);

  paths = [...paths, ...recipeItemsSlug.map(s => { return { params: { slug: s } } })];

  return {
    paths,
    fallback: false
  }
}


