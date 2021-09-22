import { useEffect, useState } from 'react';
import Head from 'next/head';
import UpperNav from '../../components/upper-nav';
import { Table, Button } from 'react-bootstrap';
import useSWR from 'swr';
import Link from 'next/link';
import classNames from 'classnames';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function GrailLeaderboard({ }) {
  const [character, setCharacter] = useState('sorceress');
  const [gameType, setGameType] = useState('softcore');
  const { data, error } = useSWR(`/api/leaderboard?gameType=${gameType}&character=${character}`, fetcher);

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

        <div className="row">
          <div className="col-sm-4 col-md-2">
            <select className="form-select mb-3" name="character" id="character" aria-label="Character who found it"
              value={character} onChange={(e) => setCharacter(e.currentTarget.value)}>
              <option value="sorceress">Sorceress</option>
              <option value="barbarian">Barbarian</option>
              <option value="assasain">Assasain</option>
              <option value="druid">Druid</option>
              <option value="paladin">Paladin</option>
              <option value="amazon">Amazon</option>
            </select>
          </div>
          <div className="col-sm-4 col-md-2">
            <Button className={classNames('mb-3 w-100', { active: gameType === 'softcore' })}
              onClick={() => setGameType('softcore')}>Softcore</Button>
          </div>
          <div className="col-sm-4 col-md-2">
            <Button className={classNames('mb-3 w-100', { active: gameType === 'hardcore' })}
              onClick={() => setGameType('hardcore')}>Hardcore</Button>
          </div>
        </div>
        
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Items</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.leaderboard.map((l, i) => <tr>
              <td>{i+1}</td>
              <td>{l.username}</td>
              <td>{l.size}/{data.total}</td>
              <td>
                {l.username && <Link href={'/grail/' + l.username + '?gameType=' + gameType + '&character=' + character }>
                  View Grail
                </Link>}
              </td>
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
