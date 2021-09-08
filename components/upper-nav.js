import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

function UpperNav() {
  const router = useRouter();

  return (
    <ul class="item-nav">
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
    </ul>
  )
}

export default UpperNav;
