export type ColorThemeId = 'pastel' | 'midnight' | 'blossom';

export type ColorThemeOption = {
  id: ColorThemeId;
  label: string;
  swatch: string;
};

export const COLOR_THEME_OPTIONS: ColorThemeOption[] = [
  { id: 'pastel', label: 'Pastel', swatch: '#FFE2F8' },
  { id: 'midnight', label: 'Midnight', swatch: '#2A2628' },
  { id: 'blossom', label: 'Blossom', swatch: '#FF9ADA' },
];
