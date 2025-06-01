// Funcionalidades interactivas para Epistemial - Versión corregida
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las funcionalidades de forma segura
    try {
        initMobileMenu();
        initSmoothScrolling();
        initScrollAnimations();
        initHeaderScroll();
        initFormHandling();
        init3DCubes();
        enhanceUserExperience();
    } catch (error) {
        console.warn('Error durante la inicialización:', error);
    }
});

// Funcionalidad del menú móvil
function initMobileMenu() {
    const toggle = document.querySelector('.nav__toggle');
    const menu = document.querySelector('.nav__menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            menu.classList.toggle('nav__menu--open');
            toggle.classList.toggle('nav__toggle--active');
            
            // Accessibility: update ARIA attributes
            const isExpanded = menu.classList.contains('nav__menu--open');
            toggle.setAttribute('aria-expanded', isExpanded.toString());
        });

        // Cerrar menú al hacer clic en enlaces
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menu.classList.remove('nav__menu--open');
                toggle.classList.remove('nav__toggle--active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Añadir soporte para teclado
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menu.classList.contains('nav__menu--open')) {
                menu.classList.remove('nav__menu--open');
                toggle.classList.remove('nav__toggle--active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Inicializar atributos ARIA
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'nav-menu');
        if (!menu.id) {
            menu.id = 'nav-menu';
        }
    }
}

// Desplazamiento suave mejorado para enlaces de navegación
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignorar enlaces vacíos o sin hash válido
            if (!href || href === '#' || href.length <= 1) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const targetId = href;
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                // Usar scrollTo nativo con fallback
                try {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } catch (error) {
                    // Fallback para navegadores que no soportan smooth scrolling
                    window.scrollTo(0, targetPosition);
                }
            }
        });
    });
}

// Animaciones al hacer scroll - versión más robusta
function initScrollAnimations() {
    // Verificar soporte para IntersectionObserver
    if (!window.IntersectionObserver) {
        // Fallback: mostrar todos los elementos inmediatamente
        const elementsToShow = document.querySelectorAll('.animate-on-scroll');
        elementsToShow.forEach(element => {
            element.classList.add('animated');
        });
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                // Una vez animado, no necesitamos seguir observando
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elementos a animar con verificación de existencia
    const elementsToAnimate = [
        '.section-header',
        '.service-card',
        '.advantage-card',
        '.highlight',
        '.contact__item',
        '.contact__form',
        '.about__text h3',
        '.about__text p',
        '.stats-card'
    ];

    elementsToAnimate.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            if (element) {
                element.classList.add('animate-on-scroll');
                element.style.animationDelay = `${Math.min(index * 0.1, 1)}s`;
                observer.observe(element);
            }
        });
    });
}

// Efecto de scroll para el encabezado - con debounce
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let ticking = false;
    
    function updateHeader() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollY > 50) {
            header.style.boxShadow = 'var(--shadow-md)';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = 'none';
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.97)';
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

