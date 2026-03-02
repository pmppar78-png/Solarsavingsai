'use strict';

/* ==========================================================================
   Solar Energy Rebate Finder - Client-Side JavaScript
   Vanilla JS | No Dependencies | Mobile-First
   ========================================================================== */

/* --------------------------------------------------------------------------
   Zip-to-State Mapping
   -------------------------------------------------------------------------- */
var zipRanges = {
  '006-009': 'PR', '010-027': 'MA', '028-029': 'RI', '030-038': 'NH',
  '039-049': 'ME', '050-059': 'VT', '060-069': 'CT', '070-089': 'NJ',
  '100-149': 'NY', '150-196': 'PA', '197-199': 'DE', '200-205': 'DC',
  '206-219': 'MD', '220-246': 'VA', '247-268': 'WV', '270-289': 'NC',
  '290-299': 'SC', '300-319': 'GA', '320-349': 'FL', '350-369': 'AL',
  '370-385': 'TN', '386-397': 'MS', '400-427': 'KY', '430-459': 'OH',
  '460-479': 'IN', '480-499': 'MI', '500-528': 'IA', '530-549': 'WI',
  '550-567': 'MN', '570-577': 'SD', '580-588': 'ND', '590-599': 'MT',
  '600-629': 'IL', '630-658': 'MO', '660-679': 'KS', '680-693': 'NE',
  '700-714': 'LA', '716-729': 'AR', '730-749': 'OK', '750-799': 'TX',
  '800-816': 'CO', '820-831': 'WY', '832-838': 'ID', '840-847': 'UT',
  '850-865': 'AZ', '870-884': 'NM', '889-898': 'NV', '900-961': 'CA',
  '962-966': 'OR', '967-968': 'HI', '970-979': 'OR', '980-994': 'WA',
  '995-999': 'AK'
};

/* --------------------------------------------------------------------------
   Utility Functions
   -------------------------------------------------------------------------- */

/**
 * Format a number as US currency string ($XX,XXX).
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0';
  }
  var rounded = Math.round(amount);
  var isNegative = rounded < 0;
  var abs = Math.abs(rounded);
  var str = String(abs);
  var formatted = '';
  var count = 0;
  for (var i = str.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      formatted = ',' + formatted;
    }
    formatted = str[i] + formatted;
    count++;
  }
  return (isNegative ? '-$' : '$') + formatted;
}

/**
 * Format a number with comma separators.
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  var rounded = Math.round(num);
  var isNegative = rounded < 0;
  var abs = Math.abs(rounded);
  var str = String(abs);
  var formatted = '';
  var count = 0;
  for (var i = str.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      formatted = ',' + formatted;
    }
    formatted = str[i] + formatted;
    count++;
  }
  return (isNegative ? '-' : '') + formatted;
}

/**
 * Convert a string to a URL-friendly slug.
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Look up a US state abbreviation from a 5-digit zip code.
 * Returns the two-letter state code, or null if not found.
 * @param {string} zip
 * @returns {string|null}
 */
function getStateFromZip(zip) {
  if (typeof zip !== 'string' || !/^\d{5}$/.test(zip)) {
    return null;
  }
  var prefix = parseInt(zip.substring(0, 3), 10);
  var keys = Object.keys(zipRanges);
  for (var i = 0; i < keys.length; i++) {
    var parts = keys[i].split('-');
    var lo = parseInt(parts[0], 10);
    var hi = parseInt(parts[1], 10);
    if (prefix >= lo && prefix <= hi) {
      return zipRanges[keys[i]];
    }
  }
  return null;
}

/* --------------------------------------------------------------------------
   1. Document Ready / Init
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initEligibilityWidget();
  initFAQAccordion();
  initAlertBanners();
  initStickyCtA();
  initExitIntent();
  initSmoothScroll();
  initCalculators();
  initCharts();
  initLazySections();
  animateCounters();
});

/* --------------------------------------------------------------------------
   2. Mobile Menu Toggle
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  var toggle = document.querySelector('.mobile-menu-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) {
    return;
  }

  function openMenu() {
    navLinks.classList.add('active');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    navLinks.classList.remove('active');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function isOpen() {
    return navLinks.classList.contains('active');
  }

  // Toggle button
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (isOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking a nav link (event delegation)
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      closeMenu();
    }
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (isOpen() && !navLinks.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   3. Eligibility Widget
   -------------------------------------------------------------------------- */
