
// const sitePages = [
//   ["index.html", "Home"],
//   ["about.html", "About"],
//   ["services.html", "Services"],
//   ["projects.html", "Robotics"],
//   ["contact.html", "Contact"]
// ];

// const currentPage = location.pathname.split("/").pop() || "index.html";
// const links = sitePages.map(([href, label]) => {
//   const active = href === currentPage ? ' aria-current="page"' : "";
//   const contactClass = href === "contact.html" ? ' class="nav-contact"' : "";
//   return `<a href="${href}"${contactClass}${active}>${label}</a>`;
// }).join("");

// document.querySelector("body > nav")?.remove();
// document.querySelector("body > footer")?.remove();
// document.body.insertAdjacentHTML("afterbegin", `
//   <header class="site-header">
//     <nav class="site-nav" aria-label="Main navigation">
//       <a class="brand" href="index.html" aria-label="Nanvi AI Robotics">
//         <img src="images/Nanvi%20logo.png?v=20261105d" alt="Nanvi logo">
//         <span class="brand-divider"></span>
//         <span class="brand-tagline">AI Robotics</span>
//       </a>
//       <div class="nav-links">${links}</div>
//       <details class="mobile-nav">
//         <summary aria-label="Menu"><span>☰</span> Menu</summary>
//         <div class="mobile-links">${links}</div>
//       </details>
//     </nav>
//   </header>
// `);
// document.body.insertAdjacentHTML("beforeend", `
//   <footer class="site-footer">
//     <div class="footer-content">
//       <div class="footer-about">
//         <a class="footer-brand" href="index.html"><img src="images/Nanvi%20logo.png?v=20261105d" alt="Nanvi logo"></a>
//         <p>Nanvi AI Robotics</p>
//         <span>Robotics that solve real-world challenges.</span>
//       </div>
//       <section class="footer-address" aria-labelledby="footer-address-title">
//         <h2 id="footer-address-title">Company Address</h2>
//         <h3>USA Office</h3>
//         <address>NANVI Technology Solutions LLC<br>520 Central Parkway East, Suite 105, Plano, Texas 75074</address>
//         <p><strong>Email:</strong> <a href="mailto:hradmin@nanvitech.com">hradmin@nanvitech.com</a> /<br><a href="mailto:support@nanvitech.com">support@nanvitech.com</a></p>
//         <a href="https://www.nanvitech.com" target="_blank" rel="noopener noreferrer">www.nanvitech.com</a>
//         <h3 class="india-office-title">India Office</h3>
//         <address>Chennai, Tamil Nadu, India</address>
//       </section>
//       <nav class="footer-services" aria-label="Explore Nanvi">
//         <h2>Explore Nanvi</h2>
//         <a href="about.html">About Us</a>
//         <a href="services.html">Our Services</a>
//         <a href="projects.html">Our Robotics</a>
//         <a href="contact.html">Contact Us</a>
//       </nav>
//     </div>
//     <div class="footer-bottom">
//       <span>&copy; 2026 Nanvi Technology Solutions. All rights reserved.</span>
//       <a href="#" class="back-to-top">Back to top &uarr;</a>
//     </div>
//   </footer>
// `);

// const revealItems = document.querySelectorAll(
//   "main > .page-hero, main > .content-section, main > section:not(.hero), body > section:not(.hero), .home-gallery-grid img, .stats .stat, .card, .project-card, .service-card, .value-card, .demo, #contact form"
// );
// if ("IntersectionObserver" in window) {
//   const revealObserver = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add("is-visible");
//         revealObserver.unobserve(entry.target);
//       }
//     });
//   }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

//   revealItems.forEach((element, index) => {
//     element.classList.add("scroll-reveal");
//     if (element.matches(".stat, .card, .project-card, .service-card, .value-card")) {
//       element.style.setProperty("--reveal-delay", `${index % 4 * 80}ms`);
//     }
//     revealObserver.observe(element);
//   });
// } else {
//   revealItems.forEach((element) => element.classList.add("is-visible"));
// }

