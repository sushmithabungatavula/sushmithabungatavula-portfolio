const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = siteNav ? Array.from(siteNav.querySelectorAll('a[href^="#"]')) : [];
const floatingCards = document.querySelectorAll(".glass-card");
const revealItems = document.querySelectorAll(".reveal");
const internalLinks = document.querySelectorAll('a[href^="#"]');
const skillTrack = document.querySelector(".skill-track");

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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

floatingCards.forEach((card, index) => {
  card.dataset.depth = String((index % 3) + 1);
});

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    const offsetX = event.clientX / window.innerWidth - 0.5;
    const offsetY = event.clientY / window.innerHeight - 0.5;

    floatingCards.forEach((card) => {
      const depth = Number(card.dataset.depth || 1);
      card.style.setProperty("--parallax-x", `${offsetX * depth * 24}px`);
      card.style.setProperty("--parallax-y", `${offsetY * depth * 24}px`);
    });
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (revealItems[0]) {
  revealItems[0].classList.add("is-visible");
}

if (skillTrack) {
  skillTrack.innerHTML += skillTrack.innerHTML;
}

const sectionTargets = navLinks
  .map((link) => {
    const href = link.getAttribute("href");
    if (!href) return null;
    const target = document.querySelector(href);
    return target ? { link, target } : null;
  })
  .filter(Boolean);

const setActiveNavLink = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
};

if (sectionTargets.length) {
  setActiveNavLink("top");

  const navObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) {
        return;
      }

      setActiveNavLink(visibleEntries[0].target.id);
    },
    {
      rootMargin: "-25% 0px -55% 0px",
      threshold: [0.2, 0.35, 0.5, 0.7],
    }
  );

  sectionTargets.forEach(({ target }) => navObserver.observe(target));
}

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    setActiveNavLink(target.id);

    const headerOffset = siteNav ? document.querySelector(".site-header")?.offsetHeight || 0 : 0;
    const targetTop = window.scrollY + target.getBoundingClientRect().top - headerOffset - 18;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
});

const canvas = document.querySelector(".noise-canvas");

if (canvas && !prefersReducedMotion) {
  const context = canvas.getContext("2d");
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let animationFrame = 0;
  let particles = [];

  const palette = [
    "69, 240, 255",
    "255, 79, 216",
    "255, 176, 0",
    "214, 255, 73",
  ];

  const resizeCanvas = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    particles = Array.from({ length: Math.min(65, Math.floor(window.innerWidth / 20)) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2.6 + 0.8,
      color: palette[Math.floor(Math.random() * palette.length)],
    }));
  };

  const drawFrame = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -40) particle.x = window.innerWidth + 40;
      if (particle.x > window.innerWidth + 40) particle.x = -40;
      if (particle.y < -40) particle.y = window.innerHeight + 40;
      if (particle.y > window.innerHeight + 40) particle.y = -40;

      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);

      context.beginPath();
      context.fillStyle = `rgba(${particle.color}, 0.85)`;
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      if (distance < 160) {
        context.beginPath();
        context.strokeStyle = `rgba(${particle.color}, ${0.18 - distance / 1000})`;
        context.lineWidth = 1;
        context.moveTo(particle.x, particle.y);
        context.lineTo(pointer.x, pointer.y);
        context.stroke();
      }

      const next = particles[index + 1];
      if (next) {
        const neighborDistance = Math.hypot(next.x - particle.x, next.y - particle.y);
        if (neighborDistance < 130) {
          context.beginPath();
          context.strokeStyle = `rgba(255, 255, 255, ${0.12 - neighborDistance / 1400})`;
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      }
    });

    animationFrame = window.requestAnimationFrame(drawFrame);
  };

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  drawFrame();

  window.addEventListener("beforeunload", () => {
    window.cancelAnimationFrame(animationFrame);
  });
} else {
  document.documentElement.classList.add("reduced-motion");
}
