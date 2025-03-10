import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { SearchIntent, StringArray } from "./response-type";
import OpenAI from "openai";
import { Heading } from "../article/heading";

const LLM_MODEL = "gpt-4o-mini";

export class Prompt {

  constructor(
    public client: OpenAI
  ) { }

  async requestString(
    system_msg: string,
    user_msg: string
  ) {
    let completion = await this.client.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: system_msg },
        { role: "user", content: user_msg }
      ]
    })
    let res = completion.choices[0].message.content;
    if (res == undefined) {
      throw new Error("Can't parse to json");
    }
    return res;
  }

  async requestStringArray(
    system_msg: string, user_msg: string
  ) {
    let completion = await this.client.beta.chat.completions.parse({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: system_msg },
        { role: "user", content: user_msg }
      ],
      response_format: zodResponseFormat(StringArray, "event"),
    });
    let res = completion.choices[0].message.parsed;
    if (res == undefined) {
      throw new Error("Can't parse to json");
    }
    return res.array;
  }

  async requestObject(
    system_msg: string, user_msg: string,
    format: z.ZodObject<any>
  ) {
    let completion = await this.client.beta.chat.completions.parse({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: system_msg },
        { role: "user", content: user_msg },
      ],
      response_format: zodResponseFormat(format, "event"),
    });
    let res = completion.choices[0].message.parsed;
    if (res == undefined) {
      throw new Error("Can't parse to json");
    }
    return res;
  }

  async suggestTitles(
    keywords: string[],
    target: string
  ) { //TODO typescriptに移行する
    let system_msg = "入力された要件に合うような、SEO最適化されたブログのタイトルを10個提案してください。";
    let user_msg = `
      キーワード:「${keywords.join(", ")}」 
      ターゲット: 「${target}」`;
    const res = await this.requestStringArray(system_msg, user_msg);
    return res;
  }

  async suggestSeoKeywords(
    keywords: string[],
  ) {
    let system_msg = "入力された項目に関連するSEOキーワードを30個特定してください。";
    let user_msg = `キーワード:「${keywords.join(", ")}」`;
    const res = await this.requestStringArray(system_msg, user_msg);
    return res;
  }

  async suggestOutlines(
    title: string,
    keywords: string[],
    target: string
  ) {
    let system_msg = "入力された項目を参考にして、ブログ記事のアウトラインの例を10個考えてください。";
    let user_msg = `
      記事のタイトル:「${title}」
      キーワード:「${keywords.join(", ")}」 
      ターゲット: 「${target}」`;
    const res = await this.requestStringArray(system_msg, user_msg);
    return res;
  }

  async suggestSubheadings(
    title: string,
    heading: string
  ) {
    let system_msg = "入力された見出しに合うような、さらに内側の見出しの例を10個提案してください。";
    let user_msg = `
      記事のタイトル:「${title}」
      記事の見出し:「${heading}」`;
    const res = await this.requestStringArray(system_msg, user_msg);
    return res;
  }

  async generateBody(
    title: string,
    heading: string,
    subheadings: string[],
    desiredLength: number,
  ) {
    let system_msg = `
      初心者を対象とした親しみやすく助けになる雰囲気で、SEOを意識した記事の本文を書いてください。
      文章は指定されたアウトラインの内容のみ書いてください。

      視点: 記事のライターとして、優しく親しみを得やすい文章を書く。
      ${desiredLength && `長さ: ${desiredLength} 文字程度。`}

      出力: 
        - タグはマークアップ形式で出力してください。
        - 段落ごとに「p」タグで区切ってください。
        - 「##」の代わりに「h2」タグを、「###」の代わりに「h3」タグを使用してください。
        - マーカーを引きたいときは「strong」タグで囲ってください。
    `;
    let sub = subheadings.map(v => `### ${v}`).join("\n");
    let user_msg = `
      記事のタイトル:「${title}」
      アウトライン:
        ## ${heading}
        ${sub}
    `;
    const res = await this.requestString(system_msg, user_msg);
    return res;
  }

  // 検索意図を分類します
  async classifySearchIntent(
    heading: string,
    subheadings: string[],
  )
    : Promise<(typeof SearchIntent)[]> {
    const arr = await Promise.all(subheadings.map(async v => {
      let system_msg = "次の入力された小見出しに関連する検索意図(Buyクエリ、Knowクエリ、Doクエリ、Goクエリ)を分析してください。";
      let user_msg = `
        見出し:「${heading}」
        小見出し:「${v}」
      `;
      const res = await this.requestObject(system_msg, user_msg, SearchIntent)
      return res.type;
    }));
    console.log(arr)
    return arr;
  }

}