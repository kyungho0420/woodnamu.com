document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.manual-nav a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.manual-nav a[href="#${id}"]`);

                let current = activeLink;
                const linksToActivate = [current];

                let parentUl = current ? current.closest('ul') : null;
                while(parentUl && parentUl.parentElement.tagName === 'LI') {
                    const parentLi = parentUl.parentElement;
                    const parentLink = parentLi.querySelector('a');
                        if(parentLink) {
                        linksToActivate.push(parentLink);
                        }
                        parentUl = parentLi.closest('ul');
                }

                navLinks.forEach(l => l.classList.remove('active'));
                linksToActivate.forEach(l => l && l.classList.add('active'));
            }
        });
    }, { rootMargin: "-40% 0px -60% 0px", threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });

    document.querySelectorAll('.manual-nav a').forEach(mainLink => {
        mainLink.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});