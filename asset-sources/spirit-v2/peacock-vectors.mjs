const palettes = {
  1: { bodyLight: "#9bc8c2", body: "#5d9694", bodyDark: "#315e65", tail: "#6d9d9a", accent: "#9b8753", glow: "#d7e7d9" },
  2: { bodyLight: "#75c4bb", body: "#328f8c", bodyDark: "#205f69", tail: "#268d89", accent: "#b69a4f", glow: "#b7e4dc" },
  3: { bodyLight: "#4bd0c0", body: "#147b82", bodyDark: "#124c60", tail: "#087c83", accent: "#d0ad45", glow: "#79e7d4" },
  4: { bodyLight: "#26e2c5", body: "#086e7b", bodyDark: "#083e59", tail: "#007c86", accent: "#f0c54e", glow: "#45efd0" },
};

function defs(p, stage) {
  return `<defs>
    <linearGradient id="body" x1=".18" y1=".02" x2=".8" y2="1">
      <stop offset="0" stop-color="${p.bodyLight}"/>
      <stop offset=".5" stop-color="${p.body}"/>
      <stop offset="1" stop-color="${p.bodyDark}"/>
    </linearGradient>
    <linearGradient id="feather" x1=".1" y1=".1" x2=".85" y2="1">
      <stop offset="0" stop-color="${p.bodyLight}"/>
      <stop offset=".56" stop-color="${p.tail}"/>
      <stop offset="1" stop-color="${p.bodyDark}"/>
    </linearGradient>
    <radialGradient id="halo">
      <stop offset="0" stop-color="${p.glow}" stop-opacity=".55"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="${stage === 4 ? 3 : 1.5}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

function eyeFeather(x, y, scale, p) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse rx="5.6" ry="9.2" fill="${p.accent}" opacity=".96"/>
    <ellipse rx="3.1" ry="6.1" fill="${p.bodyLight}"/>
    <ellipse rx="1.55" ry="3.7" fill="${p.bodyDark}"/>
    <circle cy="-1.1" r=".8" fill="#e7fff0"/>
  </g>`;
}

function crest(p, stage) {
  if (stage === 1) return `<g stroke="${p.tail}" stroke-width="2.6" stroke-linecap="round">
    <path d="M99 51Q94 40 93 37"/><path d="M104 49Q104 36 106 32"/><path d="M109 51Q116 41 119 40"/>
    <circle cx="93" cy="36" r="2.1" fill="${p.accent}" stroke="none"/>
    <circle cx="106" cy="31" r="2.1" fill="${p.accent}" stroke="none"/>
    <circle cx="120" cy="39" r="2.1" fill="${p.accent}" stroke="none"/>
  </g>`;
  if (stage === 2) return `<g stroke="${p.tail}" stroke-width="3" stroke-linecap="round">
    <path d="M97 48Q88 34 87 27"/><path d="M101 46Q97 28 99 22"/><path d="M105 45Q107 27 112 20"/>
    <path d="M109 47Q119 32 126 29"/><path d="M112 50Q126 43 132 43"/>
    <g fill="${p.accent}" stroke="none"><circle cx="87" cy="26" r="2.6"/><circle cx="99" cy="21" r="2.6"/><circle cx="113" cy="19" r="2.6"/><circle cx="127" cy="28" r="2.6"/><circle cx="133" cy="43" r="2.6"/></g>
  </g>`;
  return `<g stroke="${p.tail}" stroke-width="${stage === 4 ? 3.4 : 3.1}" stroke-linecap="round" filter="${stage === 4 ? "url(#soft-glow)" : "none"}">
    <path d="M96 47Q83 27 82 17"/><path d="M100 44Q91 21 94 12"/><path d="M104 43Q103 18 107 9"/>
    <path d="M108 43Q116 19 121 12"/><path d="M112 46Q129 26 138 24"/>
    <g fill="${p.accent}" stroke="none"><circle cx="82" cy="16" r="3"/><circle cx="94" cy="11" r="3"/><circle cx="107" cy="8" r="3.2"/><circle cx="122" cy="11" r="3"/><circle cx="139" cy="23" r="3"/></g>
  </g>`;
}

