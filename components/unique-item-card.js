import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dropdown } from 'react-bootstrap';

function UniqueItemCard({ item, session, inGrail, addToGrail, removeFromGrail }) {
  return (
    <div key={item._id} className="grid-item">
      <div className="card mb-3 item-card">
        <div className="card-body">
          <Dropdown>
            <Dropdown.Toggle variant="transparent" className="item-card-options">
              Opts
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {session && !inGrail &&
                <Dropdown.Item><a href="#" onClick={() => addToGrail(item)}>Add to Holy Grail</a></Dropdown.Item>
              }
              {session && inGrail &&
                <Dropdown.Item><a href="#" onClick={() => removeFromGrail(item)}>Remove from Holy Grail</a></Dropdown.Item>
              }
              <Dropdown.Item><Link href={'/sets/' + item.slug}>View Details</Link></Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

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
              if (['_id', 'slug', 'name', 'tier', 'base', 'patch', 'only', 'image'].indexOf(key) >= 0) {
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

          {item.patch ? <p className="patch">{item.patch}</p> : null}
          {item.only ? <p className="only">{item.only}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default UniqueItemCard;
