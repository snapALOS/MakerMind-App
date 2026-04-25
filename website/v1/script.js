/* ============================================================
   MakerMind — Waitlist Site
   ──────────────────────────────────────────────────────────
   SETUP — Replace the value below with your Formspree form ID.

   1. Go to https://formspree.io and sign up (free)
   2. Create a new form, name it "MakerMind Waitlist"
   3. Copy the form ID from the URL (looks like: xpwzknab)
   4. Paste it below, replacing REPLACE_WITH_YOUR_FORM_ID

   All three forms on the page (hero, newsletter, final CTA)
   post to the same endpoint. The _source field tells you which
   form each submission came from.
   ============================================================ */

const FORMSPREE_ID = 'REPLACE_WITH_YOUR_FORM_ID';
const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;
const DEV_MODE = FORMSPREE_ID === 'REPLACE_WITH_YOUR_FORM_ID';


/* ── SCROLL REVEAL ─────────────────────────────────────── */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.dataset.revealDelay ?? 0);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.08,
    rootMargin: '0px 0px -48px 0px',
  }
);

// Stagger siblings within the same direct parent
document.querySelectorAll('.reveal').forEach((el) => {
  const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
  const idx = siblings.indexOf(el);
  // Max 240ms stagger so nothing feels slow
  el.dataset.revealDelay = Math.min(idx * 90, 240);
  observer.observe(el);
});

// Elements that are already in view on load should appear immediately
window.addEventListener('load', () => {
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      setTimeout(() => el.classList.add('visible'), Number(el.dataset.revealDelay ?? 0));
    }
  });
});


/* ── NAV SCROLL SHADOW ─────────────────────────────────── */

const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}


/* ── FORM SUBMISSIONS ──────────────────────────────────── */

/**
 * Show the success state for a given form element.
 * Hides the input row, note, and label; shows the success message.
 */
function showSuccess(form) {
  const successEl = form.querySelector('.form-success');
  const rowEl     = form.querySelector('.form-row');
  const noteEl    = form.querySelector('.form-note');
  const labelEl   = form.querySelector('.form-label');

  if (rowEl)    rowEl.style.display = 'none';
  if (noteEl)   noteEl.style.display = 'none';
  if (labelEl)  labelEl.style.display = 'none';
  if (successEl) successEl.hidden = false;
}

/**
 * Submit email to Formspree.
 * Returns true on success, false on failure.
 */
async function submitToFormspree(email, source) {
  const res = await fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email,
      _source: source,
      _subject: `New MakerMind signup — ${source}`,
    }),
  });
  return res.ok;
}

document.querySelectorAll('[data-form]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn  = form.querySelector('button[type="submit"]');
    const source     = form.dataset.form ?? 'unknown';

    if (!emailInput || !submitBtn) return;

    const email = emailInput.value.trim();
    if (!email) return;

    // Simple client-side email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.style.borderColor = '#D44D26';
      emailInput.focus();
      setTimeout(() => (emailInput.style.borderColor = ''), 2000);
      return;
    }

    const originalLabel = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending…';
    submitBtn.disabled = true;

    if (DEV_MODE) {
      // Preview mode: simulate success without a real POST
      console.log(`[MakerMind] DEV MODE — would submit: ${email} (${source})`);
      setTimeout(() => showSuccess(form), 700);
      return;
    }

    try {
      const ok = await submitToFormspree(email, source);
      if (ok) {
        showSuccess(form);
      } else {
        submitBtn.innerHTML = 'Try again →';
        submitBtn.disabled = false;
      }
    } catch {
      submitBtn.innerHTML = originalLabel;
      submitBtn.disabled = false;
    }
  });

  // Clear error border on input
  form.querySelector('input[type="email"]')?.addEventListener('input', (e) => {
    e.target.style.borderColor = '';
  });
});


/* ── SMOOTH ANCHOR SCROLLING (nav offset) ──────────────── */

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h') || '64', 10);
    const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