function body(p, stage) {
  if (stage === 1) return `<g transform="translate(0 5)">
    <path d="M100 91Q85 100 87 123Q89 140 102 151L111 151Q123 138 122 121Q120 101 108 91Z" fill="url(#body)" stroke="${p.bodyDark}" stroke-width="1.6"/>
    <path d="M103 96Q94 112 99 139M108 96Q117 113 111 140" fill="none" stroke="${p.bodyLight}" stroke-width="2" opacity=".7"/>
    <path d="M98 95Q89 87 85 97L91 116 100 110M111 95Q120 87 124 97L118 116 109 110" fill="url(#feather)" stroke="${p.bodyDark}" stroke-width="1.4"/>
    <path d="M101 145 98 157M112 145 115 157M98 157l-5 3m5-3 4 3m13-3 5 3m-5-3-4 3" fill="none" stroke="${p.accent}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M96 71Q97 59 106 58Q115 59 116 71L113 91Q106 98 99 91Z" fill="url(#body)" stroke="${p.bodyDark}" stroke-width="1.4"/>
    <ellipse cx="106" cy="63" rx="11" ry="12" fill="url(#body)" stroke="${p.bodyDark}" stroke-width="1.3"/>
    <circle cx="102" cy="62" r="1.7" fill="#173943"/><circle cx="110" cy="62" r="1.7" fill="#173943"/>
    <path d="M105 67l7 2-7 3Z" fill="${p.accent}"/>
    ${crest(p, stage)}
  </g>`;
  return `<g>
    <path d="M101 86Q82 97 84 124Q86 148 102 164L113 164Q130 144 128 120Q126 96 109 86Z" fill="url(#body)" stroke="${p.bodyDark}" stroke-width="2"/>
    <path d="M102 94Q92 116 99 151M109 94Q121 117 113 151" fill="none" stroke="${p.bodyLight}" stroke-width="2.5" opacity=".76"/>
    <path d="M98 94Q85 82 76 96L83 126 101 115M112 94Q125 82 134 96L127 126 109 115" fill="url(#feather)" stroke="${p.bodyDark}" stroke-width="2"/>
    <path d="M88 99 98 118M91 108l8 12M124 99l-10 19M121 108l-8 12" fill="none" stroke="${p.bodyLight}" stroke-width="1.8" opacity=".8"/>
    <path d="M103 157 99 174M114 157 118 174M99 174l-7 4m7-4 5 4m14-4 7 4m-7-4-5 4" fill="none" stroke="${p.accent}" stroke-width="2.7" stroke-linecap="round"/>
    <path d="M97 70Q98 53 107 53Q117 54 119 70L115 94Q108 101 100 94Z" fill="url(#body)" stroke="${p.bodyDark}" stroke-width="1.8"/>
    <ellipse cx="108" cy="62" rx="12" ry="13.5" fill="url(#body)" stroke="${p.bodyDark}" stroke-width="1.7"/>
    <circle cx="103.5" cy="61.5" r="2" fill="#102f3e"/><circle cx="112.5" cy="61.5" r="2" fill="#102f3e"/>
    <circle cx="104.2" cy="60.8" r=".65" fill="#fff"/><circle cx="113.2" cy="60.8" r=".65" fill="#fff"/>
    <path d="M108 66l8 2.5-8 3Z" fill="${p.accent}"/>
    ${crest(p, stage)}
  </g>`;
}