// document.querySelectorAll("[data-tab]").forEach((tab) => {
//   tab.addEventListener("click", () => {
//     document.querySelectorAll("[data-tab]").forEach((button) => {
//       button.setAttribute("aria-selected", String(button === tab));
//       button.tabIndex = button === tab ? 0 : -1;
//     });
//     document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
//       panel.hidden = panel.id !== tab.getAttribute("aria-controls");
//     });
//   });
// });

// // ---------------------------------------------------------------------------
// // Contact form -> Google Apps Script Web App (email delivery via MailApp)
// // After deploying the script, paste the Web App URL (ends in /exec) below.
// // ---------------------------------------------------------------------------
// const NANVI_CONTACT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzdcSTz3Wi37k3nA6ug8Rz6Y_0qHbdxcI8_m-KqzSisnry5UtILKgY-Mf_AIoKG0GwV9A/execPASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
// const NANVI_PAGE_LOADED_AT = Date.now();
// const NANVI_COOLDOWN_MS = 60000;

// window.NanviContact = {
//   // Shared sender used by the Contact page and the home-page form.
//   async send(fields) {
//     if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(NANVI_CONTACT_ENDPOINT)) {
//       return { success: false, message: "The contact form is not connected yet. Please email us directly." };
//     }
//     try {
//       if (Date.now() - Number(localStorage.getItem("nanvi_contact_last") || 0) < NANVI_COOLDOWN_MS) {
//         return { success: false, message: "Please wait a minute before sending another message." };
//       }
//     } catch (_) { /* storage unavailable: skip cooldown */ }

//     const controller = new AbortController();
//     const timer = setTimeout(() => controller.abort(), 25000);
//     try {
//       // text/plain keeps this a "simple" CORS request (Apps Script does not answer preflights).
//       const response = await fetch(NANVI_CONTACT_ENDPOINT, {
//         method: "POST",
//         headers: { "Content-Type": "text/plain;charset=utf-8" },
//         body: JSON.stringify({ ...fields, elapsedMs: Date.now() - NANVI_PAGE_LOADED_AT }),
//         redirect: "follow",
//         signal: controller.signal
//       });
//       const result = await response.json();
//       if (result && result.success) {
//         try { localStorage.setItem("nanvi_contact_last", String(Date.now())); } catch (_) { }
//         return { success: true, message: result.message };
//       }
//       return { success: false, message: (result && result.message) || "Unable to send your message. Please try again.", field: result && result.field };
//     } catch (error) {
//       console.error("Contact form request failed:", error);
//       return {
//         success: false,
//         message: error.name === "AbortError"
//           ? "The request timed out. Please check your connection and try again."
//           : "Could not reach the server. Please check your connection and try again."
//       };
//     } finally {
//       clearTimeout(timer);
//     }
//   }
// };

// const contactForm = document.querySelector("#contact-form");
// if (contactForm) {
//   const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
//   const rules = {
//     name: (v) => v.length < 2 ? "Please enter your full name." : v.length > 100 ? "Name must be 100 characters or fewer." : "",
//     email: (v) => !v ? "Email address is required." : (v.length > 254 || !EMAIL_RE.test(v)) ? "Please enter a valid email address." : "",
//     subject: (v) => v.length < 3 ? "Please enter a subject." : v.length > 150 ? "Subject must be 150 characters or fewer." : "",
//     message: (v) => v.length < 10 ? "Please enter a message (at least 10 characters)." : v.length > 5000 ? "Message must be 5,000 characters or fewer." : ""
//   };
//   const submitBtn = contactForm.querySelector("#contact-submit");
//   const btnText = submitBtn.querySelector(".btn-text");
//   const alertBox = contactForm.querySelector("#contact-alert");

//   const fieldEl = (name) => contactForm.elements[name];
//   const valueOf = (name) => fieldEl(name).value.trim();

//   function showError(name, message) {
//     const input = fieldEl(name);
//     const out = contactForm.querySelector("#err-" + name);
//     out.textContent = message;
//     input.classList.toggle("is-invalid", Boolean(message));
//     if (message) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
//     return !message;
//   }
//   const checkField = (name) => showError(name, rules[name](valueOf(name)));

