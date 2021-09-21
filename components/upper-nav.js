import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSession, signOut as nextSignout } from 'next-auth/client';
import { Button } from 'react-bootstrap';

function UpperNav() {
  const router = useRouter();

  const [session, setSession] = useState(null)

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setSession(session);
      } else {
        setSession(null);
      }
    });
  }, []);

  const signOut = async () => {
    await nextSignout();
    router.reload();
  }

  return (
    <ul className="item-nav">
      <li className="mb-3 d-inline-block">
        <Link href="/uniques">
          <a className={router.pathname == "/uniques" ? "active" : ""}>
            Uniques
          </a>
        </Link>
      </li>
      <li className="mb-3 d-inline-block">
        <Link href="/runewords">
          <a className={router.pathname == "/runewords" ? "active" : ""}>
            Runewords
          </a>
        </Link>
      </li>
      <li className="mb-3 d-inline-block">
        <Link href="/sets">
          <a className={router.pathname == "/sets" ? "active" : ""}>
            Sets
          </a>
        </Link>
      </li>
      <li className="mb-3 d-inline-block">
        <Link href="/base">
          <a className={router.pathname == "/base" ? "active" : ""}>
            Base
          </a>
        </Link>
      </li>
      <li className="mb-3 d-inline-block">
        <Link href="/recipes">
          <a className={router.pathname == "/recipes" ? "active" : ""}>
            Recipes
          </a>
        </Link>
      </li>
      <li className="mb-3 d-inline-block">
        <Link href="/misc">
          <a className={router.pathname == "/misc" ? "active" : ""}>
            Misc
          </a>
        </Link>
      </li>
      {session && <li className="mb-3 d-inline-block">
        <Link href="/grail">
          <a className={router.pathname == "/grail" ? "active" : ""}>
            My Holy Grail
          </a>
        </Link>
      </li>
      }
      <li className="mb-3 d-inline-block">
        <Link href="/grail/leaderboard">
          <a className={router.pathname == "/grail/leaderboard" ? "active" : ""}>
            Leaderboard
          </a>
        </Link>
      </li>
      {session && <li className="mb-3 d-inline-block">
        <Button variant="secondary" onClick={() => signOut()}>
          Sign-out
        </Button>
      </li>}
      {!session && <li className="mb-3 d-inline-block">
        <Link href="/auth/signin" variant="secondary">
          <Button variant="secondary">
            Sign-in
          </Button>
        </Link>
      </li>}
    </ul>
  )
}

export default UpperNav;
