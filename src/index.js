console.log("hello world");

import "./app.scss";

import { render } from "@wordpress/element";

const App = () => {
  return (
  <>
    <h2>キーワード</h2>
    <input type="text" />
    <h2>ターゲット</h2>
    <input type="text" />
    <hr />

    <h2>タイトル</h2>
    <button>タイトルを提案</button>
    <input type="text" />
    <hr />

    <h2>見出し</h2>
    <button>見出しを提案</button>
    <input type="text" />
    <hr />

    <h2>アウトラインの編集</h2>
  </>)
};

render(<App />, document.getElementById("app"));