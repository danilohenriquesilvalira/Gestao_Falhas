/**
 * Constantes - Esquemas de Cores EDP
 * 
 * Baseado no EDP Brand Guidelines March 2023
 * Define todas as combinações de cores aprovadas pela marca
 */

import type { EsquemaCorEDP, NomeEsquemaCor } from '../tipos';

/**
 * COMBINAÇÕES APROVADAS PELA EDP
 * Seguindo a Iconography on colour (Brand Guidelines March 2023)
 * 
 * REGRAS IMPORTANTES:
 * - Marine Blue (fundo escuro) → sempre com Electric Green (ícones/destaque)
 * - Electric Green (fundo claro) → sempre com Marine Blue (texto/ícones escuros)
 * - Violet Purple (fundo escuro) → sempre com Electric Green
 * - Cobalt Blue (fundo escuro) → sempre com Electric Green
 * - Slate Grey (fundo médio) → sempre com White (texto) e Electric Green opcional
 * - White (fundo) → pode usar Marine, Electric Green ou Cobalt
 */
export const ESQUEMAS_COR_EDP: Record<NomeEsquemaCor, EsquemaCorEDP> = {
  // PRINCIPAL - Marine Blue com Electric Green (MAIS USADO)
  marinePrimary: {
    nome: 'Marine Primary',
    fundo: 'bg-edp-marine',
    texto: 'text-white',
    icone: 'text-edp-electric',
    borda: 'border-edp-electric',
    hover: 'hover:bg-edp-marine-100',
    descricao: 'Combinação principal - Marine Blue + Electric Green icons'
  },

  // Electric Green com Marine Blue (CORRETO!)
  electricPrimary: {
    nome: 'Electric Primary',
    fundo: 'bg-edp-electric',
    texto: 'text-edp-marine',
    icone: 'text-edp-marine',
    borda: 'border-edp-marine',
    hover: 'hover:bg-edp-electric-300',
    descricao: 'Electric Green com Marine Blue (texto e ícones escuros)'
  },

  // Violet Purple com Electric Green (CORRETO!)
  violetAccent: {
    nome: 'Violet Accent',
    fundo: 'bg-edp-violet',
    texto: 'text-white',
    icone: 'text-edp-electric',
    borda: 'border-edp-electric',
    hover: 'hover:bg-edp-violet-100',
    descricao: 'Violet Purple + Electric Green icons'
  },

  // Slate Grey com White (PADRÃO EDP CORRETO!)
  slateNeutral: {
    nome: 'Slate Neutral',
    fundo: 'bg-edp-slate',
    texto: 'text-white',
    icone: 'text-white',
    borda: 'border-white',
    hover: 'hover:bg-edp-slate-100',
    descricao: 'Slate Grey #7C9599 com White - Padrão neutro EDP'
  },

  // Branco com Electric Green (MUITO USADO - LIMPO)
  whiteElectric: {
    nome: 'White Electric',
    fundo: 'bg-white',
    texto: 'text-edp-marine',
    icone: 'text-edp-electric',
    borda: 'border-edp-electric',
    hover: 'hover:bg-edp-neutral-white-wash',
    descricao: 'Fundo branco + Electric Green icons - Limpo e moderno'
  },

  // Branco com Marine Blue (CORPORATIVO)
  whiteMarine: {
    nome: 'White Marine',
    fundo: 'bg-white',
    texto: 'text-edp-marine',
    icone: 'text-edp-marine',
    borda: 'border-edp-marine',
    hover: 'hover:bg-edp-neutral-white-wash',
    descricao: 'Fundo branco + Marine Blue - Corporativo e elegante'
  },

  // Spruce Green com Electric Green
  spruceNatural: {
    nome: 'Spruce Natural',
    fundo: 'bg-edp-spruce',
    texto: 'text-white',
    icone: 'text-edp-electric',
    borda: 'border-edp-electric',
    hover: 'hover:bg-edp-spruce-100',
    descricao: 'Spruce Green #143F47 + Electric Green'
  },

  // Seaweed Green com Electric Green
  seaweedNatural: {
    nome: 'Seaweed Natural',
    fundo: 'bg-edp-seaweed',
    texto: 'text-white',
    icone: 'text-edp-electric',
    borda: 'border-edp-electric',
    hover: 'hover:bg-edp-seaweed-100',
    descricao: 'Seaweed Green #225E66 + Electric Green'
  },

  // Cobalt Blue com Electric Green (CORRETO!)
  cobaltAccent: {
    nome: 'Cobalt Accent',
    fundo: 'bg-edp-cobalt',
    texto: 'text-white',
    icone: 'text-edp-electric',
    borda: 'border-edp-electric',
    hover: 'hover:bg-edp-cobalt-100',
    descricao: 'Cobalt Blue #263CC8 + Electric Green icons'
  },

  // SEMÂNTICAS - Avisos e Alertas
  semanticError: {
    nome: 'Error',
    fundo: 'bg-edp-semantic-red',
    texto: 'text-white',
    icone: 'text-white',
    borda: 'border-edp-semantic-red',
    hover: 'hover:bg-red-700',
    descricao: 'Erro - Vermelho'
  },

  semanticErrorLight: {
    nome: 'Error Light',
    fundo: 'bg-edp-semantic-light-red',
    texto: 'text-edp-semantic-red',
    icone: 'text-edp-semantic-red',
    borda: 'border-edp-semantic-red',
    hover: 'hover:bg-red-100',
    descricao: 'Erro suave - Vermelho claro'
  },

  semanticWarning: {
    nome: 'Warning',
    fundo: 'bg-edp-semantic-yellow',
    texto: 'text-edp-marine',
    icone: 'text-edp-marine',
    borda: 'border-edp-marine',
    hover: 'hover:bg-yellow-300',
    descricao: 'Aviso - Amarelo'
  },

  semanticWarningLight: {
    nome: 'Warning Light',
    fundo: 'bg-edp-semantic-light-yellow',
    texto: 'text-edp-marine',
    icone: 'text-edp-marine',
    borda: 'border-edp-semantic-yellow',
    hover: 'hover:bg-yellow-100',
    descricao: 'Aviso suave - Amarelo claro'
  },

  semanticSuccess: {
    nome: 'Success',
    fundo: 'bg-edp-semantic-green',
    texto: 'text-white',
    icone: 'text-edp-electric',
    borda: 'border-edp-electric',
    hover: 'hover:bg-edp-seaweed-100',
    descricao: 'Sucesso - Verde Seaweed'
  },

  semanticInfo: {
    nome: 'Info',
    fundo: 'bg-edp-semantic-blue',
    texto: 'text-white',
    icone: 'text-edp-electric',
    borda: 'border-edp-electric',
    hover: 'hover:bg-edp-cobalt-100',
    descricao: 'Informação - Cobalt Blue'
  }
};

/**
 * COMBINAÇÕES PROIBIDAS - NÃO USAR!
 * Baseado nas diretrizes de acessibilidade EDP
 */
export const COMBINACOES_PROIBIDAS = [
  '❌ Violet com texto/ícone preto ou azul escuro',
  '❌ Electric Green com texto/ícone amarelo (baixo contraste)',
  '❌ Ice Blue como fundo principal (não é padrão EDP para backgrounds)',
  '❌ Slate com texto/ícone cinza claro (baixo contraste)',
  '❌ Marine Blue com ícones pretos ou azuis escuros',
  '❌ Fundos claros (Electric, Ice) com texto branco',
] as const;

/**
 * Retorna o esquema de cores por nome
 */
export const obterEsquemaCor = (nomeEsquema: NomeEsquemaCor): EsquemaCorEDP => {
  return ESQUEMAS_COR_EDP[nomeEsquema];
};

/**
 * Retorna todas as combinações disponíveis
 */
export const obterTodosEsquemas = (): EsquemaCorEDP[] => {
  return Object.values(ESQUEMAS_COR_EDP);
};
