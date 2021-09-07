import React from 'react'

function RuneMiscCard({ item }) {
  return (
    <div key={item._id} className="col-lg-4">
      <div className="card mb-3">
        <div className="card-body">
          <h2>{item.name}</h2>
          <h3>Level { item.level } Rune</h3>

          <br />

          {
            item.insertProps.map(insertProp => <p className="insert-props">
              <p className="item-to-insert">{insertProp.item}</p>
              <p className="item-to-insert-prop">{ insertProp.prop }</p>
            </p>)
          }

          <br />

          <h4>Ingredient in:</h4>

          {
            item.runeRecipes.map(runeRecipe => <p className="ingredient-item">
              <p className="recipe">Recipe: {runeRecipe}</p>
            </p>)
          }

          {
            item.runeWords.map(runeWord => <p className="ingredient-item">
              <p className="runeword">{runeWord}</p>
            </p>)
          }

          <h4>Product of:</h4>
          {
            item.recipeProductOf.map(rpo => <p className="product-of-item">
              <p className="recipe">Recipe: {rpo}</p>
            </p>)
          }

        </div>
      </div>
    </div>
  )
}

export default RuneMiscCard;
