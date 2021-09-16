import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function useGrail(category) {
  const [grail, setGrail] = useState([]);

  useEffect(() => {
    
  });

  const fetchGrail = async () => {
    const response = await fetch('/api/user/grail', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if (response && response.ok) {
      const body = await response.json();
      setGrail(body);
    }
  }

  const addToGrail = async (item) => {
    const response = await fetch('/api/user/grail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category, slug: item.slug }) // body data type must match "Content-Type" header
    });
    if (response && response.ok) {
      const body = await response.json();
      setGrail(body);
      toast.success('Holy grail item added');
      return true;
    }
    toast.success('Failed adding item');
    return false;
  }

  const removeFromGrail = async (item) => {
    const response = await fetch('/api/user/grail', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category, slug: item.slug }) // body data type must match "Content-Type" header
    });
    if (response && response.ok) {
      const body = await response.json();
      setGrail(body);
      toast.success('Holy grail item removed');
      return true;
    }
    toast.success('Failed removing item');
    return false;
  }

  return [grail, fetchGrail, addToGrail, removeFromGrail];
}

export default useGrail;