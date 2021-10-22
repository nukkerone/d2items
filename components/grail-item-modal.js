import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

function GrailItemModal({ category, item, onHide }) {
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [grailItem, setGrailItem] = useState(null);
  const [grailItems, setGrailItems] = useState([]);
  const [existing, setExisting] = useState(false);
  const [lastProfile, setLastProfile] = useState(false);
  const formRef = useRef(null);

  const defaultItem = {
    character: 'sorceress',
    foundAt: '',
    magicFind: '',
    isPerfect: false,
    isEthereal: false,
    difficulty: 'hell',
    gameType: 'softcore'
  }

  useEffect(async () => {
    if (item && category) {
      setShow(true);
      let lastProfile = await fetchGrailLastProfile();
      lastProfile = lastProfile ?? {};
      setLastProfile(lastProfile);
      const g = await fetchGrailItems(category, item.slug);
      setGrailItems(g);
      if (g.length > 0) {
        const gi = g[0];
        setGrailItem(gi);
        setExisting(true);
      } else {
        setGrailItem({...defaultItem, ...lastProfile});
        setExisting(false);
      }
      setLoaded(true);
    } else {
      setGrailItem(defaultItem);
      setExisting(false);
      setShow(false);
    }
  }, [item, category]);

  const characterChanged = () => {
    const character = formRef.current.character.value;
    const gameType = Array.from(formRef.current.gameType.values()).find(d => d.checked).value;
    const g = grailItems.find(gi => gi.gameType === gameType && gi.character === character);
    let newGrailItem;
    if (existing && !g) {
      newGrailItem = { ...defaultItem, ...{ gameType, character } };
    } else if (existing && g) {
      newGrailItem = { ...g, ...{ gameType, character } };
    } else if (!existing && !g) {
      newGrailItem = { ...grailItem, ...{ gameType, character } };
    } else if (!existing && g) {
      newGrailItem = { ...g, ...{ gameType, character } };
    }
    setGrailItem(newGrailItem);
    setExisting(!!g);
  }

  const gameTypeChanged = () => {
    const character = formRef.current.character.value;
    const gameType = Array.from(formRef.current.gameType.values()).find(d => d.checked).value;
    const g = grailItems.find(gi => gi.gameType === gameType && gi.character === character);
    let newGrailItem;
    if (existing && !g) {
      newGrailItem = { ...defaultItem, ...{ gameType, character } };
    } else if (existing && g) {
      newGrailItem = { ...g, ...{ gameType, character } };
    } else if (!existing && !g) {
      newGrailItem = { ...grailItem, ...{ gameType, character } };
    } else if (!existing && g) {
      newGrailItem = { ...g, ...{ gameType, character } };
    }
    setGrailItem(newGrailItem);
    setExisting(!!g);
  }

  const fetchGrailItems = async (category, slug) => {
    const res = await fetch('/api/user/grail/' + category + '/' + slug, {
      method: 'GET',
    });
    return await res.json();
  }

  const fetchGrailLastProfile = async () => {
    const res = await fetch('/api/user/grail/last-profile', {
      method: 'GET',
    });
    return await res.json();
  }

  const save = async (e, category, slug) => {
    e.preventDefault();

    const character = e.target.character.value;
    const foundAt = e.target.foundAt.value ?? '';
    const magicFind = e.target.magicFind.value ?? '';
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
      setLastProfile({ character, foundAt, magicFind, difficulty, gameType });
      const foundIndex = grailItems.findIndex(i => i.gameType === body.gameType && i.character === body.character);
      if (foundIndex >= 0) {
        setGrailItems(grailItems.map(i => i.gameType === body.gameType && i.character === body.character ? body : i));
        setGrailItem(body);
      } else {
        const newGrailItems = [...grailItems];
        newGrailItems.push(body);
        setGrailItems(newGrailItems);
        setGrailItem(body);
        setExisting(true);
      }

      toast.success('Holy grail item added');
      return true;
    }
    toast.error('Failed adding item');
    return false;
  }

  const remove = async () => {
    const character = formRef.current.character.value;
    const gameType = Array.from(formRef.current.gameType.values()).find(d => d.checked).value;

    const response = await fetch('/api/user/grail', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category, slug: item.slug, gameType, character })
    });
    if (response && response.ok) {
      const foundIndex = grailItems.findIndex(i => i.gameType === gameType && i.character === character);
      if (foundIndex >= 0) {
        const newGrailItems = [...grailItems];
        newGrailItems.splice(foundIndex, 1);
        setGrailItems(newGrailItems);
        if (newGrailItems.length > 0) {
          const gi = newGrailItems[0];
          setGrailItem(gi);
          setExisting(true);
        } else {
          setGrailItem({...defaultItem, ...lastProfile});
          setExisting(false);
        }
      }

      toast.success('Holy grail item removed');
      return true;
    }
    toast.error('Failed removing item');
    return false;
  }

  const hide = () => {
    setGrailItem(null);
    if (onHide) { onHide() }
  }

  return (
    <Modal show={show} onExited={hide}>
      <Modal.Body>
        {!loaded &&
          <p>Loading</p>
        }
        {loaded &&
          <form onSubmit={(e) => save(e, category, item.slug)} ref={formRef} id="grail-item-form">
            <div className="mb-3">
              <label htmlFor="character" className="form-label">Character</label>
              <select className="form-select" name="character" id="character" aria-label="Character who found it"
                value={grailItem?.character} onChange={characterChanged}>
                <option value="sorceress">Sorceress</option>
                <option value="barbarian">Barbarian</option>
                <option value="assasain">Assasain</option>
                <option value="druid">Druid</option>
                <option value="paladin">Paladin</option>
                <option value="amazon">Amazon</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="found-at" className="form-label">Where you found it?</label>
              <input type="text" className="form-control" name="foundAt" id="fount-at" placeholder="Place where you found it"
                value={grailItem?.foundAt} onChange={(e) => setGrailItem({ ...grailItem, ...{ foundAt: e.currentTarget.value } })} />
            </div>
            <div className="mb-3">
              <label htmlFor="magic-find" className="form-label">Magic Find?</label>
              <input type="text" className="form-control" name="magicFind" id="magic-find" placeholder="% of Magic find"
                value={grailItem?.magicFind} onChange={(e) => setGrailItem({ ...grailItem, ...{ magicFind: e.currentTarget.value } })} />
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" name="perfect" id="perfect" value="1"
                  checked={!!grailItem?.isPerfect} onChange={(e) => setGrailItem({ ...grailItem, ...{ isPerfect: e.currentTarget.checked } })} />
                <label className="form-check-label" htmlFor="perfect">Perfect</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" name="ethereal" id="ethereal" value="1"
                  checked={!!grailItem?.isEthereal} onChange={(e) => setGrailItem({ ...grailItem, ...{ isEthereal: e.currentTarget.checked } })} />
                <label className="form-check-label" htmlFor="ethereal">Ethereal</label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="normal" value="normal"
                  checked={grailItem?.difficulty === 'normal'} onChange={(e) => setGrailItem({ ...grailItem, ...{ difficulty: e.currentTarget.checked ? 'normal' : grailItem.difficulty } })} />
                <label className="form-check-label" htmlFor="normal">
                  Normal
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="nightmare" value="nightmare"
                  checked={grailItem?.difficulty === 'nightmare'} onChange={(e) => setGrailItem({ ...grailItem, ...{ difficulty: e.currentTarget.checked ? 'nightmare' : grailItem.difficulty } })} />
                <label className="form-check-label" htmlFor="nightmare">
                  Nightmare
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="difficulty" id="hell" value="hell"
                  checked={grailItem?.difficulty === 'hell' || !grailItem} onChange={(e) => setGrailItem({ ...grailItem, ...{ difficulty: e.currentTarget.checked ? 'hell' : grailItem.difficulty } })} />
                <label className="form-check-label" htmlFor="hell">
                  Hell
                </label>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gameType" id="softcore" value="softcore"
                  checked={grailItem?.gameType !== 'hardcore'} onChange={gameTypeChanged} />
                <label className="form-check-label" htmlFor="softcore" >
                  Softcore
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="gameType" id="hardcore" value="hardcore"
                  checked={grailItem?.gameType === 'hardcore'} onChange={gameTypeChanged} />
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
          {existing ? 'Save' : 'Add'}
        </Button>
        {existing &&
          <Button variant="danger" type="button" form="grail-item-form" onClick={remove}>
            Remove
          </Button>
        }
      </Modal.Footer>
    </Modal>
  )
}

export default GrailItemModal;
