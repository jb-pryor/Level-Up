export const referenceShirtIds = ['tie-dye-tee', 'neon-trip-tee', 'pixel-knit-sweater', 'cream-cable-sweater', 'olive-stripe-sweater', 'plaid-flannel', 'scarlet-sweatshirt', 'built-different-tee', 'unique-panda-tee', 'metallica-tee', 'green-skull-tee', 'worldwide-tee', 'cartoon-chaos-tee', 'cloudscape-tee', 'take-it-slow-tee', 'pacman-planets-tee'] as const;
export type ReferenceShirtId = typeof referenceShirtIds[number];

export const redoneMaleShirts: Record<string,{file:string;viewBox:string}> = {
  'pacman-planets-tee': {file:'pacmanplanets.png',viewBox:'52 71 1132 1095'},
  'built-different-tee': {file:'builtDiff.png',viewBox:'51 68 1132 1098'},
  'unique-panda-tee': {file:'uniquePanda.png',viewBox:'52 70 1131 1096'},
  'metallica-tee': {file:'metallica.png',viewBox:'53 71 1129 1095'},
  'green-skull-tee': {file:'greenSkull.png',viewBox:'54 71 1130 1096'},
  'worldwide-tee': {file:'mrWorldwide.png',viewBox:'52 70 1130 1096'},
  'cartoon-chaos-tee': {file:'randoCartoon.png',viewBox:'47 70 1143 1141'},
  'cloudscape-tee': {file:'Base2.png',viewBox:'51 71 1137 1119'},
  'take-it-slow-tee': {file:'takeItSlowTurtle.png',viewBox:'54 70 1128 1096'},
  'tie-dye-tee': {file:'tyedye.png',viewBox:'52 69 1130 1097'},
  'neon-trip-tee': {file:'hallucigenix.png',viewBox:'42 65 1155 1150'},
};

export const redoneFemaleShirts: Record<string,{file:string;viewBox:string}> = {
  'neon-trip-tee': {file:'blueHallucigenicFemale.png',viewBox:'13 102 1120 1186'},
  'unique-panda-tee': {file:'uniquePandaFemale.png',viewBox:'20 105 1106 1183'},
  'cartoon-chaos-tee': {file:'cartoonRandomFemale.png',viewBox:'43 137 1061 1152'},
  'pacman-planets-tee': {file:'pacManPlanetFemale.png',viewBox:'42 116 1061 1142'},
  'worldwide-tee': {file:'mrWorldwideFemale.png',viewBox:'44 138 1057 1128'},
  'built-different-tee': {file:'buildDiffFemale.png',viewBox:'39 113 1067 1148'},
  'cloudscape-tee': {file:'cloudySkyFemale.png',viewBox:'39 135 1070 1137'},
  'tie-dye-tee': {file:'tyeDyeFemale.png',viewBox:'40 134 1071 1136'},
  'metallica-tee': {file:'metallicaFemale.png',viewBox:'44 137 1058 1129'},
};

export function referenceShirtPath(id: string, gender: 'male' | 'female') {
  if(gender==='female'&&redoneFemaleShirts[id])return `/avatars/shirts/reference-collection-female/${redoneFemaleShirts[id].file}`;
  if(gender==='male'&&redoneMaleShirts[id])return `/avatars/shirts/reference-collection-redone/${redoneMaleShirts[id].file}`;
  if(redoneMaleShirts[id]&&id!=='tie-dye-tee'&&id!=='neon-trip-tee')return null;
  return referenceShirtIds.includes(id as ReferenceShirtId)
    ? `/avatars/shirts/reference-collection/${gender}-${id}.png`
    : null;
}