//   function showAlert(type, message) {
//     alertBox.hidden = false;
//     alertBox.className = "form-alert " + type;
//     alertBox.textContent = message;
//   }

//   function setSending(isSending) {
//     submitBtn.disabled = isSending;
//     submitBtn.classList.toggle("is-loading", isSending);
//     submitBtn.setAttribute("aria-busy", String(isSending));
//     btnText.textContent = isSending ? "Sending..." : "Send Message";
//   }

//   Object.keys(rules).forEach((name) => {
//     fieldEl(name).addEventListener("blur", () => checkField(name));
//     fieldEl(name).addEventListener("input", () => {
//       if (fieldEl(name).classList.contains("is-invalid")) checkField(name);
//     });
//   });

//   contactForm.addEventListener("submit", async (event) => {
//     event.preventDefault();
//     if (submitBtn.disabled) return;           // block double submits
//     alertBox.hidden = true;

//     const invalid = Object.keys(rules).filter((name) => !checkField(name));
//     if (invalid.length) {
//       fieldEl(invalid[0]).focus();
//       showAlert("error", "Please correct the highlighted fields and try again.");
//       return;
//     }

//     setSending(true);
//     const result = await window.NanviContact.send({
//       name: valueOf("name"),
//       email: valueOf("email"),
//       subject: valueOf("subject"),
//       message: valueOf("message"),
//       website: fieldEl("website").value
//     });
//     setSending(false);

//     if (result.success) {
//       contactForm.reset();
//       Object.keys(rules).forEach((name) => showError(name, ""));
//       showAlert("success", "Thank you! Your message has been sent. The Nanvi team will contact you soon.");
//     } else {
//       if (result.field && rules[result.field]) showError(result.field, result.message);
//       showAlert("error", result.message);   // form content is kept so nothing is lost
//     }
//   });
// }

// // Smart video loader: only play card videos when scrolled into view
// const projectVideos = document.querySelectorAll(".project-image video");
// if ("IntersectionObserver" in window && projectVideos.length > 0) {
//   const videoObserver = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//       const vid = entry.target;
//       if (entry.isIntersecting) {
//         vid.play().catch(() => { });
//       } else {
//         vid.pause();
//       }
//     });
//   }, { threshold: 0.2 });
//   projectVideos.forEach((v) => videoObserver.observe(v));
// }



const sitePages = [
  ["index.html", "Home"],
  ["about.html", "About"],
  ["services.html", "Services"],
  ["projects.html", "Robotics"],
  ["contact.html", "Contact"]
];

const currentPage = location.pathname.split("/").pop() || "index.html";
const links = sitePages.map(([href, label]) => {
  const active = href === currentPage ? ' aria-current="page"' : "";
  const contactClass = href === "contact.html" ? ' class="nav-contact"' : "";
  return `<a href="${href}"${contactClass}${active}>${label}</a>`;
}).join("");

