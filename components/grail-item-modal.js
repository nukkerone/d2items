import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

function GrailItemModal({ category, item, onHide }) {
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [grailItem, setGrailItem] = useState(null);

  useEffect(() => {
    if (item && category) {
      setShow(true);
      fetchGrailItem(item);
    } else {
      setShow(false);
    }
  }, [item, category]);

  const fetchGrailItem = async (item) => {
    const res = await fetch('/api/user/grail/' + category + '/' + item.slug, {
      method: 'GET',
    });
    const grailItem = await res.json();
    setGrailItem(grailItem);
    setLoaded(true);
  }

  const save = async (e, category, slug) => {
    e.preventDefault();

    const character = e.target.character.value;
    const foundAt = e.target.foundAt.value ?? null;
    const magicFind = e.target.magicFind.value ?? null;
    const isPerfect = e.target.perfect.checked ? true : false;
    const isEthereal = e.target.ethereal.checked ? true : false;
    const difficulty = Array.from(e.target.difficulty.values()).find(d => d.checked).value;
    const gameType = Array.from(e.target.gameType.values()).find(d => d.checked).value;

    const response = await fetch('/api/user/grail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category, slug, character, foundAt, magicFind, isPerfect, isEthereal, difficulty, gameType })
    });
    if (response && response.ok) {
      const body = await response.json();
      setGrailItem(body);
      toast.success('Holy grail item added');
      return true;
    }
    toast.error('Failed adding item');
    return false;
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Body>
        { !loaded &&
          <p>Loading</p>
        }
        { loaded &&
          <form onSubmit={(e) => save(e, category, grailItem.slug)} id="grail-item-form">
            <div className="mb-3">
              <label htmlFor="character" className="form-label">Character</label>
              <select class="form-select" name="character" id="character" aria-label="Character who found it">
                <option value="sorceress" selected={grailItem?.character === 'sorceress' ? true : false}>Sorceress</option>
                <option value="barbarian" selected={grailItem?.character === 'barbarian' ? true : false}>Barbarian</option>
                <option value="assasain" selected={grailItem?.character === 'assasain' ? true : false}>Assasain</option>
                <option value="druid" selected={grailItem?.character === 'druid' ? true : false}>Druid</option>
                <option value="paladin" selected={grailItem?.character === 'paladin' ? true : false}>Paladin</option>
                <option value="amazon" selected={grailItem?.character === 'amazon' ? true : false}>Amazon</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="found-at" className="form-label">Where you found it?</label>
              <input type="text" className="form-control" name="foundAt" id="fount-at" placeholder="Place where you found it"
                defaultValue={grailItem?.foundAt} />
            </div>
            <div className="mb-3">
              <label htmlFor="magic-find" className="form-label">Magic Find?</label>
              <input type="text" className="form-control" name="magicFind" id="magic-find" placeholder="% of Magic find"
                defaultValue={grailItem?.magicFind} />
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" name="perfect" id="perfect" value="1"
                  defaultChecked={!!grailItem?.isPerfect} />
                <label className="form-check-label" htmlFor="perfect">Perfect</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" name="ethereal" id="ethereal" value="1"
                  defaultChecked={!!grailItem?.isEthereal} />
                <label className="form-check-label" htmlFor="ethereal">Ethereal</label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="normal" value="normal"
                  defaultChecked={grailItem?.difficulty === 'normal'} />
                <label className="form-check-label" htmlFor="normal">
                  Normal
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="nightmare" value="nightmare"
                  defaultChecked={grailItem?.difficulty === 'nightmare'} />
                <label className="form-check-label" htmlFor="nightmare">
                  Nightmare
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="hell" value="hell"
                  defaultChecked={grailItem?.difficulty === 'hell' || !grailItem} />
                <label className="form-check-label" htmlFor="hell">
                  Hell
                </label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gameType" id="softcore" value="softcore"
                  defaultChecked={grailItem?.gameType !== 'hardcore'} />
                <label className="form-check-label" htmlFor="softcore">
                  Softcore
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gameType" id="hardcore" value="hardcore"
                  defaultChecked={grailItem?.gameType === 'hardcore'}/>
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
        <Button variant="primary" type="submit" form="grail-item-form">
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default GrailItemModal;
