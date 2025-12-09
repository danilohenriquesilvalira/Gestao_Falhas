/**
 * Tipos relacionados aos esquemas de cores da EDP
 */

export type EsquemaCorEDP = {
  nome: string;
  fundo: string;
  texto: string;
  icone: string;
  borda?: string;
  hover?: string;
  descricao: string;
};

export type NomeEsquemaCor = 
  | 'marinePrimary'
  | 'electricPrimary'
  | 'violetAccent'
  | 'slateNeutral'
  | 'whiteElectric'
  | 'whiteMarine'
  | 'spruceNatural'
  | 'seaweedNatural'
  | 'cobaltAccent'
  | 'semanticError'
  | 'semanticErrorLight'
  | 'semanticWarning'
  | 'semanticWarningLight'
  | 'semanticSuccess'
  | 'semanticInfo';
