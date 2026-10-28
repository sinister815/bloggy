import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout.jsx'

function TermsAndConditions() {
  return (
    <InfoPageLayout
      title="Terms & Conditions"
      eyebrow="TERMS OF USE"
      description="These terms describe the basic rules for accessing Bloggy, using an account, and publishing or reading content."
    >
      <section>
        <h2>1. Agreement to the terms</h2>
        <p>
          By accessing or using Bloggy, you agree to these Terms & Conditions and our <Link className="info-page-link" to="/privacy-policy">Privacy Policy</Link>. If you do not agree, please do not use account, publishing, or other interactive features of the website.
        </p>
      </section>

      <section>
        <h2>2. Website purpose</h2>
        <p>
          Bloggy provides website features for reading, creating, managing, and publishing blog posts. Features may change as the website is developed. We may temporarily suspend parts of the service for maintenance, safety, or technical reasons.
        </p>
      </section>

      <section>
        <h2>3. Accounts and account security</h2>
        <p>
          You are responsible for providing accurate account information, keeping your sign-in details secure, and activity carried out through your account. Notify us if you believe your account has been accessed without permission. We may restrict or disable accounts where reasonably necessary to protect the website or enforce these terms.
        </p>
      </section>

      <section>
        <h2>4. Content you publish</h2>
        <p>
          You retain any rights you hold in content you create. By uploading or publishing content, you give Bloggy permission to store, process, display, and distribute that content as needed to operate the website and make the features you request available. You confirm that you have the rights and permissions needed to submit the content.
        </p>
        <p>
          You are responsible for your posts and must not publish content that is unlawful, infringing, deceptive, abusive, privacy-invasive, malicious, or otherwise violates applicable rules. Do not upload another person’s work, image, or personal information unless you have the necessary rights or lawful basis.
        </p>
      </section>

      <section>
        <h2>5. Acceptable use</h2>
        <ul>
          <li>Do not attempt to disrupt, damage, reverse engineer, or gain unauthorized access to the website or its systems.</li>
          <li>Do not use the service to distribute malware, spam, fraudulent material, or unlawful content.</li>
          <li>Do not impersonate another person or misrepresent the origin of content.</li>
          <li>Do not misuse the website in a way that interferes with other visitors’ use of it.</li>
        </ul>
      </section>

      <section>
        <h2>6. Moderation and removal</h2>
        <p>
          We may review, restrict, or remove content and may limit access to accounts where we reasonably believe content or activity breaches these terms, creates risk, infringes rights, or violates applicable law. We do not promise to pre-review every post or to endorse the views expressed by contributors.
        </p>
      </section>

      <section>
        <h2>7. Third-party services and links</h2>
        <p>
          The website may rely on third-party services for functions such as hosting, media delivery, analytics, or advertising, and may link to external sites. Those third parties operate under their own terms and privacy practices. We are not responsible for external sites that we do not control.
        </p>
      </section>

      <section>
        <h2>8. Informational content</h2>
        <p>
          Posts are provided for general information and discussion. Unless explicitly stated otherwise, content is not a substitute for legal, medical, financial, technical, or other professional advice. Read our <Link className="info-page-link" to="/disclaimer">Disclaimer</Link> for further details.
        </p>
      </section>

      <section>
        <h2>9. Availability and limitation of liability</h2>
        <p>
          We work to keep Bloggy available and reliable, but we cannot guarantee uninterrupted access, error-free operation, or that all content will always be available. To the extent permitted by applicable law, Bloggy is provided on an “as is” and “as available” basis, and we are not liable for indirect or consequential loss arising from use of the website. Nothing in these terms excludes liability that cannot legally be excluded.
        </p>
      </section>

      <section>
        <h2>10. Changes and contact</h2>
        <p>
          We may revise these terms as the website evolves. Changes will be posted on this page, and continued use after an update means you accept the revised terms to the extent allowed by law. For questions, use our <Link className="info-page-link" to="/contact">Contact Us page</Link>.
        </p>
      </section>
    </InfoPageLayout>
  )
}

export default TermsAndConditions
