// pages/index.js - Improved layout structure
import Head from "next/head";
import Game from "../components/Game";

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>MoonSun Puzzle</title>
        <meta name="description" content="A challenging logic puzzle game" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">
          <span className="title-word">Moon</span>
          <span className="title-word sun">Sun</span>
        </h1>

        <Game />

        <footer className="footer">
          <p>Challenge your logical thinking</p>
        </footer>
      </main>
    </div>
  );
}
