const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const themeToggle = document.querySelector(".theme-toggle");
const body = document.body;
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll('a[href^="#"]')) : [];
const sections = navLinks
  .map((link) => {
    const href = link.getAttribute("href");
    const target = href ? document.querySelector(href) : null;
    return target ? { link, target } : null;
  })
  .filter(Boolean);

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const savedTheme = window.localStorage.getItem("portfolio-theme");
if (savedTheme === "light" || savedTheme === "dark") {
  body.dataset.theme = savedTheme;
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = body.dataset.theme === "light" ? "dark" : "light";
    body.dataset.theme = nextTheme;
    window.localStorage.setItem("portfolio-theme", nextTheme);
  });
}

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
};

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = href ? document.querySelector(href) : null;
    if (!target) return;

    event.preventDefault();
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const top = window.scrollY + target.getBoundingClientRect().top - headerHeight - 14;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  });
});

if (sections.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible.length) return;
      setActiveLink(visible[0].target.id);
    },
    {
      rootMargin: "-16% 0px -52% 0px",
      threshold: [0.2, 0.35, 0.5],
    }
  );

  sections.forEach(({ target }) => observer.observe(target));
}

const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

if (revealItems.length && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 5, 4) * 75}ms`;
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const contactForm = document.querySelector(".contact-form");
const cursorGlow = document.querySelector(".cursor-glow");

if (contactForm) {
  const status = contactForm.querySelector(".form-status");
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      if (status) status.textContent = "Please fill out all fields before sending.";
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      if (status) status.textContent = "Please enter a valid email address.";
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${name || "Website visitor"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

    if (status) status.textContent = "Opening your mail app with the message ready to send.";
    window.location.href = `mailto:sushmithabungatavula07@gmail.com?subject=${subject}&body=${body}`;
  });
}

if (cursorGlow && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.opacity = "1";
    cursorGlow.style.transform = `translate(${event.clientX - cursorGlow.offsetWidth / 2}px, ${event.clientY - cursorGlow.offsetHeight / 2}px)`;
  });

  window.addEventListener("pointerleave", () => {
    cursorGlow.style.opacity = "0";
  });
}

const canvas = document.querySelector(".background-canvas");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;
  let pointer = { x: 0, y: 0, active: false };

  const getThemeStyles = () => {
    const computed = getComputedStyle(body);
    return {
      particle: computed.getPropertyValue("--particle").trim() || "rgba(138, 190, 255, 0.42)",
      line: computed.getPropertyValue("--particle-line").trim() || "rgba(108, 167, 255, 0.14)",
    };
  };

  const createParticles = () => {
    const count = Math.max(36, Math.floor((width * height) / 34000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.8 + 0.8,
    }));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    createParticles();
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const themeStyles = getThemeStyles();

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      ctx.beginPath();
      ctx.fillStyle = themeStyles.particle;
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      for (let i = index + 1; i < particles.length; i += 1) {
        const other = particles[i];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 160) {
          const opacity = 1 - distance / 160;
          ctx.beginPath();
          const lineColor = themeStyles.line;
          const alpha = opacity * 0.8;
          ctx.strokeStyle = lineColor.replace(/rgba?\(([^)]+)\)/, (match, values) => {
            const parts = values.split(",").map((part) => part.trim());
            if (parts.length >= 3) {
              return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
            }
            return match;
          });
          ctx.lineWidth = 1;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }

      if (pointer.active) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 180) {
          const force = (1 - distance / 180) * 0.018;
          particle.vx += dx * force * 0.002;
          particle.vy += dy * force * 0.002;
        }
      }
    });

    animationFrame = window.requestAnimationFrame(draw);
  };

  const start = () => {
    if (mediaQuery.matches) return;
    window.cancelAnimationFrame(animationFrame);
    draw();
  };

  window.addEventListener("resize", () => {
    resize();
    start();
  });

  window.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY, active: true };
  });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  mediaQuery.addEventListener("change", () => {
    if (mediaQuery.matches) {
      window.cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, width, height);
      return;
    }
    resize();
    start();
  });

  resize();
  start();
}