function initEligibilityWidget() {
  // Use event delegation on document for all widget forms
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('.widget-form');
    if (!form) {
      return;
    }
    e.preventDefault();
    handleWidgetSubmit(form);
  });
}

function handleWidgetSubmit(form) {
  // Gather field values
  var zipInput = form.querySelector('[name="zip"], [name="zipcode"], [data-field="zip"]');
  var ownershipInput = form.querySelector('[name="homeownership"], [name="ownership"], [data-field="homeownership"]');
  var billInput = form.querySelector('[name="bill"], [name="monthly_bill"], [data-field="bill"]');
  var nameInput = form.querySelector('[name="name"], [name="full_name"], [data-field="name"]');
  var emailInput = form.querySelector('[name="email"], [data-field="email"]');
  var phoneInput = form.querySelector('[name="phone"], [data-field="phone"]');

  // Clear previous errors
  var prevErrors = form.querySelectorAll('.widget-error');
  for (var i = 0; i < prevErrors.length; i++) {
    prevErrors[i].parentNode.removeChild(prevErrors[i]);
  }
  var errorFields = form.querySelectorAll('.input-error');
  for (var j = 0; j < errorFields.length; j++) {
    errorFields[j].classList.remove('input-error');
  }

  var errors = [];

  // Validate zip code
  var zip = zipInput ? zipInput.value.trim() : '';
  if (!/^\d{5}$/.test(zip)) {
    errors.push({ field: zipInput, message: 'Please enter a valid 5-digit zip code.' });
  }

  // Validate homeownership
  var ownership = ownershipInput ? ownershipInput.value.trim() : '';
  if (!ownership) {
    errors.push({ field: ownershipInput, message: 'Please select homeownership status.' });
  }

  // Validate monthly bill
  var billStr = billInput ? billInput.value.trim().replace(/[$,]/g, '') : '';
  var bill = parseFloat(billStr);
  if (isNaN(bill) || bill <= 0) {
    errors.push({ field: billInput, message: 'Please enter a monthly bill amount greater than $0.' });
  }

  // Validate required name
  var name = nameInput ? nameInput.value.trim() : '';
  if (nameInput && !name) {
    errors.push({ field: nameInput, message: 'Please enter your name.' });
  }

  // Validate required email
  var email = emailInput ? emailInput.value.trim() : '';
  if (emailInput && !email) {
    errors.push({ field: emailInput, message: 'Please enter your email address.' });
  } else if (emailInput && email && email.indexOf('@') === -1) {
    errors.push({ field: emailInput, message: 'Please enter a valid email address.' });
  }

  // Validate required phone
  var phone = phoneInput ? phoneInput.value.trim() : '';
  if (phoneInput && !phone) {
    errors.push({ field: phoneInput, message: 'Please enter your phone number.' });
  }

  // Show errors if any
  if (errors.length > 0) {
    for (var k = 0; k < errors.length; k++) {
      showFieldError(errors[k].field, errors[k].message);
    }
    // Focus first error field
    if (errors[0].field) {
      errors[0].field.focus();
    }
    return;
  }

  // State-specific solar savings factors (vs flat 65%)
  var stateFactors = {
    CA: 0.75, AZ: 0.78, NV: 0.76, NM: 0.74, TX: 0.72, FL: 0.70,
    HI: 0.82, CO: 0.68, UT: 0.70, NC: 0.65, GA: 0.64, SC: 0.65,
    NY: 0.58, NJ: 0.62, MA: 0.60, CT: 0.60, PA: 0.56, MD: 0.62,
    VA: 0.63, OH: 0.52, MI: 0.50, IL: 0.55, MN: 0.48, WI: 0.50,
    OR: 0.60, WA: 0.55, IN: 0.54, MO: 0.55, TN: 0.58, AL: 0.60,
    ID: 0.62, MT: 0.55, WY: 0.58, ND: 0.48, SD: 0.52, NE: 0.52,
    KS: 0.56, OK: 0.62, AR: 0.58, LA: 0.60, MS: 0.58, KY: 0.50,
    WV: 0.48, NH: 0.55, VT: 0.52, ME: 0.50, RI: 0.58, DE: 0.60, DC: 0.60, AK: 0.40
  };

  // Calculations — use state-specific factor if available
  var state = getStateFromZip(zip);
  var factor = (state && stateFactors[state]) ? stateFactors[state] : 0.65;
  var annualSavings = bill * 12 * factor;
  var twentyYearSavings = annualSavings * 20 * Math.pow(1.03, 10);

  // Store in sessionStorage
  try {
    sessionStorage.setItem('widget_submitted', 'true');
    sessionStorage.setItem('widget_zip', zip);
    sessionStorage.setItem('widget_bill', String(bill));
    if (state) {
      sessionStorage.setItem('widget_state', state);
    }
  } catch (e) {
    // sessionStorage unavailable; continue silently
  }

  // Build results panel
  var resultsHTML =
    '<div class="widget-results">' +
      '<div class="widget-results-header">' +
        '<h3>Your Estimated Solar Savings</h3>' +
        (state ? '<p class="widget-results-state">State: ' + state + '</p>' : '') +
      '</div>' +
      '<div class="widget-results-body">' +
        '<div class="widget-result-item">' +
          '<span class="result-label">Monthly Bill</span>' +
          '<span class="result-value">' + formatCurrency(bill) + '/mo</span>' +
        '</div>' +
        '<div class="widget-result-item">' +
          '<span class="result-label">Est. Annual Savings</span>' +
          '<span class="result-value text-green">' + formatCurrency(annualSavings) + '</span>' +
        '</div>' +
        '<div class="widget-result-item">' +
          '<span class="result-label">Est. 20-Year Savings</span>' +
          '<span class="result-value text-green">' + formatCurrency(twentyYearSavings) + '</span>' +
        '</div>' +
      '</div>' +
      '<p class="widget-results-note">' +
        'Based on your ' + formatCurrency(bill) + '/mo bill, you could save approximately ' +
        formatCurrency(twentyYearSavings) + ' over 20 years.' +
      '</p>' +
      '<div class="widget-results-cta">' +
        '<a href="https://www.energysage.com/solar/?rc=solarsavingsai" class="btn btn-primary btn-lg btn-block" rel="sponsored noopener" target="_blank" data-affiliate="quote-cta-result">Get Your Free Custom Quote</a>' +
        '<div class="widget-results-providers">' +
          '<a href="https://www.sunrun.com/solar-plans?partner=solarsavingsai" class="btn btn-outline btn-sm" rel="sponsored noopener" target="_blank" data-affiliate="sunrun-result">Sunrun Plans</a>' +
          '<a href="https://us.sunpower.com/get-quote?ref=solarsavingsai" class="btn btn-outline btn-sm" rel="sponsored noopener" target="_blank" data-affiliate="sunpower-result">SunPower Quote</a>' +
        '</div>' +
      '</div>' +
      '<p class="widget-results-disclaimer text-muted" style="font-size:0.8rem;margin-top:0.75rem;text-align:center;">' +
        'Estimates based on 65% bill reduction. Actual savings vary by location, system size, and installer.' +
      '</p>' +
    '</div>';

  // Submit lead data to Netlify Forms
  try {
    var leadData = 'form-name=solar-calculator-lead' +
      '&zip=' + encodeURIComponent(zip) +
      '&ownership=' + encodeURIComponent(ownership) +
      '&bill=' + encodeURIComponent(String(bill)) +
      '&state=' + encodeURIComponent(state || '') +
      '&email=' + encodeURIComponent(email || '') +
      '&page_url=' + encodeURIComponent(window.location.pathname) +
      '&annual_savings=' + encodeURIComponent(String(Math.round(annualSavings))) +
      '&twenty_year_savings=' + encodeURIComponent(String(Math.round(twentyYearSavings)));

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(leadData);
  } catch (leadErr) {
    // Silently fail — do not block UX
  }

  // Route lead to affiliate partner via lead router
  try {
    var deviceType = window.innerWidth >= 1024 ? 'desktop' : (window.innerWidth >= 768 ? 'tablet' : 'mobile');
    var pageViews = 1;
    try { pageViews = parseInt(sessionStorage.getItem('pv') || '1', 10); } catch (pvErr) {}
    var referralSource = document.referrer || 'direct';
    if (referralSource.indexOf('google') > -1 || referralSource.indexOf('bing') > -1) referralSource = 'google';
    else if (referralSource.indexOf('facebook') > -1 || referralSource.indexOf('twitter') > -1 || referralSource.indexOf('instagram') > -1) referralSource = 'social';
    else if (referralSource.indexOf(window.location.hostname) > -1) referralSource = 'internal';

    var routerData = JSON.stringify({
      zip: zip,
      bill: bill,
      ownership: ownership === 'I own my home' || ownership === 'own' ? 'own' : 'rent',
      state: state || '',
      name: name || '',
      email: email || '',
      phone: phone || '',
      page_url: window.location.pathname,
      device_type: deviceType,
      page_views: pageViews,
      referral_source: referralSource
    });

    var routerXhr = new XMLHttpRequest();
    routerXhr.open('POST', '/.netlify/functions/lead-router');
    routerXhr.setRequestHeader('Content-Type', 'application/json');
    routerXhr.onreadystatechange = function () {
      if (routerXhr.readyState === 4 && routerXhr.status === 200) {
        try {
          var routerResponse = JSON.parse(routerXhr.responseText);
          if (routerResponse.redirect_url) {
            sessionStorage.setItem('lead_redirect_url', routerResponse.redirect_url);
            sessionStorage.setItem('lead_partner', routerResponse.partner || '');
          }
        } catch (parseErr) {
          // Silently fail
        }
      }
    };
    routerXhr.send(routerData);
  } catch (routerErr) {
    // Silently fail — do not block UX
  }

  // Find or create a results container
  var parent = form.closest('.eligibility-widget') || form.parentNode;
  var existingResults = parent.querySelector('.widget-results');
  if (existingResults) {
    existingResults.parentNode.removeChild(existingResults);
  }

  // Hide the form and show results
  form.style.display = 'none';
  var resultsContainer = document.createElement('div');
  resultsContainer.innerHTML = resultsHTML;
  parent.appendChild(resultsContainer.firstChild);

  // Also hide sticky CTA since user already submitted
  var stickyCta = document.querySelector('.sticky-cta');
  if (stickyCta) {
    stickyCta.classList.remove('visible');
    stickyCta.style.display = 'none';
  }
}

