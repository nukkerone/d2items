import React from 'react'

function RuneMiscCard({ item }) {
  return (
    <div key={item._id} className="col-lg-4 grid-item">
      <div className="card mb-3">
        <div className="card-body">
          <h2>{item.name}</h2>
          <h3>Level { item.level } Rune</h3>

          <br />

          {
            item.insertProps.map((insertProp, i) => <div className="insert-props" key={i}>
              <p className="item-to-insert">{insertProp.item}</p>
              <p className="item-to-insert-prop">{ insertProp.prop }</p>
            </div>)
          }

          <br />

          <h4>Ingredient in:</h4>

          {
            item.runeRecipes.map((runeRecipe, i) => <div className="ingredient-item" key={i}>
              <p className="recipe">Recipe: {runeRecipe}</p>
            </div>)
          }

          {
            item.runeWords.map((runeWord, i) => <div className="ingredient-item" key={i}>
              <p className="runeword">{runeWord}</p>
            </div>)
          }

          <h4>Product of:</h4>
          {
            item.recipeProductOf.map((rpo, i) => <div className="product-of-item" key={i}>
              <p className="recipe">Recipe: {rpo}</p>
            </div>)
          }

        </div>
      </div>
    </div>
  )
}

export default RuneMiscCard;
