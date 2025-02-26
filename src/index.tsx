//基本モジュール
import { render } from "@wordpress/element";
import { OpenAI } from "openai";
import { useRef, useState } from "react";

//Material UI
import {
  Typography,
  Autocomplete,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Container,
  Box,
  Stack,
} from "@mui/material";

//スタイルシートの読み込み
import "./scss/app.scss";

import { Prompt } from "./prompt/prompt";
import { Heading } from "./article/heading";
import { HeadingView } from "./view/heading-view";
import { ArticleContext } from "./view/article-context";

console.log("hello world! v0.2");

//FIXME 仮でハードコーディングしている
const API_RAW: string =
  "c2stcHJvai1iVTlhdGpVV3RWMWxXRGJVMjkxWHMwMVFaenZwZ3hhLW9YRnNKRWhiUG1WR295Xy1aMnBTYmRtNnNvRXREcXZVMGFUVi1PWWZfbVQzQmxia0ZKZGJDak1qUzcySkZjQ1dFTGltZ1BpMnZjcF9nQWtlTnB5VlFCV1dERFhTOGhyTFRoUzZrbi1HZ3lOeDIxQTlkajdCMENsNWZDa0E=";

const openai = new OpenAI({
  apiKey: atob(API_RAW),
  dangerouslyAllowBrowser: true,
});

const prompt = new Prompt(openai);

