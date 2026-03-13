import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Novunt Privacy Policy explaining how we collect, use, and protect your personal data when you use the Novunt staking platform and services.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="prose prose-invert max-w-3xl space-y-6">
      <h1>Novunt Privacy Policy</h1>
      <p className="text-muted-foreground text-sm">
        Last updated: {new Date().toLocaleDateString('en-US')}
      </p>

      <p>
        This Privacy Policy explains how Novunt (
        <strong>&quot;Novunt&quot;</strong>, <strong>&quot;we&quot;</strong>, or{' '}
        <strong>&quot;us&quot;</strong>) collects, uses, discloses, and
        safeguards information about you when you access or use our website,
        mobile and web applications, and related services (collectively, the{' '}
        <strong>&quot;Services&quot;</strong>).
      </p>
      <p>
        This Policy is intended to give you a clear overview of our practices.
        It does <strong>not</strong> constitute legal advice. By using the
        Services, you agree to the collection and use of information in
        accordance with this Privacy Policy. If you do not agree, you must not
        use the Services.
      </p>

      <nav
        aria-label="Table of contents"
        className="rounded-xl bg-slate-900/40 p-4 text-sm"
      >
        <h2 className="mb-2 text-base font-semibold text-slate-50">
          Summary of key sections
        </h2>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            <a href="#who-we-are">Who we are</a>
          </li>
          <li>
            <a href="#info-we-collect">Information we collect</a>
          </li>
          <li>
            <a href="#how-we-use">How we use your information</a>
          </li>
          <li>
            <a href="#legal-bases">Legal bases for processing</a>
          </li>
          <li>
            <a href="#sharing">How we share information</a>
          </li>
          <li>
            <a href="#transfers">International transfers</a>
          </li>
          <li>
            <a href="#retention">Data retention</a>
          </li>
          <li>
            <a href="#your-rights">Your rights &amp; choices</a>
          </li>
          <li>
            <a href="#security">Security measures</a>
          </li>
          <li>
            <a href="#children">Children&apos;s privacy</a>
          </li>
          <li>
            <a href="#changes">Changes to this Policy</a>
          </li>
          <li>
            <a href="#contact">How to contact us</a>
          </li>
        </ol>
      </nav>

      <h2 id="who-we-are">1. Who We Are</h2>
      <p>
        Novunt operates a digital platform focused on goal-based staking,
        digital asset wallets, and related analytics for eligible users. For the
        purposes of this Policy, Novunt is the entity that determines the
        purposes and means of processing your personal data (the{' '}
        <strong>&quot;data controller&quot;</strong>, where applicable law uses
        that term).
      </p>

      <h2 id="info-we-collect">2. Information We Collect</h2>
      <p>
        We keep the data we collect to a minimum. Depending on how you interact
        with the Services, we may collect the following:
      </p>

      <h3>2.1. Information You Provide to Us</h3>
      <ul>
        <li>
          <strong>Account data</strong> &ndash; your name, username, and email
          address, which you provide when you create an account.
        </li>
        <li>
          <strong>Support and communication data</strong> &ndash; messages you
          send to us (for example, via email, in-app chat, or support tickets),
          feedback, survey responses, and any other information you choose to
          provide.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> collect government-issued identification
        documents, selfies, proof-of-address documents, or payment card numbers
        directly within the Novunt app. If identity verification or payment
        processing is required in the future, it will be handled by specialised
        third-party providers under their own privacy policies, and we will
        update this Policy accordingly.
      </p>

      <h3>2.2. Information We Collect Automatically</h3>
      <ul>
        <li>
          <strong>Usage information</strong> &ndash; such as the pages and
          screens you view, features you use, time and date of your visits,
          referral sources, and in-app events (for example, completion of a
          staking goal).
        </li>
        <li>
          <strong>Device and technical data</strong> &ndash; such as IP address,
          device type, operating system, browser type, language settings, app
          version, and crash or performance logs.
        </li>
        <li>
          <strong>Cookies and similar technologies</strong> &ndash; we may use
          cookies, local storage, or similar technologies to remember your
          preferences, improve performance, and analyze how the Services are
          used. You can control cookies through your browser settings, but
          disabling certain cookies may impact functionality.
        </li>
      </ul>

      <h3>2.3. Information from Third Parties</h3>
      <ul>
        <li>
          <strong>Analytics partners</strong> &ndash; we may receive aggregated
          or pseudonymous analytics data, campaign performance metrics, or
          attribution data from third-party analytics tools.
        </li>
        <li>
          <strong>Public blockchain data</strong> &ndash; we may analyze
          on-chain data (for example, transaction hashes or wallet balances
          associated with your linked addresses) for reconciliation or product
          analytics purposes.
        </li>
      </ul>

      <h2 id="how-we-use">3. How We Use Your Information</h2>
      <p>We use the information we collect for the following purposes:</p>
      <ul>
        <li>
          <strong>To provide and operate the Services</strong> &ndash; including
          creating and managing your account, processing deposits and
          withdrawals, maintaining staking positions, calculating and displaying
          rewards, and providing core wallet functionality.
        </li>
        <li>
          <strong>To communicate with you</strong> &ndash; including sending
          service emails (for example, security alerts, transaction
          confirmations, changes to terms or policies), responding to your
          enquiries, and providing customer support.
        </li>
        <li>
          <strong>To improve and develop the Services</strong> &ndash; including
          analyzing how users interact with features, measuring performance,
          fixing bugs, and designing new products or enhancements.
        </li>
        <li>
          <strong>For safety and security</strong> &ndash; including detecting
          and preventing unauthorized access, abuse, fraud, or other harmful
          activity, and enforcing our Terms of Service.
        </li>
        <li>
          <strong>For legal and regulatory purposes</strong> &ndash; including
          handling disputes, responding to lawful requests from regulators or
          authorities, enforcing our agreements, and protecting our rights or
          the rights of others.
        </li>
      </ul>

      <h2 id="legal-bases">4. Legal Bases for Processing</h2>
      <p>
        Where required by applicable data protection laws, we rely on one or
        more of the following legal bases to process your personal data:
      </p>
      <ul>
        <li>
          <strong>Performance of a contract</strong> &ndash; where processing is
          necessary to provide the Services to you or to take steps at your
          request before entering into a contract.
        </li>
        <li>
          <strong>Compliance with a legal obligation</strong> &ndash; where
          processing is necessary to comply with our legal or regulatory
          obligations.
        </li>
        <li>
          <strong>Legitimate interests</strong> &ndash; where processing is
          necessary for our legitimate interests or those of a third party, and
          those interests are not overridden by your data protection rights (for
          example, to improve the Services, prevent abuse, or defend legal
          claims).
        </li>
        <li>
          <strong>Consent</strong> &ndash; where we rely on your consent to
          process certain data (for example, some marketing communications or
          optional analytics). You may withdraw your consent at any time, but
          this will not affect the lawfulness of processing prior to withdrawal.
        </li>
      </ul>

      <h2 id="sharing">5. How We Share Information</h2>
      <p>
        We do <strong>not</strong> sell your personal data. We may share your
        information in the following circumstances:
      </p>
      <ul>
        <li>
          <strong>Service providers</strong> &ndash; with third-party vendors
          who help us deliver the Services (for example, cloud hosting,
          analytics platforms, customer support tools), subject to appropriate
          contractual safeguards.
        </li>
        <li>
          <strong>Professional advisers</strong> &ndash; with lawyers, auditors,
          and other professional advisers where necessary for the purposes
          described above.
        </li>
        <li>
          <strong>Regulators and authorities</strong> &ndash; where required by
          law or where we believe in good faith that such disclosure is
          reasonably necessary to comply with legal obligations, respond to
          lawful requests, protect our rights, or protect the safety of users or
          others.
        </li>
        <li>
          <strong>Corporate transactions</strong> &ndash; in connection with a
          merger, acquisition, restructuring, or sale of assets, where your
          information may be transferred as part of that transaction, subject to
          appropriate safeguards.
        </li>
        <li>
          <strong>With your consent</strong> &ndash; where you have specifically
          agreed that we may share certain information in a particular way.
        </li>
      </ul>

      <h2 id="transfers">6. International Transfers</h2>
      <p>
        Novunt may process and store your information in countries outside your
        country of residence. Where required by law, we will ensure that
        appropriate safeguards are in place for such transfers, such as standard
        contractual clauses or equivalent mechanisms.
      </p>

      <h2 id="retention">7. Data Retention</h2>
      <p>
        We retain personal data for as long as necessary to fulfil the purposes
        described in this Policy, including to comply with our legal and
        regulatory obligations, resolve disputes, and enforce our agreements.
        When your data is no longer needed, we will securely delete or anonymize
        it.
      </p>

      <h2 id="security">8. Security</h2>
      <p>
        We take reasonable technical and organisational measures designed to
        protect your information from unauthorised access, loss, misuse, or
        alteration. However, no system can be completely secure, and we cannot
        guarantee the absolute security of your data.
      </p>

      <h2 id="your-rights">9. Your Rights and Choices</h2>
      <p>
        Depending on your location and applicable law, you may have certain
        rights in relation to your personal data, including:
      </p>
      <ul>
        <li>the right to access a copy of your personal data;</li>
        <li>the right to request correction of inaccurate data;</li>
        <li>
          the right to request deletion of your data, subject to legal
          obligations;
        </li>
        <li>the right to object to or restrict certain processing; and</li>
        <li>
          the right to data portability, where applicable (to receive your data
          in a structured, commonly used, machine-readable format).
        </li>
      </ul>
      <p>
        To exercise any of these rights, please contact us at the Support
        section in the app. We will respond to your request within a reasonable
        timeframe and in accordance with applicable law.
      </p>

      <h2 id="children">10. Children&apos;s Privacy</h2>
      <p>
        The Services are not intended for, and we do not knowingly collect
        personal data from, children under the age of 18. If we become aware
        that we have collected personal data from a child in violation of this
        Policy, we will take steps to delete that information.
      </p>

      <h2 id="links">11. Third-Party Links and Services</h2>
      <p>
        The Services may contain links to third-party websites or services that
        are not operated by Novunt. We are not responsible for the privacy
        practices or content of such third parties. We encourage you to review
        the privacy policies of any third-party services you use.
      </p>

      <h2 id="changes">12. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        post the updated version on this page and update the &quot;Last
        updated&quot; date above. Your continued use of the Services after any
        changes to this Policy constitutes your acceptance of the updated
        Policy.
      </p>

      <h2 id="contact">13. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy or how we handle
        your personal data, you can contact us at: the Support section in the
        app.
      </p>
    </div>
  );
}
