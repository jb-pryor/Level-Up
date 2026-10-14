import type { BodyId } from '../types';
export const colors = {
  hair: { brown: '#75442d', black: '#292323', blonde: '#ba8643' },
  eyes: { brown: '#6e431f', blue: '#427ea3', green: '#52805b' },
};
export const avatarPresets: Record<BodyId, { eyes: [number, number, number][]; pants: string; hairTransform: Record<'short-swept' | 'long', string> }> = {
  'base-a': {
    eyes: [[428,228,23],[596,228,23]],
    pants: 'M361 862 Q512 896 662 862 L684 1210 L696 1341 L676 1382 L579 1382 L562 1210 L532 1033 L517 966 L506 966 L484 1100 L458 1240 L449 1382 L344 1382 L331 1340 L343 1110 Z',
    hairTransform: { 'short-swept': 'translate(180 -35) scale(.65)', long: 'translate(-43 -35) scale(1.085)' },
  },
  'base-b': {
    eyes: [[453,260,21],[578,260,21]],
    pants: 'M363 817 Q512 857 660 817 L684 940 L680 1130 L692 1348 L679 1407 L595 1407 L579 1348 L559 1210 L530 1040 L514 934 L505 934 L486 1090 L469 1230 L450 1407 L350 1407 L337 1347 L350 1110 L342 940 Z',
    hairTransform: { 'short-swept': 'translate(222 4) scale(.565)', long: 'translate(0 0)' },
  },
};
