import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/InfoPageLayout.jsx'

function About() {
  return (
    <InfoPageLayout
      title="About Us"
      eyebrow="ABOUT BLOGGY"
      description="Learn what Bloggy is for, what readers can expect, and the principles that guide the content shared here."
    >
      <section>
        <h2>Welcome to Bloggy</h2>
        <p>
          Bloggy is a publishing space built for reading, writing, and sharing ideas. It gives writers a place to publish articles and gives readers a simple way to discover perspectives, practical guides, personal experiences, and other useful information.
        </p>
        <p>
          Our goal is to make online reading feel clear and approachable: content should be easy to navigate, comfortable to read, and useful to the person who opened it.
        </p>
      </section>

      <section>
        <h2>What you will find here</h2>
        <ul>
          <li>Articles and posts created by contributors.</li>
          <li>Ideas, explanations, how-to content, and personal viewpoints.</li>
          <li>A straightforward reading and publishing experience.</li>
        </ul>
        <p>
          The available topics depend on what is published. Individual posts may reflect the experience and opinions of their authors, and a post should not automatically be treated as professional advice or as a statement from Bloggy.
        </p>
      </section>

      <section>
        <h2>Our approach to useful content</h2>
        <p>
          We encourage contributors to publish original work, use sources responsibly, write accurately, and make it clear when they are sharing an opinion or personal experience. Content that is misleading, unlawful, copied without permission, or otherwise inappropriate may be reviewed or removed.
        </p>
        <p>
          Readers should assess information in context and consult a qualified professional when a decision requires specialist advice.
        </p>
      </section>

      <section>
        <h2>Get in touch</h2>
        <p>
          Questions, feedback, or concerns about content are welcome. Visit our <Link className="info-page-link" to="/contact">Contact Us page</Link> to find the available contact option. For details about information and cookies, read our <Link className="info-page-link" to="/privacy-policy">Privacy Policy</Link>.
        </p>
      </section>
    </InfoPageLayout>
  )
}

export default About