function showFieldError(field, message) {
  if (!field) {
    return;
  }
  field.classList.add('input-error');
  var errorEl = document.createElement('span');
  errorEl.className = 'widget-error';
  errorEl.setAttribute('role', 'alert');
  errorEl.style.cssText = 'color:#DE350B;font-size:0.8rem;display:block;margin-top:0.25rem;';
  errorEl.textContent = message;
  field.parentNode.appendChild(errorEl);
}

/* --------------------------------------------------------------------------
   4. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
  // Event delegation on document for all FAQ questions
  document.addEventListener('click', function (e) {
    var question = e.target.closest('.faq-question');
    if (!question) {
      return;
    }

    var faqItem = question.closest('.faq-item');
    if (!faqItem) {
      return;
    }

    var isActive = faqItem.classList.contains('active');
    var answer = faqItem.querySelector('.faq-answer');

    // Close all other FAQs in the same section
    var section = faqItem.parentNode;
    var allItems = section.querySelectorAll('.faq-item');
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i] !== faqItem) {
        allItems[i].classList.remove('active');
        var otherQuestion = allItems[i].querySelector('.faq-question');
        if (otherQuestion) {
          otherQuestion.setAttribute('aria-expanded', 'false');
        }
        var otherAnswer = allItems[i].querySelector('.faq-answer');
        if (otherAnswer) {
          otherAnswer.style.maxHeight = null;
        }
      }
    }

    // Toggle current item
    if (isActive) {
      faqItem.classList.remove('active');
      question.setAttribute('aria-expanded', 'false');
      if (answer) {
        answer.style.maxHeight = null;
      }
    } else {
      faqItem.classList.add('active');
      question.setAttribute('aria-expanded', 'true');
      if (answer) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    }
  });

  // Set initial aria attributes on all FAQ questions
  var allQuestions = document.querySelectorAll('.faq-question');
  for (var i = 0; i < allQuestions.length; i++) {
    var item = allQuestions[i].closest('.faq-item');
    var expanded = item && item.classList.contains('active') ? 'true' : 'false';
    allQuestions[i].setAttribute('aria-expanded', expanded);

    // If pre-opened, set max-height
    if (expanded === 'true') {
      var answer = item.querySelector('.faq-answer');
      if (answer) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    }
  }
}

/* --------------------------------------------------------------------------
   5. Alert Banners
   -------------------------------------------------------------------------- */
