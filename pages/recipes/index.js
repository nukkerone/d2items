import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import Head from 'next/head';
import { connectToDatabase } from '../../lib/mongodb';
import MiniSearch from 'minisearch';
import UpperNav from '../../components/upper-nav';

export default function Recipes({ recipes }) {
  let miniSearch;

  const [items, setRecipes] = useState(recipes)

  useEffect(() => {
    miniSearch = new MiniSearch({
      idField: '_id',
      fields: ['name', 'ingredients', 'product'], // fields to index for full-text search
      storeFields: ['name'], // fields to return with search results
      searchOptions: {
        prefix: true,
      },
      extractField: (document, fieldName) => {
        switch (fieldName) {
          case 'ingredients':
            return document[fieldName]?.map(ingredient => ingredient.ingredient).join(' ');
          default:
            return document[fieldName];
        }
      }
    });

    miniSearch.addAll(recipes);
  }, []);

  const searchHandler = (e) => {
    if (e.target.value) {
      const results = miniSearch.search(e.target.value).map(i => i.id);
      const items = recipes.filter(i => results.indexOf(i._id) >= 0);
      setRecipes(items);
    } else {
      setRecipes(recipes);
    }
  };

  const debouncedSearchHandler = useMemo(
    () => debounce(searchHandler, 300)
    , []);

  return (
    <div className="container container-bg container-recipes">
      <Head>
        <title>Recipe items</title>
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
          Diablo 2 Resurrected Cube Recipes
        </h1>

        <div className="row" data-masonry='{"percentPosition": true }'>
          {
            items.map(item => {
              return <div key={item._id} className="col-lg-4">
                <div className="card mb-3">
                  <div className="card-body">
                    <h2>{item.name}</h2>
                    <h3>{item.type}</h3>

                    <br />

                    <div className="ingredients">
                      {
                        item.ingredients.map((ingredient, i) => <p className="ingredient" key={i}>
                          <span className="qty">{ingredient.qty}</span> <span>{ ingredient.ingredient }</span>
                        </p>)
                      }
                    </div>

                    <br />

                    <p>Produces</p>
                    <p className="produces">
                      <span className="qty">{item.productQty}</span> <span className="product">{item.product}</span>
                    </p>
                    
                  </div>
                </div>
              </div>
            })
          }
        </div>

      </div>

    </div>
  )
}


export async function getServerSideProps(context) {
  const { db } = await connectToDatabase()
  const recipes = await db.collection('recipe_scrapped_normalized').find({}).limit(500).toArray();

  return {
    props: { recipes: JSON.parse(JSON.stringify(recipes)) },
  }
}
