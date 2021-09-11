import React from 'react';
import Image from 'next/image';

function SetRigCard({ item }) {
  return (
    <div key={item._id} className="grid-item">
      <div className="card mb-3">
        <div className="card-body">
          <h2>{item.name}</h2>
          <h3>{item.tier}</h3>

          <br />

          {
            item.setItems.map((setPartItem, i) => <p key={i}>
              <Image
                src={'https://diablo2.io' + setPartItem.image.src}
                alt={setPartItem.item}
                width={setPartItem.image.width}
                height={setPartItem.image.height}
              />
              {setPartItem.item} <span> • {setPartItem.type}</span>
            </p>)
          }

          <h4>Partial set completion:</h4>
          {
            Object.entries(item).map(([key, val], i) => {
              // Print the props
              const match = key.match(/(partialSetProp)[0-9]+/g);
              if (match && match.length > 0) {
                return <p className="property" key={i}>{val}</p>
              }
            })
          }

          <br />

          <h4>Full set completion:</h4>
          {
            Object.entries(item).map(([key, val], i) => {
              // Print the props
              const match = key.match(/(fullSetProp)[0-9]+/g);
              if (match && match.length > 0) {
                return <p className="property" key={i}>{val}</p>
              }
            })
          }

        </div>

      </div>
    </div>
  )
}

export default SetRigCard;