const stages = {
  1: (p) => `
    <circle cx="105" cy="108" r="57" fill="url(#halo)" opacity=".38"/>
    <g fill="none" stroke="${p.tail}" stroke-width="5" stroke-linecap="round">
      <path d="M109 143Q127 130 135 118"/><path d="M107 146Q111 130 110 121"/><path d="M104 145Q91 135 84 127"/>
    </g>
    ${eyeFeather(135, 117, .53, p)}${eyeFeather(110, 120, .47, p)}${eyeFeather(84, 126, .45, p)}
    ${body(p, 1)}
  `,
  2: (p) => `
    <circle cx="106" cy="103" r="70" fill="url(#halo)" opacity=".45"/>
    <g fill="none" stroke="url(#feather)" stroke-linecap="round">
      <path d="M111 151Q143 135 160 111" stroke-width="8"/><path d="M109 151Q130 124 135 91" stroke-width="7"/>
      <path d="M105 151Q109 124 105 86" stroke-width="7"/><path d="M102 151Q82 128 71 104" stroke-width="7"/>
      <path d="M101 151Q69 145 48 128" stroke-width="8"/>
    </g>
    ${eyeFeather(160, 110, .7, p)}${eyeFeather(135, 90, .7, p)}${eyeFeather(105, 85, .7, p)}${eyeFeather(71, 103, .7, p)}${eyeFeather(48, 127, .7, p)}
    ${body(p, 2)}
  `,
  3: (p) => `
    <circle cx="106" cy="101" r="81" fill="url(#halo)" opacity=".52"/>
    <g fill="url(#feather)" stroke="${p.bodyDark}" stroke-width="1.2">
      <path d="M110 151Q151 131 174 93Q162 137 113 161Z"/>
      <path d="M108 150Q146 112 155 66Q159 118 113 161Z"/>
      <path d="M106 149Q126 107 127 48Q142 108 112 160Z"/>
      <path d="M103 149Q105 102 91 44Q119 102 110 160Z"/>
      <path d="M101 150Q82 111 60 65Q94 103 108 160Z"/>
      <path d="M100 151Q65 131 38 98Q80 118 107 162Z"/>
      <path d="M99 153Q72 150 49 137Q82 139 105 163Z"/>
    </g>
    <g fill="none" stroke="${p.bodyLight}" stroke-width="1.7" opacity=".85">
      <path d="M110 153Q151 122 168 100"/><path d="M108 153Q141 111 151 74"/><path d="M106 153Q122 100 125 57"/>
      <path d="M103 153Q101 101 94 53"/><path d="M101 153Q81 110 64 73"/><path d="M99 154Q67 130 43 104"/>
    </g>
    ${eyeFeather(168, 99, .9, p)}${eyeFeather(151, 72, .88, p)}${eyeFeather(125, 55, .86, p)}${eyeFeather(93, 51, .86, p)}${eyeFeather(62, 69, .88, p)}${eyeFeather(40, 99, .9, p)}${eyeFeather(50, 137, .78, p)}
    ${body(p, 3)}
  `,
  4: (p) => `
    <circle cx="105" cy="100" r="95" fill="url(#halo)" opacity=".68"/>
    <circle cx="105" cy="100" r="78" fill="none" stroke="${p.accent}" stroke-width="1.3" stroke-dasharray="2 7" opacity=".52"/>
    <g fill="url(#feather)" stroke="${p.bodyDark}" stroke-width="1.35">
      <path d="M111 153Q155 132 187 94Q176 143 114 164Z"/>
      <path d="M110 151Q151 116 168 66Q169 124 114 163Z"/>
      <path d="M108 150Q139 102 145 40Q158 111 113 162Z"/>
      <path d="M106 149Q126 98 119 27Q142 100 112 161Z"/>
      <path d="M103 149Q108 96 91 22Q122 95 110 161Z"/>
      <path d="M101 150Q87 101 64 35Q99 93 108 162Z"/>
      <path d="M100 151Q76 112 42 59Q84 99 107 163Z"/>
      <path d="M99 153Q70 131 26 96Q75 116 106 164Z"/>
      <path d="M98 155Q67 150 33 132Q76 137 105 165Z"/>
    </g>
    <g fill="none" stroke="${p.bodyLight}" stroke-width="1.8" opacity=".92">
      <path d="M111 155Q160 126 181 102"/><path d="M110 154Q151 111 164 72"/><path d="M108 153Q136 99 142 47"/>
      <path d="M106 153Q122 93 117 34"/><path d="M103 153Q105 90 93 30"/><path d="M101 154Q84 98 66 42"/>
      <path d="M100 155Q73 109 46 66"/><path d="M98 156Q65 127 32 101"/>
    </g>
    ${eyeFeather(182, 99, 1.02, p)}${eyeFeather(164, 68, 1, p)}${eyeFeather(142, 42, .98, p)}${eyeFeather(118, 29, .98, p)}${eyeFeather(90, 24, .98, p)}${eyeFeather(63, 37, .98, p)}${eyeFeather(41, 61, 1, p)}${eyeFeather(25, 96, 1.02, p)}${eyeFeather(33, 132, .95, p)}
    <g fill="${p.accent}" opacity=".9"><circle cx="28" cy="46" r="2"/><circle cx="178" cy="48" r="1.7"/><circle cx="35" cy="157" r="1.8"/><circle cx="173" cy="147" r="2"/></g>
    ${body(p, 4)}
  `,
};

export function renderPeacockStageSvg(stage) {
  const render = stages[stage];
  if (!render) throw new Error(`Unknown Khong Tuoc stage: ${stage}`);
  const p = palettes[stage];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 190" width="210" height="190">${defs(p, stage)}${render(p)}</svg>`;
}
