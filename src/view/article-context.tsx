import { createContext } from "react";
import { Heading } from "../article/heading";

type ArticleContextValue = {
  keywords: string[];
  target: string;
  title: string;
  referSite: string;
  headings: Heading[];
  setKeywords: (keywords: string[]) => void;
  setTarget: (target: string) => void;
  setTitle: (title: string) => void;
  setReferSite: (referSite: string) => void;
  setHeadings: (headings: Heading[]) => void;
}

export const ArticleContext 
  = createContext<ArticleContextValue>({} as ArticleContextValue);