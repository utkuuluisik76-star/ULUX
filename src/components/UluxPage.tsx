import { ulux, type UluxLocale } from '@/content/ulux';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { UluxMotion } from '@/components/UluxMotion';
import { CapScroll } from '@/components/CapScroll';
import { LeafIntro } from '@/components/LeafIntro';

export function UluxPage({ locale }: { locale: UluxLocale }) {
  const t = ulux[locale];
  const preorderHref=`mailto:info@u-luksstudyo.com?subject=${encodeURIComponent(t.preorderSubject)}&body=${encodeURIComponent(t.preorderBody)}`;
  return <>
    <SmoothScroll />
    <UluxMotion />
    <a className="skip-link" href="#main">{t.skip}</a>
    <header className="ulux-header">
      <a className="wordmark" href="#first-look" aria-label="ULUX">ULUX</a>
      <nav aria-label={locale === 'tr' ? 'Ana menü' : 'Main navigation'}>
        <a href="#cap-view">{t.cap}</a><a href="#cap-detail">{t.detail}</a>
      </nav>
      <div className="language-switch" aria-label={locale === 'tr' ? 'Dil' : 'Language'}>
        <a href="/" lang="tr" aria-current={locale === 'tr' ? 'page' : undefined}>TR</a>
        <span aria-hidden="true">/</span>
        <a href="/en/" lang="en" aria-current={locale === 'en' ? 'page' : undefined}>EN</a>
      </div>
    </header>
    <main id="main">
      <section className="hero-story has-leaf-intro" id="first-look" aria-labelledby="hero-title">
        <span id="cap-view" className="cap-entry" aria-hidden="true"/>
        <div className="ulux-hero hero-stage">
        <div className="cap-stage-content">
        <div className="hero-heading"><p>{t.note}</p><h1 id="hero-title">ULUX</h1></div>
        <div className="hero-product" data-cap-angle="0"><picture data-product-angle="0">
          <source type="image/avif" srcSet="/images/cap-v2/front-640.avif 640w, /images/cap-v2/front-1200.avif 1200w, /images/cap-v2/front-1600.avif 1600w" sizes="(min-width:900px) 50vw, (min-width:600px) 66vw, 80vw" />
          <img src="/images/cap-v2/front-1200.webp" srcSet="/images/cap-v2/front-640.webp 640w, /images/cap-v2/front-1200.webp 1200w, /images/cap-v2/front-1600.webp 1600w" sizes="(min-width:900px) 50vw, (min-width:600px) 66vw, 80vw" width="1536" height="1024" alt={t.alt} fetchPriority="high" />
        </picture>{(['side','rear-center','inside-green-large'] as const).map((angle,i)=><picture key={angle} data-product-angle={i+1} hidden>
          <source type="image/avif" srcSet={`/images/cap-v2/${angle}-720.avif 720w, /images/cap-v2/${angle}-1200.avif 1200w`} sizes="(min-width:900px) 50vw, (min-width:600px) 66vw, 80vw"/>
          <img src={`/images/cap-v2/${angle}-1200.webp`} srcSet={`/images/cap-v2/${angle}-720.webp 720w, /images/cap-v2/${angle}-1200.webp 1200w`} sizes="(min-width:900px) 50vw, (min-width:600px) 66vw, 80vw" width="1536" height="1024" loading="lazy" alt={t.angleLabels[i+1]} draggable={false}/>
        </picture>)}</div>
        <CapScroll labels={t.angleLabels} description={t.rotationAlt} dragLabel={t.dragLabel} resetLabel={t.resetLabel} keyboardHelp={t.keyboardHelp} />
        <div className="hero-bottom">
          <p className="hero-statement">{t.line}<br />{t.lineTwo}</p>
          <a className="round-link" data-preorder href={preorderHref}><span>{t.preorder}</span><span className="round-arrow" aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-foot"><span>{t.caption}</span><a href="#cap-detail">{t.scroll}<span aria-hidden="true">↓</span></a></div>
        <div className="cap-progress" aria-hidden="true"><span data-cap-progress /></div>
        </div>
        <LeafIntro hint={t.introScroll}/>
        </div>
      </section>
      <section className="ulux-detail" id="cap-detail" aria-labelledby="detail-title">
        <div className="detail-stage">
          <div className="detail-copy"><p className="chapter-label">{t.chapter}</p>
            <h2 id="detail-title">{t.heading.split('\n').map((line, i) => <span key={i}>{line}</span>)}</h2>
            <p className="detail-description">{t.body}</p>
            <div className="detail-swatch"><span aria-hidden="true" />{t.caption}</div>
          </div>
          <figure className="detail-visual">
            <picture className="detail-photo">
              <source media="(max-width: 767px)" type="image/avif" srcSet="/images/detail-portrait.avif" />
              <source media="(max-width: 767px)" srcSet="/images/detail-portrait.webp" />
              <source type="image/avif" srcSet="/images/detail.avif" />
              <img src="/images/detail.webp" width="1200" height="1400" alt={t.detailAlt} loading="lazy" />
            </picture>
            <figcaption><span>ULUX</span><span>{t.stitch}</span></figcaption>
          </figure>
        </div>
      </section>
      <section className="cap-details" aria-labelledby="cap-details-title">
        <h2 id="cap-details-title">{t.productDetails}</h2>
        <div className="cap-details-grid">{(['rear-center','inside-green-large'] as const).map((view,i)=><figure key={view}>
          <picture><source type="image/avif" srcSet={`/images/cap-v2/${view}-720.avif 720w, /images/cap-v2/${view}-1200.avif 1200w`} sizes="(max-width:599px) 92vw, 44vw"/><img src={`/images/cap-v2/${view}-720.webp`} srcSet={`/images/cap-v2/${view}-720.webp 720w, /images/cap-v2/${view}-1200.webp 1200w`} sizes="(max-width:599px) 92vw, 44vw" width="1536" height="1024" loading="lazy" alt={t.detailAlts[i]}/></picture>
          <figcaption><h3>{t.views[i+1]}</h3><p>{i===0?t.rearNote:t.interiorNote}</p></figcaption>
        </figure>)}</div>
      </section>
      <section className="ulux-preorder" id="pre-order" aria-labelledby="preorder-title">
        <div><h2 id="preorder-title">{t.preorderTitle}</h2><p>{t.preorderNote}</p></div>
        <div className="preorder-actions"><a className="preorder-button" data-preorder href={preorderHref}>{t.preorder}<span aria-hidden="true">↗</span></a><a className="contact-email" href="mailto:info@u-luksstudyo.com">info@u-luksstudyo.com</a></div>
      </section>
    </main>
    <footer className="ulux-footer"><a className="wordmark" href="#first-look">ULUX</a><p>{t.concept}</p><a href="#first-look">{t.next}<span aria-hidden="true"> ↑</span></a></footer>
    <a className="mobile-detail-link" data-preorder href={preorderHref}>{t.preorder}<span aria-hidden="true">↗</span></a>
  </>;
}