// Manejo del formulario de contacto
function initFormHandling() {
    const form = document.querySelector('.form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const formData = new FormData(form);
            const name = formData.get('name')?.trim();
            const email = formData.get('email')?.trim();
            const company = formData.get('company')?.trim();
            const message = formData.get('message')?.trim();
            
            // Validar campos básicos
            if (!name || !email || !message) {
                showNotification('Por favor completa todos los campos requeridos.', 'error');
                return;
            }
            
            // Validación básica de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Por favor introduce un email válido.', 'error');
                return;
            }
            
            // Crear enlace mailto
            const subject = `Consulta de ${company || ''} - ${name}`;
            const body = `Nombre: ${name}\nEmpresa: ${company || 'No especificada'}\nEmail: ${email}\n\nMensaje:\n${message}`;
            const mailtoLink = `mailto:info@epistemial.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            try {
                // Abrir cliente de email
                window.location.href = mailtoLink;
                
                // Mostrar mensaje de éxito
                showNotification('¡Gracias! Tu mensaje ha sido preparado. Se abrirá tu cliente de email.', 'success');
                
                // Reiniciar formulario después de un breve delay
                setTimeout(() => {
                    form.reset();
                }, 1000);
                
            } catch (error) {
                showNotification('Hubo un problema al abrir el cliente de email. Por favor, contacta directamente a info@epistemial.com', 'error');
            }
        });
        
        // Mejorar la experiencia de los campos del formulario
        const formInputs = form.querySelectorAll('.form-control');
        formInputs.forEach(input => {
            // Validación en tiempo real
            input.addEventListener('input', function() {
                this.classList.remove('form-control--error');
                
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.classList.add('form-control--error');
                } else if (this.type === 'email' && this.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(this.value.trim())) {
                        this.classList.add('form-control--error');
                    }
                }
            });
        });
    }
}

// Inicializar efectos 3D para los cubos - versión más estable
function init3DCubes() {
    const cubes = document.querySelectorAll('.cube');
    
    cubes.forEach(cube => {
        const container = cube.parentElement;
        if (!container) return;
        
        let isHovering = false;
        
        container.addEventListener('mouseenter', function() {
            isHovering = true;
            cube.style.animationPlayState = 'paused';
        });
        
        container.addEventListener('mouseleave', function() {
            isHovering = false;
            cube.style.transform = '';
            cube.style.animationPlayState = 'running';
        });
        
        container.addEventListener('mousemove', function(e) {
            if (!isHovering) return;
            
            const containerRect = container.getBoundingClientRect();
            const x = ((e.clientX - containerRect.left) / containerRect.width) - 0.5;
            const y = ((e.clientY - containerRect.top) / containerRect.height) - 0.5;
            
            const maxRotation = 15;
            cube.style.transform = `rotateY(${x * maxRotation}deg) rotateX(${-y * maxRotation}deg)`;
        });
    });
}

// Mejorar la experiencia de usuario general
function enhanceUserExperience() {
    // Asegurar que el gradiente del texto se aplique correctamente
    fixTextGradients();
    
    // Añadir efectos hover a las tarjetas
    addCardHoverEffects();
    
    // Añadir indicador de scroll en hero
    addScrollIndicator();
    
    // Optimizar para dispositivos con menos potencia
    optimizeForPerformance();
}

function fixTextGradients() {
    const gradientTexts = document.querySelectorAll('.text-gradient');
    
    gradientTexts.forEach(text => {
        // Aplicar estilos de gradiente de manera más robusta
        const styles = {
            'background': 'linear-gradient(90deg, #1A456E 0%, #88B0DC 100%)',
            'background-clip': 'text',
            '-webkit-background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
            'color': '#1A456E', // Fallback
            'display': 'inline-block'
        };
        
        Object.entries(styles).forEach(([property, value]) => {
            text.style.setProperty(property, value, 'important');
        });
    });
    
    // Verificación adicional después de un breve delay
    setTimeout(() => {
        gradientTexts.forEach(text => {
            const computedStyle = getComputedStyle(text);
            
            // Si el gradiente no se aplicó correctamente, usar color sólido
            if (!computedStyle.backgroundImage.includes('linear-gradient')) {
                text.style.setProperty('color', '#1A456E', 'important');
                text.style.setProperty('-webkit-text-fill-color', 'unset', 'important');
            }
        });
    }, 500);
}

function addCardHoverEffects() {
    const cards = document.querySelectorAll('.service-card, .advantage-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

function addScrollIndicator() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const scrollIndicator = document.createElement('div');
    scrollIndicator.innerHTML = `
        <div style="
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: bounce 2s infinite;
            cursor: pointer;
            z-index: 15;
            color: #1A456E;
            font-size: 14px;
            font-weight: 500;
            pointer-events: auto;
        ">
            <div style="margin-bottom: 8px;">Descubre más</div>
            <div style="animation: bounceArrow 1.5s infinite;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M12 20L18 14M12 20L6 14" stroke="#1A456E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>
    `;
    
    hero.appendChild(scrollIndicator);
    
    // Añadir estilos para la animación
    if (!document.getElementById('scroll-animations')) {
        const style = document.createElement('style');
        style.id = 'scroll-animations';
        style.textContent = `
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
                40% { transform: translateY(-8px) translateX(-50%); }
                60% { transform: translateY(-4px) translateX(-50%); }
            }
            @keyframes bounceArrow {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(4px); }
                60% { transform: translateY(2px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    scrollIndicator.addEventListener('click', function() {
        const nextSection = document.querySelector('#nosotros');
        if (nextSection) {
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = nextSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
}

function optimizeForPerformance() {
    // Reducir la frecuencia de animaciones en dispositivos de menor potencia
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (reducedMotion) {
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(element => {
            element.style.animation = 'none';
        });
    }
    
    // Pausar animaciones cuando la página no está visible
    document.addEventListener('visibilitychange', function() {
        const cubes = document.querySelectorAll('.cube');
        cubes.forEach(cube => {
            if (document.hidden) {
                cube.style.animationPlayState = 'paused';
            } else {
                cube.style.animationPlayState = 'running';
            }
        });
    });
}

// Sistema de notificaciones mejorado
function showNotification(message, type = 'info') {
    // Eliminar notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    // Establecer color según tipo
    let backgroundColor, color;
    switch (type) {
        case 'success':
            backgroundColor = '#1A456E';
            color = 'white';
            break;
        case 'error':
            backgroundColor = '#D83030';
            color = 'white';
            break;
        default:
            backgroundColor = '#88B0DC';
            color = '#1A456E';
    }
    
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${backgroundColor};
            color: ${color};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: var(--font-family-body);
            display: flex;
            align-items: center;
            justify-content: space-between;
        ">
            <span>${message}</span>
            <button style="
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
                margin-left: 12px;
                padding: 0;
                line-height: 1;
            " aria-label="Cerrar notificación">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    const notificationElement = notification.firstElementChild;
    const closeButton = notificationElement.querySelector('button');
    
    // Animar entrada
    setTimeout(() => {
        notificationElement.style.transform = 'translateX(0)';
    }, 100);
    
    // Funcionalidad del botón de cierre
    closeButton.addEventListener('click', () => {
        notificationElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notificationElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Asegurar que la página esté completamente cargada antes de ejecutar scripts pesados
window.addEventListener('load', function() {
    // Retrasar la inicialización de efectos no críticos
    setTimeout(() => {
        init3DCubes();
    }, 1000);
});