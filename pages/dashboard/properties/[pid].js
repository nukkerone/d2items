import Head from 'next/head';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';

export default function Property({ property }) {

  const submit = async event => {
    event.preventDefault();

    var formData = new FormData(event.target);

    fetch('/api/property', {
      body: JSON.stringify({
        _id: property._id,
        readable: formData.get('readable')
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(async (res) => {
      if (res && res.ok) {
        toast.success('Property saved');
      } else {
        toast.error('There was a problem saving the property');
      }
    }, (e) => {
      
    });

  }

  return (
    <div className="container">
      <Head>
        <title>Dashboard - Property</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <h1 className="title mt-5 mb-5">
          Manage property
        </h1>

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">code</label>
            <input type="text" className="form-control" disabled defaultValue={property.code}/>
          </div>

          <div className="mb-3">
            <label className="form-label">*desc</label>
            <input type="text" className="form-control" disabled defaultValue={property['*desc']} />
          </div>

          <div className="mb-3">
            <label className="form-label">*param</label>
            <input type="text" className="form-control" disabled defaultValue={property['*param']} />
          </div>

          <div className="mb-3">
            <label className="form-label">*min</label>
            <input type="text" className="form-control" disabled defaultValue={property['*min']} />
          </div>

          <div className="mb-3">
            <label className="form-label">*max</label>
            <input type="text" className="form-control" disabled defaultValue={property['*max']} />
          </div>

          { property['*notes'] ??
            <div className="mb-3">
              <label className="form-label">*notes</label>
              <input type="text" className="form-control" disabled defaultValue={property['*notes']} />
            </div>
          }
          
          <div className="mb-3">
            <label className="form-label" htmlFor="readable-input">Readable</label>
            <input id="readable-input" type="text" name="readable" className="form-control" defaultValue={property.readable} />
            <div id="emailHelp" className="form-text">For example, for dmg% property: <b>+&lt;*min&gt;-&lt;*max&gt;% Enhanced Damage</b>, and this will read something like: +50-70 Enhanced Damage</div>
          </div>
          
          <Link href="/dashboard" className="me-2"><button className="btn btn-secondary me-2">Back</button></Link>
          <button type="submit" className="btn btn-primary">Save Readable</button>
        </form>
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
  let property = null;

  if (query.pid) {
    property = await db.collection('properties').findOne({ _id: new ObjectId(query.pid) });
  }

  return {
    props: { property: JSON.parse(JSON.stringify(property)) },
  }
}