function initAlertBanners() {
  var banners = document.querySelectorAll('.alert-banner');

  // Restore dismissed state
  for (var i = 0; i < banners.length; i++) {
    var bannerId = banners[i].getAttribute('data-alert-id') || 'alert-' + i;
    var dismissed = false;
    try {
      dismissed = sessionStorage.getItem('alert_dismissed_' + bannerId) === 'true';
    } catch (e) {
      // sessionStorage unavailable
    }
    if (dismissed) {
      banners[i].style.display = 'none';
    }
  }

  // Event delegation for close buttons
  document.addEventListener('click', function (e) {
    var closeBtn = e.target.closest('.alert-close');
    if (!closeBtn) {
      return;
    }

    var banner = closeBtn.closest('.alert-banner');
    if (!banner) {
      return;
    }

    banner.style.display = 'none';

    // Store dismissed state
    var alertId = banner.getAttribute('data-alert-id');
    if (!alertId) {
      // Generate a stable ID from position
      var allBanners = document.querySelectorAll('.alert-banner');
      for (var j = 0; j < allBanners.length; j++) {
        if (allBanners[j] === banner) {
          alertId = 'alert-' + j;
          break;
        }
      }
    }
    try {
      sessionStorage.setItem('alert_dismissed_' + alertId, 'true');
    } catch (ex) {
      // sessionStorage unavailable
    }
  });
}

