import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

function UpperNav() {
  const router = useRouter();

  return (
    <ul>
      <li>
        <Link href="/uniques">
          <a className={router.pathname == "/uniques" ? "active" : ""}>
            Uniques
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
    </ul>
  )
}

export default UpperNav;
