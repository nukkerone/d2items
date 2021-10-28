import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dropdown } from 'react-bootstrap';

function RunewordItemCard({ item, session, editInGrail }) {
  return (
    <div key={item._id} className="grid-item">
      <div className="card mb-3 item-card">
        <div className="card-body">
          <Dropdown>
            <Dropdown.Toggle variant="transparent" className="item-card-options">
              Opts
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {session &&
                <Dropdown.Item onClick={() => editInGrail(item)}>Configure in Holy Grail</Dropdown.Item>
              }
              <Dropdown.Item as={Link} href={'/runewords/' + item.slug} className="dropdown-item">View Details</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

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
  )
}

export default RunewordItemCard;