/* --------------------------------------------------------------------------
   6. Sticky CTA (Mobile)
   -------------------------------------------------------------------------- */
function initStickyCtA() {
  var stickyCta = document.querySelector('.sticky-cta');
  if (!stickyCta) {
    return;
  }

  // Check if widget already submitted
  var alreadySubmitted = false;
  try {
    alreadySubmitted = sessionStorage.getItem('widget_submitted') === 'true';
  } catch (e) {
    // sessionStorage unavailable
  }

  if (alreadySubmitted) {
    stickyCta.style.display = 'none';
    return;
  }

  // Initially hidden
  stickyCta.classList.remove('visible');

  var scrollThreshold = 300;
  var ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        // Only show on mobile viewports
        if (window.innerWidth >= 768) {
          stickyCta.classList.remove('visible');
          ticking = false;
          return;
        }

        // Re-check submission status
        var submitted = false;
        try {
          submitted = sessionStorage.getItem('widget_submitted') === 'true';
        } catch (ex) {
          // continue
        }
        if (submitted) {
          stickyCta.classList.remove('visible');
          stickyCta.style.display = 'none';
          ticking = false;
          return;
        }

        if (window.pageYOffset > scrollThreshold) {
          stickyCta.classList.add('visible');
        } else {
          stickyCta.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Check on load in case user is already scrolled
  onScroll();
}

/* --------------------------------------------------------------------------
   7. Exit Intent Modal
   -------------------------------------------------------------------------- */
function initExitIntent() {
  var overlay = document.querySelector('.modal-overlay');
  if (!overlay) {
    return;
  }

  var triggered = false;
  var enabled = false;

  // Don't trigger if already submitted or already shown
  try {
    if (sessionStorage.getItem('widget_submitted') === 'true') {
      return;
    }
    if (sessionStorage.getItem('exit_intent_shown') === 'true') {
      return;
    }
  } catch (e) {
    // sessionStorage unavailable
  }

  // Delay enabling exit intent by 15 seconds
  var enableTimer = setTimeout(function () {
    enabled = true;
  }, 15000);

  function showModal() {
    if (triggered || !enabled) {
      return;
    }

    // Re-check submission status at trigger time
    try {
      if (sessionStorage.getItem('widget_submitted') === 'true') {
        return;
      }
    } catch (e) {
      // continue
    }

    triggered = true;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
      sessionStorage.setItem('exit_intent_shown', 'true');
    } catch (ex) {
      // sessionStorage unavailable
    }
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Desktop: mouse leaving viewport from top
  document.addEventListener('mouseout', function (e) {
    if (e.clientY <= 0 && e.relatedTarget === null) {
      showModal();
    }
  });

  // Close on overlay background click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Close button
  var closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      closeModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   8. Smooth Scrolling
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  var headerOffset = 80;

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }

    var href = link.getAttribute('href');
    if (!href || href === '#') {
      return;
    }

    var target;
    try {
      target = document.querySelector(href);
    } catch (ex) {
      // Invalid selector
      return;
    }

    if (!target) {
      return;
    }

    e.preventDefault();

    var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    // Use native smooth scroll if supported
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      // Fallback for older browsers
      smoothScrollTo(targetPosition, 600);
    }

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, null, href);
    }
  });
}

