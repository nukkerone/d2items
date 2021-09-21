import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';

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
  }, [])

  return (
    <ul className="item-nav">
      <li>
        <Link href="/uniques">
          <a className={router.pathname == "/uniques" ? "active" : ""}>
            Uniques
          </a>
        </Link>
      </li>
      <li>
        <Link href="/runewords">
          <a className={router.pathname == "/runewords" ? "active" : ""}>
            Runewords
          </a>
        </Link>
      </li>
      <li>
        <Link href="/sets">
          <a className={router.pathname == "/sets" ? "active" : ""}>
            Sets
          </a>
        </Link>
      </li>
      <li>
        <Link href="/base">
          <a className={router.pathname == "/base" ? "active" : ""}>
            Base
          </a>
        </Link>
      </li>
      <li>
        <Link href="/recipes">
          <a className={router.pathname == "/recipes" ? "active" : ""}>
            Recipes
          </a>
        </Link>
      </li>
      <li>
        <Link href="/misc">
          <a className={router.pathname == "/misc" ? "active" : ""}>
            Misc
          </a>
        </Link>
      </li>
      {session && <li>
        <Link href="/grail">
          <a className={router.pathname == "/grail" ? "active" : ""}>
            My Holy Grail
          </a>
        </Link>
      </li>
      }
      <li>
        <Link href="/grail/leaderboard">
          <a className={router.pathname == "/grail/leaderboard" ? "active" : ""}>
            Leaderboard
          </a>
        </Link>
      </li>
      {session && <li>
        <Link href="/logout">
          <a>
            Logout
          </a>
        </Link>
      </li>

      }
    </ul>
  )
}

export default UpperNav;
