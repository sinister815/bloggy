import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout.jsx'

function Disclaimer() {
  return (
    <InfoPageLayout
      title="Disclaimer"
      eyebrow="IMPORTANT INFORMATION"
      description="Please read these notes about the nature, accuracy, and use of information published on Bloggy."
    >
      <section>
        <h2>General information</h2>
        <p>
          Bloggy provides articles and other material for general informational and educational purposes. We try to make the website useful, but we do not guarantee that every post is complete, current, accurate, or suitable for every reader or situation.
        </p>
      </section>

      <section>
        <h2>Contributors’ opinions</h2>
        <p>
          Posts may be written by individual contributors and reflect their own research, experiences, or opinions. Publication on Bloggy does not necessarily mean that Bloggy has independently verified or endorses every statement in a post. Readers should assess the sources and context before relying on information.
        </p>
      </section>

      <section>
        <h2>Not professional advice</h2>
        <p>
          Nothing on this website is intended to replace advice from a qualified professional. For decisions involving health, law, finance, safety, or another specialized area, seek advice from a suitably qualified person who can consider your circumstances.
        </p>
      </section>

      <section>
        <h2>External websites</h2>
        <p>
          Bloggy may link to websites, tools, products, or resources operated by third parties. We do not control those external services and are not responsible for their content, availability, or privacy practices. A link is provided for convenience and does not by itself constitute an endorsement.
        </p>
      </section>

      <section>
        <h2>Advertising and affiliate links</h2>
        <p>
          Bloggy may display third-party advertisements, including Google AdSense ads, to help support the website. Advertisements may be selected or personalized by advertising providers according to their systems and applicable privacy settings. The presence of an advertisement does not necessarily mean Bloggy recommends the advertised product or service. If an article contains a paid promotion or affiliate link, that relationship should be disclosed alongside the relevant content.
        </p>
      </section>

      <section>
        <h2>Use at your own discretion</h2>
        <p>
          You are responsible for how you use information found on Bloggy. To the extent permitted by law, Bloggy disclaims responsibility for losses arising from reliance on website content. This disclaimer does not limit any rights or remedies that cannot lawfully be limited.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          If you spot a factual error or have a question about this disclaimer, please reach out through our <Link className="info-page-link" to="/contact">Contact Us page</Link>.
        </p>
      </section>
    </InfoPageLayout>
  )
}

export default Disclaimer