/**
 * Fallback smooth scroll animation for browsers without native support.
 * @param {number} targetY
 * @param {number} duration
 */
function smoothScrollTo(targetY, duration) {
  var startY = window.pageYOffset;
  var diff = targetY - startY;
  var startTime = null;

  function step(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);
    // Ease in-out quad
    var ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    window.scrollTo(0, startY + diff * ease);
    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   9. Calculator Functions
   -------------------------------------------------------------------------- */
function initCalculators() {
  var calculators = document.querySelectorAll('[data-calculator]');

  for (var i = 0; i < calculators.length; i++) {
    runCalculator(calculators[i]);
  }
}

function runCalculator(el) {
  // Read data attributes
  var installCost = parseFloat(el.getAttribute('data-install-cost')) || 0;
  var kwhRate = parseFloat(el.getAttribute('data-kwh-rate')) || 0;
  var sunHours = parseFloat(el.getAttribute('data-sun-hours')) || 0;
  var systemSize = parseFloat(el.getAttribute('data-system-size')) || 0;
  var stateCreditPercent = parseFloat(el.getAttribute('data-state-credit')) || 0;
  var stateRebate = parseFloat(el.getAttribute('data-state-rebate')) || 0;
  var federalCreditPercent = parseFloat(el.getAttribute('data-federal-credit-percent')) || 30;

  // Calculations
  var annualProduction = systemSize * sunHours * 365 * 0.80; // 80% efficiency
  var annualSavings = annualProduction * kwhRate;
  var federalCredit = installCost * federalCreditPercent / 100;
  var stateCredit = installCost * stateCreditPercent / 100;
  var totalIncentives = federalCredit + stateCredit + stateRebate;
  var netCost = installCost - totalIncentives;
  var paybackYears = annualSavings > 0 ? netCost / annualSavings : 0;
  var twentyYearSavings = (annualSavings * 20) - netCost;
  var monthlySavings = annualSavings / 12;

  // Find or create output container
  var output = el.querySelector('.calculator-output');
  if (!output) {
    return;
  }

  output.innerHTML =
    '<div class="calculator-result">' +
      '<span class="result-label">System Cost</span>' +
      '<span class="result-value">' + formatCurrency(installCost) + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">Federal Tax Credit (' + federalCreditPercent + '%)</span>' +
      '<span class="result-value text-green">' + formatCurrency(federalCredit) + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">State Tax Credit</span>' +
      '<span class="result-value text-green">' + formatCurrency(stateCredit) + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">State Rebate</span>' +
      '<span class="result-value text-green">' + formatCurrency(stateRebate) + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">Total Incentives</span>' +
      '<span class="result-value text-green">' + formatCurrency(totalIncentives) + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">Net Cost After Incentives</span>' +
      '<span class="result-value">' + formatCurrency(netCost) + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">Annual Production</span>' +
      '<span class="result-value">' + formatNumber(annualProduction) + ' kWh</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">Annual Savings</span>' +
      '<span class="result-value text-green">' + formatCurrency(annualSavings) + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">Monthly Savings</span>' +
      '<span class="result-value text-green">' + formatCurrency(monthlySavings) + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">Payback Period</span>' +
      '<span class="result-value">' + (paybackYears > 0 ? paybackYears.toFixed(1) + ' years' : 'N/A') + '</span>' +
    '</div>' +
    '<div class="calculator-result">' +
      '<span class="result-label">20-Year Net Savings</span>' +
      '<span class="result-value ' + (twentyYearSavings >= 0 ? 'text-green' : 'text-red') + '">' +
        formatCurrency(twentyYearSavings) +
      '</span>' +
    '</div>';

  // Update bar chart if present
  var chartContainer = el.querySelector('.chart-container');
  if (chartContainer) {
    updateCalculatorChart(chartContainer, {
      installCost: installCost,
      federalCredit: federalCredit,
      stateCredit: stateCredit,
      stateRebate: stateRebate,
      netCost: netCost,
      twentyYearSavings: twentyYearSavings
    });
  }
}

function updateCalculatorChart(container, data) {
  var barChart = container.querySelector('.bar-chart');
  if (!barChart) {
    // Create a bar chart
    barChart = document.createElement('div');
    barChart.className = 'bar-chart';
    container.appendChild(barChart);
  }

  var maxValue = Math.max(
    data.installCost,
    data.federalCredit,
    data.stateCredit + data.stateRebate,
    data.netCost,
    Math.abs(data.twentyYearSavings)
  );

  if (maxValue <= 0) {
    return;
  }

  var bars = [
    { label: 'System Cost', value: data.installCost, color: '' },
    { label: 'Federal Credit', value: data.federalCredit, color: 'background:linear-gradient(90deg,#00875A,#00A86B);' },
    { label: 'State Incentives', value: data.stateCredit + data.stateRebate, color: 'background:linear-gradient(90deg,#0052CC,#4C9AFF);' },
    { label: 'Net Cost', value: data.netCost, color: 'background:linear-gradient(90deg,#FF6B00,#FF8533);' },
    { label: '20-Year Savings', value: data.twentyYearSavings, color: 'background:linear-gradient(90deg,#00875A,#00A86B);' }
  ];

  var html = '';
  for (var i = 0; i < bars.length; i++) {
    var pct = Math.max((Math.abs(bars[i].value) / maxValue) * 100, 2);
    html +=
      '<div class="bar" data-value="' + Math.abs(bars[i].value) + '" data-max="' + maxValue + '">' +
        '<span class="bar-label">' + bars[i].label + '</span>' +
        '<div class="bar-fill" style="width:' + pct + '%;' + bars[i].color + '"></div>' +
        '<span class="bar-value">' + formatCurrency(bars[i].value) + '</span>' +
      '</div>';
  }

  barChart.innerHTML = html;
}

/* --------------------------------------------------------------------------
   10. CSS Bar Charts
   -------------------------------------------------------------------------- */
function initCharts() {
  var charts = document.querySelectorAll('.bar-chart');
  if (charts.length === 0) {
    return;
  }

  // Use IntersectionObserver to animate bars on scroll into view
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          animateBarChart(entries[i].target);
          observer.unobserve(entries[i].target);
        }
      }
    }, {
      threshold: 0.2
    });

    for (var i = 0; i < charts.length; i++) {
      // Set initial bar widths to 0 for animation
      prepareBarChart(charts[i]);
      observer.observe(charts[i]);
    }
  } else {
    // Fallback: just render bars immediately
    for (var j = 0; j < charts.length; j++) {
      animateBarChart(charts[j]);
    }
  }
}

