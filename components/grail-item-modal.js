import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

function GrailItemModal({ type, item, onHide }) {
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [grailItem, setGrailItem] = useState(null);

  useEffect(() => {
    if (item && type) {
      setShow(true);
      fetchGrailItem(item);
    } else {
      setShow(false);
    }
  }, [item, type]);

  const fetchGrailItem = async (item) => {
    console.log('Item ', item);
    const res = await fetch('/api/user/grail/' + type + '/' + item.slug, {
      method: 'GET',
    });
    const grailItem = await res.json();
    setGrailItem(grailItem);
    setLoaded(true);
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Body>
        { !loaded &&
          <p>Loading</p>
        }
        { loaded &&
          <form>
            <div className="mb-3">
              <label htmlFor="character" className="form-label">Character</label>
              <select class="form-select" name="character" id="character" aria-label="Character who found it">
                <option value="Sorceress">Sorceress</option>
                <option value="Barbarian">Barbarian</option>
                <option value="Assasain">Assasain</option>
                <option value="Druid">Druid</option>
                <option value="Paladin">Paladin</option>
                <option value="Amazon">Amazon</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="found-at" className="form-label">Where you found it?</label>
              <input type="text" className="form-control" name="foundAt" id="fount-at" placeholder="Place where you found it" />
            </div>
            <div className="mb-3">
              <label htmlFor="magic-find" className="form-label">Magic Find?</label>
              <input type="text" className="form-control" name="magicFind" id="magic-find" placeholder="% of Magic find" />
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" name="perfect" id="perfect" value="1" />
                <label className="form-check-label" htmlFor="perfect">Perfect</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" name="ethereal" id="ethereal" value="1" />
                <label className="form-check-label" htmlFor="ethereal">Ethereal</label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="normal" />
                <label className="form-check-label" htmlFor="normal">
                  Normal
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="nightmare" />
                <label className="form-check-label" htmlFor="nightmare">
                  Nightmare
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="hell" checked />
                <label className="form-check-label" htmlFor="hell">
                  Hell
                </label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gameType" id="softcore" checked />
                <label className="form-check-label" htmlFor="softcore">
                  Softcore
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gameType" id="hardcore" />
                <label className="form-check-label" htmlFor="hardcore">
                  Hardcore
                </label>
              </div>
            </div>
          </form>
        }
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={onHide}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default GrailItemModal;
