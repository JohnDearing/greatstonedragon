export type PolicyInline =
  | string
  | { text: string; href: string; external?: boolean };

export type PolicyBlock =
  | { type: "paragraph"; content: PolicyInline[] }
  | { type: "list"; items: PolicyInline[][] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type PolicySection = {
  title: string;
  blocks?: PolicyBlock[];
  subsections?: PolicySection[];
};

export type PolicyDocument = {
  title: string;
  lastUpdated: string;
  lead?: string;
  sections: PolicySection[];
};

export function p(...content: PolicyInline[]): PolicyBlock {
  return { type: "paragraph", content };
}

export function ul(...items: PolicyInline[][]): PolicyBlock {
  return { type: "list", items };
}

export function table(headers: string[], rows: string[][]): PolicyBlock {
  return { type: "table", headers, rows };
}

export function link(text: string, href: string, external = true): PolicyInline {
  return { text, href, external };
}
