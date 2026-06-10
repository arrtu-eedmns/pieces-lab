/* @arrtu/pieces — core/toggle
   Alterna .piece-actived em elementos .piece-toggle.
   - Dentro de .piece-group          → single-select (exclusivo)
   - Dentro de .piece-group.piece-multi → multi-select (independente)
   - Sem .piece-group                → toggle livre
*/
document.addEventListener('click', e => {
    const el = e.target.closest('.piece-toggle');
    if (!el) return;

    const group = el.closest('.piece-group');

    if (group) {
        if (group.classList.contains('piece-multi')) {
            el.classList.toggle('piece-actived');
        } else {
            group.querySelectorAll('.piece-toggle').forEach(btn => btn.classList.remove('piece-actived'));
            el.classList.add('piece-actived');
        }
    } else {
        el.classList.toggle('piece-actived');
    }
});