function prepareBarChart(chart) {
  var bars = chart.querySelectorAll('.bar');
  for (var i = 0; i < bars.length; i++) {
    var fill = bars[i].querySelector('.bar-fill');
    if (fill) {
      // Store target width and set initial to 0
      var value = parseFloat(bars[i].getAttribute('data-value')) || 0;
      var max = parseFloat(bars[i].getAttribute('data-max')) || 0;
      if (max > 0) {
        var pct = (value / max) * 100;
        fill.setAttribute('data-target-width', pct + '%');
        fill.style.width = '0%';
        fill.style.transition = 'width 0.8s ease-out';
      }
    }
  }
}

function animateBarChart(chart) {
  var bars = chart.querySelectorAll('.bar');
  for (var i = 0; i < bars.length; i++) {
    var fill = bars[i].querySelector('.bar-fill');
    if (!fill) {
      continue;
    }

    var targetWidth = fill.getAttribute('data-target-width');
    if (targetWidth) {
      // Use a small stagger per bar for visual effect
      (function (el, tw, delay) {
        setTimeout(function () {
          el.style.width = tw;
        }, delay);
      })(fill, targetWidth, i * 100);
    } else {
      // Bars from calculator already have width set; ensure they display
      var value = parseFloat(bars[i].getAttribute('data-value')) || 0;
      var max = parseFloat(bars[i].getAttribute('data-max')) || 0;
      if (max > 0) {
        fill.style.transition = 'width 0.8s ease-out';
        fill.style.width = ((value / max) * 100) + '%';
      }
    }
  }
}