document.querySelector("body > nav")?.remove();
document.querySelector("body > footer")?.remove();
document.body.insertAdjacentHTML("afterbegin", `
  <header class="site-header">
    <nav class="site-nav" aria-label="Main navigation">
      <a class="brand" href="index.html" aria-label="Nanvi AI Robotics">
        <img src="images/Nanvi%20logo.png?v=20261105d" alt="Nanvi logo">
        <span class="brand-divider"></span>
        <span class="brand-tagline">AI Robotics</span>
      </a>
      <div class="nav-links">${links}</div>
      <details class="mobile-nav">
        <summary aria-label="Menu"><span>☰</span> Menu</summary>
        <div class="mobile-links">${links}</div>
      </details>
    </nav>
  </header>
`);
document.body.insertAdjacentHTML("beforeend", `
  <footer class="site-footer">
    <div class="footer-map" aria-hidden="true">
    </div>
    <div class="footer-content">
      <div class="footer-about">
        <a class="footer-brand" href="index.html"><img src="images/Nanvi%20logo.png?v=20261105d" alt="Nanvi logo"></a>
        <p>Nanvi AI Robotics</p>
        <span>Robotics that solve real-world challenges.</span>
      </div>
      <div class="footer-address" role="group" aria-labelledby="footer-address-title">
        <h2 id="footer-address-title">Company Address</h2>
        <div class="office-grid">
          <div class="office office-usa">
            <h3>USA Office</h3>
            <div class="office-body">
              <address class="office-row office-addr"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span><span class="txt">NANVI Technology Solutions LLC<br>520 Central Parkway East, Suite 105, Plano, Texas 75074</span></address>
              <div class="office-col">
                <div class="office-row"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span><span class="txt"><a href="mailto:hradmin@nanvitech.com">hradmin@nanvitech.com</a><a href="mailto:support@nanvitech.com">support@nanvitech.com</a></span></div>
                <div class="office-row"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg></span><span class="txt"><a href="https://www.nanvitech.com" target="_blank" rel="noopener noreferrer">www.nanvitech.com</a></span></div>
              </div>
            </div>
          </div>
          <div class="office">
            <h3>India Office</h3>
            <div class="office-body"><address class="office-row"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span><span class="txt">Chennai, Tamil Nadu, India</span></address></div>
          </div>
        </div>
      </div>
      <nav class="footer-services" aria-label="Explore Nanvi">
        <h2>Explore Nanvi</h2>
        <a href="about.html">About Us</a>
        <a href="services.html">Our Services</a>
        <a href="projects.html">Our Robotics</a>
        <a href="contact.html">Contact Us</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Nanvi Technology Solutions. All rights reserved.</span>
      <a href="#" class="back-to-top">Back to top &uarr;</a>
    </div>
  </footer>
`);

const revealItems = document.querySelectorAll(
  "main > .page-hero, main > .content-section, main > section:not(.hero), body > section:not(.hero), .home-gallery-grid img, .stats .stat, .card, .project-card, .service-card, .value-card, .demo, #contact form"
);
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  revealItems.forEach((element, index) => {
    element.classList.add("scroll-reveal");
    if (element.matches(".stat, .card, .project-card, .service-card, .value-card")) {
      element.style.setProperty("--reveal-delay", `${index % 4 * 80}ms`);
    }
    revealObserver.observe(element);
  });
} else {
  revealItems.forEach((element) => element.classList.add("is-visible"));
}

document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((button) => {
      button.setAttribute("aria-selected", String(button === tab));
      button.tabIndex = button === tab ? 0 : -1;
    });
    document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
  });
});

// ---------------------------------------------------------------------------
// Contact form -> Google Apps Script Web App (email delivery via MailApp)
// After deploying the script, paste the Web App URL (ends in /exec) below.
// ---------------------------------------------------------------------------
const NANVI_CONTACT_ENDPOINT = "https://script.google.com/macros/s/AKfycbzdcSTz3Wi37k3nA6ug8Rz6Y_0qHbdxcI8_m-KqzSisnry5UtILKgY-Mf_AIoKG0GwV9A/exec";
const NANVI_PAGE_LOADED_AT = Date.now();
const NANVI_COOLDOWN_MS = 60000;

