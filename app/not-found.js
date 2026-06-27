import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-shell compact">
      <p className="kicker">404</p>
      <h1>Challenge not found</h1>
      <p className="lede">That route is not part of the merged hunt project.</p>
      <Link className="home-button" href="/">
        Return home
      </Link>
    </main>
  );
}