/* --------------------------------------------------------------------------
   12. Lazy Loading Sections
   -------------------------------------------------------------------------- */
function initLazySections() {
  var lazySections = document.querySelectorAll('.lazy-section');
  if (lazySections.length === 0) {
    return;
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('lazy-loaded');
          observer.unobserve(entries[i].target);
        }
      }
    }, {
      rootMargin: '200px 0px',
      threshold: 0.01
    });

    for (var i = 0; i < lazySections.length; i++) {
      observer.observe(lazySections[i]);
    }
  } else {
    // Fallback: mark all as loaded immediately
    for (var j = 0; j < lazySections.length; j++) {
      lazySections[j].classList.add('lazy-loaded');
    }
  }
}

/* --------------------------------------------------------------------------
   13. Number Counter Animation
   -------------------------------------------------------------------------- */
function animateCounters() {
  var counters = document.querySelectorAll('.counter[data-target]');
  if (counters.length === 0) {
    return;
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          startCounter(entries[i].target);
          observer.unobserve(entries[i].target);
        }
      }
    }, {
      threshold: 0.3
    });

    for (var i = 0; i < counters.length; i++) {
      observer.observe(counters[i]);
    }
  } else {
    // Fallback: animate all immediately
    for (var j = 0; j < counters.length; j++) {
      startCounter(counters[j]);
    }
  }
}

function startCounter(el) {
  var target = parseFloat(el.getAttribute('data-target')) || 0;
  var duration = parseInt(el.getAttribute('data-duration'), 10) || 2000;
  var prefix = el.getAttribute('data-prefix') || '';
  var suffix = el.getAttribute('data-suffix') || '';
  var useDecimals = el.hasAttribute('data-decimals');
  var decimals = useDecimals ? parseInt(el.getAttribute('data-decimals'), 10) || 0 : 0;

  var startTime = null;
  var startValue = 0;

  function update(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    var ease = 1 - Math.pow(1 - progress, 3);
    var current = startValue + (target - startValue) * ease;

    if (useDecimals) {
      el.textContent = prefix + current.toFixed(decimals) + suffix;
    } else {
      el.textContent = prefix + formatNumber(Math.round(current)) + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Ensure final value is exact
      if (useDecimals) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      } else {
        el.textContent = prefix + formatNumber(Math.round(target)) + suffix;
      }
    }
  }

  requestAnimationFrame(update);
}
