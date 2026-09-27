const defs = `
<defs>
  <radialGradient id="aura" cx="50%" cy="48%" r="52%">
    <stop offset="0" stop-color="#fff2b6" stop-opacity=".9"/>
    <stop offset=".5" stop-color="#d7a447" stop-opacity=".22"/>
    <stop offset="1" stop-color="#9a6427" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="fur" x1=".15" y1=".08" x2=".85" y2=".95">
    <stop offset="0" stop-color="#f5d58a"/>
    <stop offset=".42" stop-color="#c99545"/>
    <stop offset="1" stop-color="#8c5a25"/>
  </linearGradient>
  <linearGradient id="mane" x1=".2" y1=".1" x2=".8" y2=".9">
    <stop offset="0" stop-color="#f3c960"/>
    <stop offset=".55" stop-color="#b9782f"/>
    <stop offset="1" stop-color="#70431e"/>
  </linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff0a6"/>
    <stop offset=".5" stop-color="#d8a73f"/>
    <stop offset="1" stop-color="#8d561f"/>
  </linearGradient>
</defs>`;

const face = `
<ellipse cx="80" cy="67" rx="24" ry="21" fill="url(#fur)"/>
<ellipse cx="80" cy="74" rx="15" ry="11" fill="#f4dcaa"/>
<ellipse cx="71" cy="65" rx="3.6" ry="4.6" fill="#172634"/>
<ellipse cx="89" cy="65" rx="3.6" ry="4.6" fill="#172634"/>
<circle cx="72.1" cy="63.7" r="1.2" fill="#fff"/>
<circle cx="90.1" cy="63.7" r="1.2" fill="#fff"/>
<path d="M76 73 80 70l4 3-4 4Z" fill="#5e3c26"/>
<path d="M74 80c4 4 8 4 12 0" fill="none" stroke="#6f432c" stroke-width="2.2" stroke-linecap="round"/>
`;

