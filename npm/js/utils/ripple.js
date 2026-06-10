/* @arrtu/pieces — utils/ripple
   Efeito ripple granulado em componentes com .piece-ripple.
   Requer: css/utils/ripple.css
*/
document.addEventListener('click', ({ target, clientX, clientY }) => {
    Array.from(target.children).forEach(child => {
        if (!child.classList.contains('piece-ripple')) return;

        const rect   = target.getBoundingClientRect();
        const x      = clientX - rect.left;
        const y      = clientY - rect.top;
        const maxX   = Math.max(x, rect.width  - x);
        const maxY   = Math.max(y, rect.height - y);
        const radius = Math.sqrt(maxX ** 2 + maxY ** 2);

        const effect = document.createElement('span');
        effect.className = 'piece-ripple-effect';
        effect.style.left = `${x}px`;
        effect.style.top  = `${y}px`;
        effect.style.setProperty('--ripple-size', `${radius * 2}px`);

        child.appendChild(effect);
        void effect.offsetWidth;
        effect.classList.add('animate');
        effect.addEventListener('animationend', () => effect.remove());
    });
});
