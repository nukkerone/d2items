import React from 'react';
import Image from 'next/image';

function SetItemCard({ item }) {
  return (
    <div key={item._id} className="col-lg-4 grid-item">
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
              if (['_id', 'image', 'name', 'tier', 'base', 'setTitle', 'setStats', 'only'].indexOf(key) >= 0) {
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

          {
            item.setStats.map((setStat, i) => <div className="partial-set-props" key={i}>
              {setStat.prop} <span> • {setStat.qty}</span>
            </div>)
          }

          <p className="set">Part of set: {item.setTitle}</p>

          {item.only ? <p className="only">{item.only}</p> : null}

        </div>
      </div>
    </div>
  )
}

export default SetItemCard;