window.NanviContact = {
  // Shared sender used by the Contact page and the home-page form.
  async send(fields) {
    if (!/^https:\/\/script\.google\.com\/(?:a\/macros\/[^/]+|macros)\/s\/[^/]+\/exec$/.test(NANVI_CONTACT_ENDPOINT.trim())) {
      return { success: false, message: "The contact form is not connected yet. Please email us directly." };
    }
    try {
      if (Date.now() - Number(localStorage.getItem("nanvi_contact_last") || 0) < NANVI_COOLDOWN_MS) {
        return { success: false, message: "Please wait a minute before sending another message." };
      }
    } catch (_) { /* storage unavailable: skip cooldown */ }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      // text/plain keeps this a "simple" CORS request (Apps Script does not answer preflights).
      const response = await fetch(NANVI_CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...fields, elapsedMs: Date.now() - NANVI_PAGE_LOADED_AT }),
        redirect: "follow",
        signal: controller.signal
      });
      const result = await response.json();
      if (result && result.success) {
        try { localStorage.setItem("nanvi_contact_last", String(Date.now())); } catch (_) { }
        return { success: true, message: result.message };
      }
      return { success: false, message: (result && result.message) || "Unable to send your message. Please try again.", field: result && result.field };
    } catch (error) {
      console.error("Contact form request failed:", error);
      return {
        success: false,
        message: error.name === "AbortError"
          ? "The request timed out. Please check your connection and try again."
          : "Could not reach the server. Please check your connection and try again."
      };
    } finally {
      clearTimeout(timer);
    }
  }
};

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const rules = {
    name: (v) => v.length < 2 ? "Please enter your full name." : v.length > 100 ? "Name must be 100 characters or fewer." : "",
    email: (v) => !v ? "Email address is required." : (v.length > 254 || !EMAIL_RE.test(v)) ? "Please enter a valid email address." : "",
    subject: (v) => v.length < 3 ? "Please enter a subject." : v.length > 150 ? "Subject must be 150 characters or fewer." : "",
    message: (v) => v.length < 10 ? "Please enter a message (at least 10 characters)." : v.length > 5000 ? "Message must be 5,000 characters or fewer." : ""
  };
  const submitBtn = contactForm.querySelector("#contact-submit");
  const btnText = submitBtn.querySelector(".btn-text");
  const alertBox = contactForm.querySelector("#contact-alert");

  const fieldEl = (name) => contactForm.elements[name];
  const valueOf = (name) => fieldEl(name).value.trim();

  function showError(name, message) {
    const input = fieldEl(name);
    const out = contactForm.querySelector("#err-" + name);
    out.textContent = message;
    input.classList.toggle("is-invalid", Boolean(message));
    if (message) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !message;
  }
  const checkField = (name) => showError(name, rules[name](valueOf(name)));

  function showAlert(type, message) {
    alertBox.hidden = false;
    alertBox.className = "form-alert " + type;
    alertBox.textContent = message;
  }

  function setSending(isSending) {
    submitBtn.disabled = isSending;
    submitBtn.classList.toggle("is-loading", isSending);
    submitBtn.setAttribute("aria-busy", String(isSending));
    btnText.textContent = isSending ? "Sending..." : "Send Message";
  }

  Object.keys(rules).forEach((name) => {
    fieldEl(name).addEventListener("blur", () => checkField(name));
    fieldEl(name).addEventListener("input", () => {
      if (fieldEl(name).classList.contains("is-invalid")) checkField(name);
    });
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitBtn.disabled) return;           // block double submits
    alertBox.hidden = true;

    const invalid = Object.keys(rules).filter((name) => !checkField(name));
    if (invalid.length) {
      fieldEl(invalid[0]).focus();
      showAlert("error", "Please correct the highlighted fields and try again.");
      return;
    }

    setSending(true);
    const result = await window.NanviContact.send({
      name: valueOf("name"),
      email: valueOf("email"),
      subject: valueOf("subject"),
      message: valueOf("message"),
      website: fieldEl("website").value
    });
    setSending(false);

    if (result.success) {
      contactForm.reset();
      Object.keys(rules).forEach((name) => showError(name, ""));
      showAlert("success", "Thank you! Your message has been sent. The Nanvi team will contact you soon.");
    } else {
      if (result.field && rules[result.field]) showError(result.field, result.message);
      showAlert("error", result.message);   // form content is kept so nothing is lost
    }
  });
}

// Smart video loader: only play card videos when scrolled into view
const projectVideos = document.querySelectorAll(".project-image video");
if ("IntersectionObserver" in window && projectVideos.length > 0) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const vid = entry.target;
      if (entry.isIntersecting) {
        vid.play().catch(() => { });
      } else {
        vid.pause();
      }
    });
  }, { threshold: 0.2 });
  projectVideos.forEach((v) => videoObserver.observe(v));
}