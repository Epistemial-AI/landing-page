// Simple scroll to contact form functionality
const contactLinks = document.querySelectorAll('a[href="#contact"]');
contactLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
    });
});
