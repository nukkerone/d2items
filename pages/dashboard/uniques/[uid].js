import Head from 'next/head';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';

export default function UniqueManage({ unique, propList }) {

  const submit = async event => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const body = {
      action: 'update',
      data: {},
    };

    for (const [key, value] of formData.entries()) {
      body.data[key] = value;
    }

    fetch('/api/uniques/' + unique._id, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(async (res) => {
      if (res && res.ok) {
        toast.success('Unique saved');
      } else {
        toast.error('There was a problem saving the unique');
      }
    }, (e) => {

    });
  }

  const addEntry = async event => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const body = {
      action: 'add-entry',
      data: {
        key: formData.get('entryKey'),
        value: formData.get('entryValue'),
      },
    };

    fetch('/api/uniques/' + unique._id, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(async (res) => {
      if (res && res.ok) {
        toast.success('Field added');
      } else {
        toast.error('There was a problem adding the field');
      }
    }, (e) => {

    });
  }

  const removeEntry = async event => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const body = {
      action: 'remove-entry',
      data: {
        key: formData.get('removeEntryKey'),
      },
    };

    fetch('/api/uniques/' + unique._id, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(async (res) => {
      if (res && res.ok) {
        toast.success('Field removed');
      } else {
        toast.error('There was a problem removing the field');
      }
    }, (e) => {

    });
  }

  return (
    <div className="container">
      <Head>
        <title>Dashboard - Unique</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <h1 className="title mt-5 mb-5">
          Manage Unique: { unique.index }
        </h1>

        <div className="row">
          <div className="col-lg-8">
            <form onSubmit={submit} className="mb-5">
              {propList.map(key => (
                <div className="mb-3" key={key}>
                  <label className="form-label">{key}</label>
                  <input type="text" className="form-control" name={key} defaultValue={unique[key]} />
                </div>
              ))}


              <Link href="/dashboard" className="me-2"><button className="btn btn-secondary me-2">Back</button></Link>
              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>

          <div className="col-lg-4">
            <form onSubmit={addEntry}>
              <div className="mb-3">
                <label className="form-label">Key</label>
                <input type="text" className="form-control" name="entryKey" defaultValue="" />
              </div>
              <div className="mb-3">
                <label className="form-label">Value</label>
                <input type="text" className="form-control" name="entryValue" defaultValue="" />
              </div>

              <button type="submit" className="btn btn-primary">Add</button>
            </form>

            <hr />

            <form onSubmit={removeEntry}>
              <div className="mb-3">
                <label className="form-label">Key</label>
                <input type="text" className="form-control" name="removeEntryKey" defaultValue="" />
              </div>

              <button type="submit" className="btn btn-danger">Remove</button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  )
}

/**
 * Server side
 */
export async function getServerSideProps(context) {
  const { db } = await connectToDatabase();
  const { query } = context;
  let unique = null;

  if (query.uid) {
    unique = await db.collection('unique_scrapped_normalized').findOne({ _id: new ObjectId(query.uid) });
  }
  const propList = Object.keys(unique);

  return {
    props: { unique: JSON.parse(JSON.stringify(unique)), propList },
  }
}
