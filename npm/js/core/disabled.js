/* @arrtu/pieces — core/disabled
   Bloqueia interação em elementos com .piece-disabled.
   — click (captura): impede propagação e default
   — mousedown (captura): cancela :active do CSS antes de disparar
*/
document.addEventListener('click', e => {
    if (e.target.closest('.piece-disabled')) {
        e.stopPropagation();
        e.preventDefault();
    }
}, true);

document.addEventListener('mousedown', e => {
    if (e.target.closest('.piece-disabled')) {
        e.preventDefault();
    }
}, true);
