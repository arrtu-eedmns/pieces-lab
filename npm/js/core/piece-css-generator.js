/* @arrtu/pieces — core/piece-css-generator
   Motor de tokens: gera classes de cor, alpha e blur sob demanda.
   Padrão de classe:
     background-color-auto-08   → lightness calculada pelo tema
     piece-background-alpha-06  → alpha de 0 a 1 em passos de 4%
     piece-blur-04              → blur em passos de 2px
*/

let style = document.querySelector('#dynamic-styles');
if (!style) {
    style = document.createElement('style');
    style.id = 'dynamic-styles';
    document.head.appendChild(style);
}

const generated = new Set();

function generatePieces(theme) {
    return [
        `&.property-color-${theme}-000`,
        `&.property-color-${theme}-000-hover:hover`,
        `&:hover>.piece-parent.property-color-${theme}-000-hover`,
        `&.piece-actived.property-color-${theme}-000-active`,
        `&.piece-actived.property-color-${theme}-000-hover-active:hover`,
        `&.property-color-${theme}-000-active:has(.piece-controller:checked)`,
        `&.property-color-${theme}-000-active:has(input[type="text"].piece-controller:focus)`,
        `&:has(.piece-controller:checked)>.piece-parent.property-color-${theme}-000-active`,
        `&:has(.piece-controller:checked):hover>.piece-parent.property-color-${theme}-000-hover`,
        `&:has(.piece-controller:checked):hover>.piece-parent.property-color-${theme}-000-hover-active`,
        `&.property-color-${theme}-000-hover-active:has(.piece-controller:checked):hover`,
        `&.piece-actived>.piece-parent.property-color-${theme}-000-active`,
        `&.piece-actived>.piece-parent.property-color-${theme}-000-hover-active:hover`,
        `.piece-loading-controller .property-color-${theme}-000-loading`
    ];
}

const themes = {
    auto:    generatePieces('auto'),
    inverse: generatePieces('inverse'),
    light:   generatePieces('light'),
    dark:    generatePieces('dark')
};

function generateAlphaPieces(property) {
    return [
        `&.piece-${property}-alpha-000`,
        `&.piece-${property}-alpha-000-hover:hover`,
        `&:hover>.piece-parent.piece-${property}-alpha-000-hover`,
        `&.piece-actived.piece-${property}-alpha-000-active`,
        `&.piece-actived.piece-${property}-alpha-000-hover-active:hover`,
        `&.piece-${property}-alpha-000-active:has(.piece-controller:checked)`,
        `&.piece-${property}-alpha-000-active:has(input[type="text"].piece-controller:focus)`,
        `&:has(.piece-controller:checked)>.piece-parent.piece-${property}-alpha-000-active`,
        `&:has(.piece-controller:checked):hover>.piece-parent.piece-${property}-alpha-000-hover`,
        `&:has(.piece-controller:checked):hover>.piece-parent.piece-${property}-alpha-000-hover-active`,
        `&.piece-${property}-alpha-000-hover-active:has(.piece-controller:checked):hover`,
        `&.piece-actived>.piece-parent.piece-${property}-alpha-000-active`,
        `&.piece-actived>.piece-parent.piece-${property}-alpha-000-hover-active:hover`,
        `.piece-loading-controller .piece-${property}-alpha-000-loading`
    ];
}

function generateBlurPieces() {
    return [
        `&.piece-blur-000`,
        `&.piece-blur-000-hover:hover`,
        `&:hover>.piece-parent.piece-blur-000-hover`,
        `&.piece-actived.piece-blur-000-active`,
        `&.piece-actived.piece-blur-000-hover-active:hover`,
        `&.piece-blur-000-active:has(.piece-controller:checked)`,
        `&.piece-blur-000-active:has(input[type="text"].piece-controller:focus)`,
        `&:has(.piece-controller:checked)>.piece-parent.piece-blur-000-active`,
        `&:has(.piece-controller:checked):hover>.piece-parent.piece-blur-000-hover`,
        `&:has(.piece-controller:checked):hover>.piece-parent.piece-blur-000-hover-active`,
        `&.piece-blur-000-hover-active:has(.piece-controller:checked):hover`,
        `&.piece-actived>.piece-parent.piece-blur-000-active`,
        `&.piece-actived>.piece-parent.piece-blur-000-hover-active:hover`,
        `.piece-loading-controller .piece-blur-000-loading`
    ];
}

const blurSelectors = generateBlurPieces();

const properties = new Set([
    'background', 'text', 'border', 'box-shadow', 'ripple',
    'scrollbar-track-outline', 'scrollbar-thumb-background', 'scrollbar-thumb-border'
]);