const stages = {
  1: `
    <circle cx="80" cy="79" r="43" fill="url(#aura)"/>
    <ellipse cx="80" cy="106" rx="28" ry="27" fill="url(#fur)"/>
    <ellipse cx="80" cy="111" rx="17" ry="18" fill="#efd8a8"/>
    <circle cx="80" cy="65" r="29" fill="url(#mane)" opacity=".78"/>
    <circle cx="80" cy="65" r="24" fill="url(#fur)"/>
    <path d="M59 52 53 35l15 12M101 52l6-17-15 12" fill="url(#fur)"/>
    ${face}
    <path d="M56 107c-13 3-20 11-21 23 9-6 18-7 27-4Z" fill="url(#fur)"/>
    <path d="M104 107c13 3 20 11 21 23-9-6-18-7-27-4Z" fill="url(#fur)"/>
  `,
  2: `
    <circle cx="80" cy="79" r="51" fill="url(#aura)"/>
    <path d="M80 34c-18-8-35 5-37 24-12 3-18 14-14 25 3 9 11 14 20 14-3 13 5 26 18 30 8 3 17 1 23-5 7 7 18 8 27 3 11-6 15-19 9-30 10-3 17-12 16-22-1-12-11-20-22-20-5-17-22-27-40-19Z" fill="url(#mane)"/>
    <ellipse cx="80" cy="106" rx="27" ry="31" fill="url(#fur)"/>
    <ellipse cx="80" cy="111" rx="16" ry="20" fill="#efd8a8"/>
    <path d="M61 52 55 32l15 14M99 52l6-20-15 14" fill="url(#fur)"/>
    ${face}
    <path d="M55 111c-15 5-23 15-22 29 9-8 19-10 29-6Z" fill="url(#fur)"/>
    <path d="M105 111c15 5 23 15 22 29-9-8-19-10-29-6Z" fill="url(#fur)"/>
    <path d="M107 118c17-6 25 4 20 14-4 8-13 10-22 6 10-2 13-10 2-20Z" fill="none" stroke="#b5792f" stroke-width="7" stroke-linecap="round"/>
  `,
  3: `
    <circle cx="80" cy="78" r="61" fill="url(#aura)"/>
    <circle cx="80" cy="78" r="49" fill="none" stroke="#e2b752" stroke-width="1.5" stroke-dasharray="3 8" opacity=".65"/>
    <path d="M80 25c-15-10-31-3-39 11-14-2-27 8-29 22-2 12 5 23 16 27-6 12-2 27 10 35 10 7 23 7 33 1 8 10 23 13 35 7 12-6 18-19 15-32 12-2 21-12 22-24 1-15-10-28-25-30-7-14-23-22-38-17Z" fill="url(#mane)"/>
    <ellipse cx="80" cy="105" rx="25" ry="34" fill="url(#fur)"/>
    <path d="M65 100c4 15 9 26 15 33 7-8 12-19 15-33-9-6-21-6-30 0Z" fill="#f0d9a8"/>
    <path d="M60 51 53 28l17 17M100 51l7-23-17 17" fill="url(#fur)"/>
    ${face}
    <path d="M48 96 34 89l5 15-14 4 17 7-8 15 19-8" fill="url(#mane)" opacity=".85"/>
    <path d="M112 96 126 89l-5 15 14 4-17 7 8 15-19-8" fill="url(#mane)" opacity=".85"/>
    <path d="M108 117c20-6 29 5 24 17-4 9-14 13-25 9 13-3 16-13 1-26Z" fill="none" stroke="#9b6227" stroke-width="8" stroke-linecap="round"/>
  `,
  4: `
    <circle cx="80" cy="78" r="70" fill="url(#aura)"/>
    <circle cx="80" cy="78" r="57" fill="none" stroke="#e7bc55" stroke-width="2.2" stroke-dasharray="3 7" opacity=".72"/>
    <path d="M80 20c-15-11-33-6-43 9-15-3-30 7-34 22-4 13 2 26 13 33-8 12-5 29 7 39 10 9 25 10 36 3 9 12 25 16 39 10 14-6 21-21 17-35 14-2 24-13 26-27 2-17-10-32-27-35-7-15-23-24-34-19Z" fill="url(#mane)"/>
    <ellipse cx="80" cy="105" rx="25" ry="35" fill="url(#fur)"/>
    <path d="M64 99c5 16 10 28 16 35 8-9 13-21 16-36-10-6-22-6-32 1Z" fill="#f3dcaa"/>
    <path d="M59 50 51 25l19 18M101 50l8-25-19 18" fill="url(#fur)"/>
    ${face}
    <path d="M63 43 70 27l10 8 10-8 7 16-8-4-9 8-9-8Z" fill="url(#gold)" stroke="#f7df89" stroke-width="1.2"/>
    <circle cx="80" cy="35" r="3.6" fill="#8f2940" stroke="#ffe38c" stroke-width="1.3"/>
    <path d="M49 94 31 84l6 18-17 5 20 8-10 17 23-9" fill="url(#mane)" opacity=".9"/>
    <path d="M111 94 129 84l-6 18 17 5-20 8 10 17-23-9" fill="url(#mane)" opacity=".9"/>
    <path d="M108 116c22-7 33 5 28 19-4 10-16 15-28 10 14-3 18-15 0-29Z" fill="none" stroke="#8a5422" stroke-width="9" stroke-linecap="round"/>
    <circle cx="24" cy="61" r="2" fill="#ffe07c"/><circle cx="137" cy="66" r="1.8" fill="#ffe9a2"/>
    <circle cx="38" cy="130" r="1.6" fill="#e9b84f"/><circle cx="125" cy="130" r="2" fill="#f6d26d"/>
  `,
};

export function renderSphinxStageSvg(stage) {
  const body = stages[stage];
  if (!body) throw new Error(`Unknown Kim Su stage: ${stage}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">${defs}${body}</svg>`;
}
