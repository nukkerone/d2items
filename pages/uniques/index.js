import Head from 'next/head';
import { connectToDatabase } from '../../lib/mongodb';
import Link from 'next/link';

export default function Uniques({ uniqueitems }) {
  return (
    <div className="container">
      <Head>
        <title>Unique items</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <h1 className="title mt-5 mb-5">
          Unique Items
        </h1>

        {
          uniqueitems.map(item =>
            <div className="card" key={item._id}>
              <h2>{item.index}</h2>
              <h3>{item.tierName} Unique</h3>
              <h4>{item['*type']}</h4>
              
              {item['is2handed'] ?
                <>
                  <p>2H damage: {item['2handmindam'] + '-' + item['2handmaxdam']}</p>
                </>
                :
                <>
                  <p>1H damage: {item.mindam + '-' + item.maxdam}</p>
                </>
              }
              <p>Base Speed: {item.speed}</p>
              <p>Durability: {item.durability}</p>
              <p>Req level: {item['lvl req']}</p>

              {
                Object.entries(item).map(([key, val]) => {
                  console.log('Prop ', key, val);
                  const match = key.match(/(prop)[0-9]+/g);
                  if (match && match.length > 0) {
                    return <p className="property">{val}</p>
                  }
                })
              }

            </div>
          )
        }

      </div>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="logo" />
        </a>
      </footer>

      <style jsx>{`

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .subtitle {
          font-size: 2rem;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}


export async function getServerSideProps(context) {
  const { db } = await connectToDatabase()
  const uniqueitems = await db.collection('generated').find({}).limit(500).toArray();

  return {
    props: { uniqueitems: JSON.parse(JSON.stringify(uniqueitems)) },
  }
}