const alphaProperties = new Map([
    ['background',                 '--piece-background-a'],
    ['text',                       '--piece-text-a'],
    ['border',                     '--piece-border-a'],
    ['box-shadow',                 '--piece-box-shadow-a'],
    ['ripple',                     '--piece-ripple-a'],
    ['scrollbar-track-outline',    '--piece-scrollbar-track-outline-a'],
    ['scrollbar-thumb-background', '--piece-scrollbar-thumb-background-a'],
    ['scrollbar-thumb-border',     '--piece-scrollbar-thumb-border-a'],
]);

const CLASS_REGEX =
    /^(?<property>background|text|border|box-shadow|ripple|scrollbar-[\w-]+)-color-(?<theme>auto|light|dark|inverse)-(?<token>[\w-]+)$/;
const ALPHA_REGEX =
    /^piece-(?<property>background|text|border|box-shadow|ripple|scrollbar-track-outline|scrollbar-thumb-background|scrollbar-thumb-border)-alpha-(?<token>\d{2})(?:-(?<suffix>hover|active|hover-active|loading))?$/;
const BLUR_REGEX =
    /^piece-blur-(?<token>\d{2})(?:-(?<suffix>hover|active|hover-active|loading))?$/;

function buildSurfaceBlock(property, selectorGroup, valueRule) {
    return `.piece-surface { ${selectorGroup.join(', ').replaceAll('property', property)} { ${valueRule} } }\n`;
}
function buildGenericBlock(selectorGroup, valueRule) {
    return `.piece-surface { ${selectorGroup.join(', ')} { ${valueRule} } }\n`;
}

function resolveColorValue(property, theme, token) {
    if (!/^\d+$/.test(token)) {
        return `--piece-${property}-color-h: var(--${token});`;
    }
    const value = Number(token) * 4;
    if (theme === 'auto')     return `--piece-${property}-color: calc(var(--piece-theme) var(--piece-theme-operator) ${value}%);`;
    if (theme === 'inverse')  return `--piece-${property}-color: calc(var(--piece-theme-inverse) var(--piece-theme-operator-inverse) ${value}%);`;
    if (theme === 'light')    return `--piece-${property}-color: ${100 - value}%;`;
    if (theme === 'dark')     return `--piece-${property}-color: ${value}%;`;
    return '';
}

function resolveAlphaValue(property, token) {
    const cssVar = alphaProperties.get(property);
    const value  = (Number(token) * 4 / 100).toFixed(2);
    return `${cssVar}: ${value};`;
}

function resolveBlurValue(token) {
    const value = Number(token) * 2;
    return `--piece-blur: ${value}px; backdrop-filter: blur(${value}px); -webkit-backdrop-filter: blur(${value}px);`;
}

function ensureColorCSS(property, theme, token) {
    const key = `color|${property}|${theme}|${token}`;
    if (generated.has(key)) return;
    generated.add(key);
    const selectors = themes[theme].map(sel => sel.replaceAll('000', token));
    style.textContent += buildSurfaceBlock(property, selectors, resolveColorValue(property, theme, token));
}

function ensureAlphaCSS(property, token) {
    const key = `alpha|${property}|${token}`;
    if (generated.has(key)) return;
    generated.add(key);
    const selectors = generateAlphaPieces(property).map(sel => sel.replaceAll('000', token));
    style.textContent += buildGenericBlock(selectors, resolveAlphaValue(property, token));
}

function ensureBlurCSS(token) {
    const key = `blur|${token}`;
    if (generated.has(key)) return;
    generated.add(key);
    const selectors = blurSelectors.map(sel => sel.replaceAll('000', token));
    style.textContent += buildGenericBlock(selectors, resolveBlurValue(token));
}

function scanElement(el) {
    if (!el || !el.classList) return;
    el.classList.forEach(cls => {
        const colorMatch = cls.match(CLASS_REGEX);
        if (colorMatch) {
            const { property, theme, token } = colorMatch.groups;
            if (properties.has(property)) ensureColorCSS(property, theme, token.split('-')[0]);
            return;
        }
        const alphaMatch = cls.match(ALPHA_REGEX);
        if (alphaMatch) {
            const { property, token } = alphaMatch.groups;
            if (alphaProperties.has(property)) ensureAlphaCSS(property, token);
            return;
        }
        const blurMatch = cls.match(BLUR_REGEX);
        if (blurMatch) ensureBlurCSS(blurMatch.groups.token);
    });
}

function setupObserver() {
    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.type === 'attributes' && m.attributeName === 'class') scanElement(m.target);
            if (m.type === 'childList') {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        scanElement(node);
                        node.querySelectorAll?.('*').forEach(scanElement);
                    }
                });
            }
        }
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
}

// Inicia o observer imediatamente — document.documentElement existe antes do body
setupObserver();

// Full scan como segurança para elementos já no DOM antes do script carregar
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('*').forEach(scanElement);
});

// Remove placeholder dos ícones quando Material Symbols carregar
document.fonts.load('1em "Material Symbols Rounded"').then(() => {
    document.documentElement.classList.add('icons-loaded');
});
