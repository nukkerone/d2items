import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

function GrailItemModal({ type, item, onHide }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    console.log('Item ', item);
    const res = await fetch('/api/user/grail/' + type + '/' + item.slug, {
      method: 'GET',
    });
    const grailItem = await res.json();
    setGrailItem(grailItem);
    setLoading(false);
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Body>
        { loading &&
          <p>Loading</p>
        }
        { !loading && item &&
          <p>Item loaded</p>  
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
