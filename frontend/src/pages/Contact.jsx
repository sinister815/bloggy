import { useState } from 'react'
import InfoPageLayout from '../components/InfoPageLayout.jsx'
import { CONTACT_EMAIL } from '../config/siteConfig.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function buildGmailComposeUrl({ to, subject = '', body = '' }) {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  })

  return `https://mail.google.com/mail/?${params.toString()}`
}

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')

  const contactEmail = CONTACT_EMAIL?.trim() ?? ''
  const emailConfigured = EMAIL_PATTERN.test(contactEmail)
  const contactGmailUrl = emailConfigured
    ? buildGmailComposeUrl({ to: contactEmail })
    : null

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('')

    if (!emailConfigured) {
      setNotice(
        'The site owner must set a valid contact email in src/config/siteConfig.js before this form can be used.',
      )
      return
    }

    const mailSubject = subject.trim() || `Message from ${name.trim() || 'a Bloggy visitor'}`
    const mailBody = [
      `Name: ${name.trim() || 'Not provided'}`,
      `Reply email: ${email.trim()}`,
      '',
      'Message:',
      message.trim(),
    ].join('\n')

    // Open Gmail's web composer instead of relying on the visitor's local mail app.
    // Gmail may ask the visitor to sign in. They must press Send in Gmail themselves.
    window.location.assign(
      buildGmailComposeUrl({ to: contactEmail, subject: mailSubject, body: mailBody }),
    )
  }

  return (
    <InfoPageLayout
      title="Contact Us"
      eyebrow="WE WOULD LIKE TO HEAR FROM YOU"
      description="Send a question, share feedback, or report a concern about a post or the website."
    >
      <section>
        <h2>How to reach us</h2>
        <p>
          Use the form below for general questions, site feedback, content corrections, copyright concerns, or privacy-related requests. Please include enough detail for us to understand your message, and do not include passwords or other sensitive information.
        </p>
        <div className="contact-detail-card">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Email</p>
          <p className="m-0 text-base font-semibold text-slate-900">
            {emailConfigured ? (
              <a
                className="info-page-link"
                href={contactGmailUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contactEmail}
              </a>
            ) : (
              <span>Contact email is being configured.</span>
            )}
          </p>
        </div>
      </section>

      <section>
        <h2>Send a message</h2>
        <p>
          Submitting this form opens a pre-filled message in Gmail. Sign in if prompted, review the draft, and press Send there. This website does not send or store the message itself.
        </p>
        <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="contact-field">
              <span>Name</span>
              <input
                autoComplete="name"
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </label>
            <label className="contact-field">
              <span>Your email</span>
              <input
                autoComplete="email"
                maxLength={254}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
          </div>
          <label className="contact-field">
            <span>Subject</span>
            <input
              maxLength={150}
              onChange={(event) => setSubject(event.target.value)}
              value={subject}
            />
          </label>
          <label className="contact-field">
            <span>Message</span>
            <textarea
              maxLength={5000}
              onChange={(event) => setMessage(event.target.value)}
              required
              rows={6}
              value={message}
            />
          </label>
          <div>
            <button
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              type="submit"
            >
              Open Gmail to Send
            </button>
          </div>
          {notice && (
            <p
              aria-live="polite"
              className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              role="alert"
            >
              {notice}
            </p>
          )}
        </form>
      </section>

      {!emailConfigured && (
        <p className="mt-7 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Setup required before launch: set <code>CONTACT_EMAIL</code> in{' '}
          <code>src/config/siteConfig.js</code> to a valid inbox you monitor.
        </p>
      )}
    </InfoPageLayout>
  )
}

export default Contact
