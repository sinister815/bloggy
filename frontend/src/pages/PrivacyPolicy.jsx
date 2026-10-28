import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout.jsx'

function PrivacyPolicy() {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      eyebrow="YOUR PRIVACY MATTERS"
      description="This policy explains what information Bloggy may handle, why it is used, and the choices available to visitors and account holders."
    >
      <section>
        <h2>1. Scope of this policy</h2>
        <p>
          This Privacy Policy applies to your use of Bloggy, including reading public posts, creating an account, publishing content, and contacting us. We aim to collect only information needed to operate, secure, and improve the website.
        </p>
      </section>

      <section>
        <h2>2. Information we may collect</h2>
        <ul>
          <li><strong>Account information:</strong> details such as your name and email address when you register or use account features.</li>
          <li><strong>Content you provide:</strong> articles, text, images, and other material you choose to upload or publish.</li>
          <li><strong>Messages:</strong> information you include when you contact us or report an issue.</li>
          <li><strong>Technical and usage information:</strong> information such as browser/device details, approximate usage events, and diagnostic or security logs that may be processed by the website or its service providers.</li>
        </ul>
      </section>

      <section>
        <h2>3. How information is used</h2>
        <p>Information may be used to provide account access, display and manage posts, host uploaded media, respond to requests, protect the website from abuse, diagnose errors, understand broad website usage, and meet legal obligations.</p>
      </section>

      <section>
        <h2>4. Public posts and published information</h2>
        <p>
          If you publish a post, the content you choose to publish may be visible to other visitors. Do not include private information in a public post unless you intend to share it. Information you submit privately for account or support purposes is handled for the relevant operational purpose and is not deliberately published as a post.
        </p>
      </section>

      <section>
        <h2>5. Cookies, analytics, and advertising</h2>
        <p>
          Bloggy and its service providers may use cookies or similar technologies to maintain sign-in sessions, support security, measure website usage, and improve site performance. Google Analytics may be used to help us understand how visitors use the website.
        </p>
        <p>
          Bloggy may display ads through Google AdSense. When Google ads are served, Google and its partners may use cookies, web beacons, IP addresses, or similar identifiers to provide, measure, and personalize advertising, including based on a visitor’s prior visits to this or other websites, where permitted by the visitor’s settings and applicable law.
        </p>
        <p>
          Visitors can review or change Google personalized-ad settings at <a className="info-page-link" href="https://adssettings.google.com/" rel="noreferrer" target="_blank">Google Ads Settings</a>. Additional information about how Google uses information from partner sites is available in <a className="info-page-link" href="https://policies.google.com/technologies/partner-sites" rel="noreferrer" target="_blank">Google’s partner-site privacy information</a>. Visitors can also review <a className="info-page-link" href="https://www.aboutads.info/choices/" rel="noreferrer" target="_blank">industry opt-out choices</a> where available.
        </p>
        <p>
          You can manage cookies through your browser settings. Blocking essential cookies may affect sign-in or other site features. Where required, we will provide additional notices or consent choices for analytics and advertising technologies.
        </p>
      </section>

      <section>
        <h2>6. Service providers and sharing</h2>
        <p>
          We may share information with service providers that help operate Bloggy, such as hosting, database, media-storage, analytics, security, and advertising providers. They may process information only as needed to provide their services or as otherwise permitted by law. We do not sell your personal information as a standalone product. Information may also be disclosed when legally required or when necessary to protect users, the website, or our rights.
        </p>
      </section>

      <section>
        <h2>7. Data retention and security</h2>
        <p>
          We retain information for as long as reasonably necessary for the purposes described in this policy, including account operation, content management, security, dispute resolution, and legal obligations. We use reasonable safeguards, but no online service or method of storage can be guaranteed completely secure.
        </p>
      </section>

      <section>
        <h2>8. Your choices and requests</h2>
        <p>
          You can choose what to publish publicly and may stop using the website at any time. You can contact us to ask about access, correction, or deletion requests, subject to identity verification, technical limits, applicable law, and legitimate retention needs.
        </p>
      </section>

      <section>
        <h2>9. Children’s privacy</h2>
        <p>
          Bloggy is not designed to knowingly collect personal information from children without appropriate authorization. If you believe a child has submitted personal information inappropriately, please contact us so that we can review the request.
        </p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>
          We may update this policy to reflect changes to the website, our practices, or applicable requirements. The revised version will be published on this page with an updated date.
        </p>
        <p>
          For privacy questions, please visit our <Link className="info-page-link" to="/contact">Contact Us page</Link>. This template should be reviewed against the services actually enabled on the live website and the laws applicable to its visitors.
        </p>
      </section>
    </InfoPageLayout>
  )
}

export default PrivacyPolicy