//TODO UIをMUIで統一したい
const App: React.FC = () => {
  const [referSite, setReferSite] = useState(""); //参考サイト
  const [keywords, setKeywords] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [headings, setHeadings] = useState<Heading[]>([]); //list[Heading]

  const [isGenerating, setIsGenerating] = useState(false);
  const [optTitles, setOptTitles] = useState<string[]>([]);
  const [optHeadings, setOptHeadings] = useState<string[]>([]);
  const [optGenerated, setOptGenerated] = useState<string[]>([]);

  //内部状態
  const inputHeadingRef = useRef<HTMLInputElement>(null);
  const [selectedHeading, setSelectedHeading] = useState<Heading | undefined>();
  const [optSubheadings, setOptSubheadings] = useState<string[]>([]); //選択されたヘッダの入力

  const suggestTitles = async () => {
    const titles = await prompt.suggestTitles(keywords, target);
    setOptTitles(titles);
  };

  const suggestHeadings = async () => {
    const headings = await prompt.suggestOutlines(title, keywords, target);
    setOptHeadings(headings);
  };

  const addHeading = async (str: string) => {
    let sub = await prompt.suggestSubheadings(title, str);
    sub = sub.slice(0, 2); //TODO 最初から追加しなくても良い
    let h = new Heading(str, sub);
    console.log(`add heading: ${h.name} ${h.subs}`);
    setHeadings([...headings, h]);
  };

  const addSubheading = (sub: string) => {
    selectedHeading?.subs.push(sub);
    setSelectedHeading(undefined);
  }

  const setHeadingModal = async (head: Heading) => {
    setSelectedHeading(head);
    let arr = await prompt.suggestSubheadings(title, head.name);
    //FIXME 検索意図はキーワードに対して使用する
    //let si = await prompt.classifySearchIntent(head.name, arr); 
    setOptSubheadings(arr);
  }

  const generateBody = async () => {
    //生成結果を初期化
    setIsGenerating(true);
    setOptGenerated([]);

    const res = [];
    for (let h of headings) {
      console.log("start generating", title, h.name, h.subs, h.length);
      let s = await prompt.generateBody(title, h.name, h.subs, h.length);
      res.push(s);
    }
    //生成完了の処理
    setOptGenerated(res);
    setIsGenerating(false);
  };

  return (
    <ArticleContext.Provider value={{
      keywords,
      target,
      title,
      referSite,
      headings,
      setKeywords,
      setTarget,
      setTitle,
      setReferSite,
      setHeadings,
    }}>
      <Container>
        <Button onClick={() => {
          setKeywords(["プラチナ", "婚約", "指輪"]);
          setTarget("カップル");
          setTitle("カップル必見！プラチナ婚約指輪の魅力とは");
          setReferSite("https://kazoku-wedding.jp/howto/party-platinumring/");
          setHeadings([
            new Heading("1. プラチナ婚約指輪とは？基本情報と特長",
              ["プラチナ婚約指輪の歴史と文化", "プラチナの持つ意味と象徴"]
            )
          ])
        }}>
          開発者モード
        </Button>
        <h2>キーワード</h2>
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={keywords}
          onChange={(e, v) => setKeywords(v)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              placeholder="キーワードを入力しEnterで追加します"
            />
          )}
        />
        <h2>ターゲット</h2>
        <TextField
          variant="standard"
          placeholder="想定される記事の読者を入力してください (例: カップル)"
          value={target}
          onChange={e => setTarget(e.target.value)}
        />

        <h2>タイトル</h2>
        <Stack alignItems={"flex-start"}>
          <Button variant="contained" onClick={suggestTitles}>
            タイトルを提案
          </Button>
          {optTitles.length > 0 && optTitles.map((v, i) => {
            const onClick = () => {
              setTitle(v);
              setOptTitles([]);
            }
            return <Chip key={i} label={v} onClick={onClick} />;
          })}
          {optTitles.length > 0 &&
            <Typography variant="caption">
              クリックで候補を採用します
            </Typography>}
          <TextField
            variant="standard"
            placeholder="記事のタイトルを入力してください"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </Stack>
        <hr />

        <h2>参考サイト(未実装)</h2>
        <TextField
          variant="standard"
          placeholder="参考にするサイトのURLを入力してください"
          value={referSite}
          onChange={e => setReferSite(e.target.value)}
        />
        <h2>見出し</h2>
        <Stack alignItems={"flex-start"}>
          <Button variant="contained" onClick={suggestHeadings}>
            タイトルから見出しを提案
          </Button>
          {optHeadings.length > 0 &&
            optHeadings.map((v, i) => {
              const onClick = () => {
                addHeading(v);
                setOptHeadings(optHeadings.filter((h) => h !== v));
              };
              return <Chip key={i} label={v} onClick={onClick} />;
            })}
          {optHeadings.length > 0 &&
            <Typography variant="caption">
              クリックで候補を採用します
            </Typography>}
        </Stack>
        <TextField
          variant="standard"
          placeholder="入力しEnderで手動で追加します"
          inputRef={inputHeadingRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            const v = inputHeadingRef.current!!.value;
            console.log(v)
            if (e.key === "Enter" && v !== "") {
              e.preventDefault();
              inputHeadingRef.current!!.value = "";
              addHeading(v);
            }
          }}
        />
        <hr />

        <h2>レイアウト</h2>
        <Typography variant="caption">
          見出しをもとに小見出しをいくつか提案しました。
          項目は自由に編集できるため、順序の変更や追加・削除、編集などを行ってから記事を生成してください。
        </Typography>
        {headings.length > 0 && headings.map((head, i) =>
          <HeadingView
            key={i}
            heading={head}
            addSubheading={addSubheading}
            setHeadingModal={setHeadingModal}
            selectedHeading={selectedHeading}
            setSelectedHeading={setSelectedHeading}
            optSubheadings={optSubheadings}
          />)}
        <Button variant="contained" onClick={generateBody}>
          記事を生成
        </Button>
        {isGenerating && <CircularProgress />}
        <hr />

        <h2>出力結果の確認</h2>
        {optGenerated.length > 0 &&
          optGenerated.map((v, i) => (
            <Box
              key={i}
              dangerouslySetInnerHTML={{ __html: v }}
            />
          ))}
        <Button variant="contained" onClick={() => {
          navigator.clipboard.writeText(optGenerated.join("\n"));
        }}>
          HTMLをコピー
        </Button>
      </Container>
    </ArticleContext.Provider>
  );
};

render(<App />, document.getElementById("app"));
