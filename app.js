(function () {
  const data = window.TANG_SITE;
  const app = document.getElementById("app");
  const page = document.body.dataset.page || "home";

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function list(items, render) {
    return (items || []).map(render).join("");
  }

  function sectionHeader(kicker, title, subtitle) {
    return `
      <div class="section-header">
        <span>${esc(kicker)}</span>
        <h1>${esc(title)}</h1>
        ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
      </div>
    `;
  }

  function setActiveNav() {
    document.querySelectorAll(".site-header nav a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const target = href.replace(".html", "") || "index";
      const normalizedPage = page === "home" ? "index" : page;
      link.classList.toggle("active", target === normalizedPage);
    });
  }

  function renderHero() {
    const profile = data.profile;
    return `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">${esc(profile.unitEn)}</p>
          <h1>${esc(profile.nameZh)}</h1>
          <h2>${esc(profile.nameEn)}</h2>
          <p class="lead">${esc(profile.taglineZh)}</p>
          <p class="lead-en">${esc(profile.taglineEn)}</p>
          <div class="keyword-row">
            ${list(profile.keywords, (item) => `<span>${esc(item)}</span>`)}
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="water-lines">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="orbital-card">
            <strong>Hydrology</strong>
            <small>Water resources · Climate risk · Earth system science</small>
          </div>
        </div>
      </section>
    `;
  }

  function renderHome() {
    return `
      ${renderHero()}
      <section class="home-strip">
        <a class="home-link-card" href="research.html">
          <span>Research</span>
          <strong>Four connected themes in hydrology and global change</strong>
        </a>
        <a class="home-link-card" href="publications.html">
          <span>Publications</span>
          <strong>Selected recent papers and DOI links</strong>
        </a>
        <a class="home-link-card" href="people.html">
          <span>People</span>
          <strong>Principal investigator profile and background</strong>
        </a>
      </section>
      <section class="section home-preview">
        ${sectionHeader("At a glance", "Research Profile", data.profile.introEn)}
        <div class="theme-grid compact">
          ${list(data.researchThemes, (theme, index) => `
            <article class="theme-card">
              <div class="theme-index">${String(index + 1).padStart(2, "0")}</div>
              <h3>${esc(theme.title)}</h3>
              <strong>${esc(theme.titleZh)}</strong>
              <p>${esc(theme.text)}</p>
            </article>
          `)}
        </div>
      </section>
      <section class="section home-preview">
        ${sectionHeader("Latest", "Recent Updates", "Highlights from public profile and publication records.")}
        <div class="news-grid">
          ${list(data.news.slice(0, 3), renderNewsCard)}
        </div>
      </section>
    `;
  }

  function renderAbout() {
    const profile = data.profile;
    return `
      <section class="page-title">
        ${sectionHeader("About", "课题组简介", "A research group focused on water-cycle change and water security.")}
      </section>
      <section class="section no-top-border">
        <div class="about-grid">
          <article class="quiet-card intro-card">
            <p>${esc(profile.introZh)}</p>
            <p>${esc(profile.introEn)}</p>
          </article>
          <div class="metric-grid">
            ${list(data.metrics, (metric) => `
              <article class="metric">
                <strong>${esc(metric.value)}</strong>
                <span>${esc(metric.label)}</span>
              </article>
            `)}
          </div>
        </div>
      </section>
    `;
  }

  function renderResearch() {
    return `
      <section class="page-title">
        ${sectionHeader("Research", "研究方向", "Four pillars connecting hydrology, climate change, observations, and decision support.")}
      </section>
      <section class="section no-top-border">
        <div class="theme-grid">
          ${list(data.researchThemes, (theme, index) => `
            <article class="theme-card">
              <div class="theme-index">${String(index + 1).padStart(2, "0")}</div>
              <h3>${esc(theme.title)}</h3>
              <strong>${esc(theme.titleZh)}</strong>
              <p>${esc(theme.text)}</p>
            </article>
          `)}
        </div>
      </section>
    `;
  }

  function renderPeople() {
    const profile = data.profile;
    return `
      <section class="page-title">
        ${sectionHeader("People", "团队成员", "Principal investigator profile and academic background.")}
      </section>
      <section class="section no-top-border">
        <div class="people-layout">
          <figure class="portrait-card">
            <img src="${esc(profile.portrait)}" alt="${esc(profile.piNameEn)}" />
            <figcaption>${esc(profile.portraitSource)}</figcaption>
          </figure>
          <div class="pi-content">
            <span class="eyebrow">${esc(profile.role)}</span>
            <h2>${esc(profile.piNameZh)}</h2>
            <h3>${esc(profile.piNameEn)}</h3>
            <p>${esc(profile.unitZh)}</p>
            <div class="timeline-columns">
              <div>
                <h4>Experience</h4>
                ${list(data.experience, renderTimelineItem)}
              </div>
              <div>
                <h4>Education</h4>
                ${list(data.education, renderTimelineItem)}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderTimelineItem(item) {
    return `
      <article class="timeline-item">
        <time>${esc(item.period)}</time>
        <strong>${esc(item.title)}</strong>
        <span>${esc(item.organization)}</span>
      </article>
    `;
  }

  function renderPublications() {
    return `
      <section class="page-title">
        ${sectionHeader("Publications", "近期论文", "Selected recent work from public scholarly records.")}
      </section>
      <section class="section no-top-border">
        <div class="publication-list">
          ${list(data.publications, renderPublication)}
        </div>
      </section>
    `;
  }

  function renderPublication(paper) {
    return `
      <article class="publication">
        <div class="pub-year">${esc(paper.year)}</div>
        <div>
          <h2>${esc(paper.title)}</h2>
          <p>${esc(paper.authors)}</p>
          <footer>
            <span>${esc(paper.journal)}</span>
            <a href="${esc(paper.url)}" target="_blank" rel="noopener">DOI ${esc(paper.doi)}</a>
          </footer>
          <small>${esc(paper.highlight)}</small>
        </div>
      </article>
    `;
  }

  function renderNews() {
    return `
      <section class="page-title">
        ${sectionHeader("News", "团队动态", "Updates assembled from public profile and publication records.")}
      </section>
      <section class="section no-top-border">
        <div class="news-grid">
          ${list(data.news, renderNewsCard)}
        </div>
      </section>
    `;
  }

  function renderNewsCard(item) {
    return `
      <article class="news-card">
        <div>
          <time>${esc(item.date)}</time>
          <span>${esc(item.type)}</span>
        </div>
        <h2>${esc(item.title)}</h2>
        <p>${esc(item.text)}</p>
      </article>
    `;
  }

  function renderContact() {
    const profile = data.profile;
    return `
      <section class="page-title">
        ${sectionHeader("Contact", "联系信息", "For academic communication and collaboration.")}
      </section>
      <section class="section no-top-border">
        <div class="contact-panel">
          <div>
            <h2>${esc(profile.nameZh)}</h2>
            <p>${esc(profile.unitZh)}</p>
            <p>${esc(profile.unitEn)}</p>
          </div>
          <ul>
            <li><span>Email</span><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></li>
            <li><span>Phone</span><a href="tel:${esc(profile.phone.replaceAll(" ", ""))}">${esc(profile.phone)}</a></li>
            <li><span>Website</span><a href="${esc(profile.website)}" target="_blank" rel="noopener">Faculty profile</a></li>
          </ul>
        </div>
      </section>
    `;
  }

  function renderSources() {
    return `
      <footer class="site-footer">
        <div>
          <strong>Information sources</strong>
          <p>Public profile, publication, and image information is collected from open web sources. Please verify before formal publication.</p>
        </div>
        <nav aria-label="Source links">
          ${list(data.sources, (source) => `<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.label)}</a>`)}
        </nav>
      </footer>
    `;
  }

  const renderers = {
    home: renderHome,
    about: renderAbout,
    research: renderResearch,
    people: renderPeople,
    publications: renderPublications,
    news: renderNews,
    contact: renderContact
  };

  if (!data) {
    app.innerHTML = '<section class="loading">Site data is missing.</section>';
    return;
  }

  setActiveNav();
  app.innerHTML = `${(renderers[page] || renderHome)()}${renderSources()}`;
})();
