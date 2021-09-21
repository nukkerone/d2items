import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import UpperNav from '../../components/upper-nav';
import { Table, Button } from 'react-bootstrap';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function GrailLeaderboard({ }) {
  const [gameType, setGameType] = useState('softcore');
  const { data, error } = useSWR(`/api/leaderboard?gameType=${gameType}`, fetcher);

  useEffect(function () {
    
  }, []);

  return (
    <div className="container container-bg container-uniques">
      <Head>
        <title>Holy Grail Items</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">

        <div className="logo"><h1><span>D2</span>BASE</h1></div>

        <UpperNav></UpperNav>

        <h1 className="title mb-4">
          Diablo 2 Resurrected Holy Grail Leaderboard
        </h1>

        <Button className="me-2 mb-3" onClick={() => setGameType('softcore')}>Softcore</Button>
        <Button className="me-2 mb-3" onClick={() => setGameType('hardcore')}>Hardcore</Button>
        
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {data?.leaderboard.map((l, i) => <tr>
              <td>{i+1}</td>
              <td>{l.email}</td>
              <td>{l.size}/{data.total}</td>
            </tr>)}
          </tbody>
        </Table>

      </div>

    </div>
  )
}


export async function getServerSideProps({ req, res }) {
  return {
    props: {
      
    },
  }

}
