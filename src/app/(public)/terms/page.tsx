import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Novunt Terms of Service governing use of the Novunt platform, wallets, USDT staking, deposits, withdrawals, referrals, and related services.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="prose prose-invert max-w-3xl space-y-6">
      <h1>Novunt Terms of Service</h1>
      <p className="text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString('en-US')}
      </p>

      <p>
        These Terms of Service (the <strong>&quot;Terms&quot;</strong>) form a
        legally binding agreement between you (
        <strong>&quot;you&quot; or &quot;User&quot;</strong>) and Novunt (
        <strong>&quot;Novunt&quot;</strong>, <strong>&quot;we&quot;</strong>, or{' '}
        <strong>&quot;us&quot;</strong>) governing your access to and use of the
        Novunt website, mobile and web applications, APIs, and related products
        and services (collectively, the{' '}
        <strong>&quot;Services&quot;</strong>).
      </p>

      <p>
        By accessing or using the Services, you agree to be bound by these
        Terms. If you do not agree, you must not access or use the Services.
        This document is provided for informational purposes only and does not
        constitute legal, financial, investment, tax, or other professional
        advice.
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
            <a href="#eligibility">Eligibility &amp; restricted countries</a>
          </li>
          <li>
            <a href="#services">How the Novunt app works</a>
          </li>
          <li>
            <a href="#no-advice">No investment, tax, or legal advice</a>
          </li>
          <li>
            <a href="#risk">Risk disclosure &amp; no guaranteed returns</a>
          </li>
          <li>
            <a href="#accounts">Accounts and security</a>
          </li>
          <li>
            <a href="#deposits">Deposits, staking, rewards, withdrawals</a>
          </li>
          <li>
            <a href="#prohibited">Prohibited activities</a>
          </li>
          <li>
            <a href="#liability">Disclaimers &amp; limitation of liability</a>
          </li>
          <li>
            <a href="#governing-law">Governing law &amp; disputes</a>
          </li>
        </ol>
      </nav>

      <h2 id="eligibility">1. Eligibility and Restricted Jurisdictions</h2>
      <p>
        You may use the Services only if you meet <strong>all</strong> of the
        following conditions:
      </p>
      <ul>
        <li>You are at least 18 years old and have full legal capacity;</li>
        <li>
          You are acting on your own behalf and not on behalf of any other
          person unless you are duly authorized to do so;
        </li>
        <li>
          You are not a resident of, located in, or otherwise accessing the
          Services from a jurisdiction where the offering or use of services
          involving digital asset staking, yield, or similar products is
          prohibited, or where Novunt would be required to hold a licence,
          registration, or authorization that it does not currently possess;
        </li>
        <li>
          You are not subject to any trade, financial, or economic sanctions or
          on any applicable sanctions list (including, without limitation, any
          list administered by the United Nations, the European Union, or the
          United States).
        </li>
      </ul>
      <p>
        It is <strong>your responsibility</strong> to determine whether use of
        the Services is legal in your jurisdiction and to comply with all laws
        and regulations that apply to you. Novunt may, at its sole discretion,
        restrict or block access to the Services in any jurisdiction at any time
        without notice.
      </p>

      <h2 id="services">2. Description of the Services</h2>
      <p>
        Novunt provides a digital platform that allows eligible Users to, among
        other things:
      </p>
      <ul>
        <li>view balances in one or more in-app wallets;</li>
        <li>
          deposit supported digital assets (currently denominated in USDT on
          supported networks such as BEP20);
        </li>
        <li>
          create and manage staking positions as part of Novunt&apos;s
          &quot;Smart Goal Staking&quot; model, which targets an accumulated
          reward profile (for example, a 200% accumulated ROS target) but does{' '}
          <strong>not</strong> guarantee any particular return;
        </li>
        <li>
          participate in other reward models, such as Performance and Premium
          pools, promotional campaigns, referral programs, or bonuses, when and
          if made available; and
        </li>
        <li>
          access dashboards, analytics, notifications, educational content, and
          customer support tools related to such activities.
        </li>
      </ul>
      <p>
        Novunt may add, modify, or remove features at any time. Certain features
        may be offered as beta or experimental and may change without notice.
      </p>

      <h2 id="no-advice">3. No Investment, Tax, or Legal Advice</h2>
      <p>
        Novunt <strong>does not provide</strong> investment, financial, tax,
        legal, accounting, or other professional advice and{' '}
        <strong>
          does not act as a broker, dealer, exchange, investment adviser, or bank
        </strong>
        . Any information provided through the Services (including returns
        illustrations, APY/APR figures, marketing copy, blog posts,
        notifications, or in-app tips) is for{' '}
        <strong>general informational and educational purposes only</strong>.
      </p>
      <p>
        You are solely responsible for your own decisions to deposit, stake,
        withdraw, or otherwise deal in digital assets and should consult your own
        independent professional advisors before making any financial, legal,
        tax, or other decisions.
      </p>

      <h2 id="risk">4. Risk Disclosure</h2>
      <p>
        Digital assets are highly speculative and involve significant risk of
        loss, including the possible <strong>loss of your entire stake</strong>.
        By using the Services, you acknowledge and agree that:
      </p>
      <ul>
        <li>
          The value of digital assets (including USDT and any rewards you may
          earn) is highly volatile and may change rapidly.
        </li>
        <li>
          Any target return (including references to 200% accumulated ROS,
          bonuses, or &quot;up to&quot; reward figures) is{' '}
          <strong>illustrative only</strong>, based on assumptions that may not
          hold, and is <strong>not guaranteed</strong>.
        </li>
        <li>
          Past performance is not indicative of future results. You may receive
          lower rewards than expected or no rewards at all.
        </li>
        <li>
          Network-level risks (including blockchain congestion, smart contract
          bugs, protocol failures, forks, or changes to protocol rules) may
          adversely affect your assets, rewards, or ability to withdraw.
        </li>
        <li>
          Novunt may rely on third-party service providers (including custodians,
          data providers, and smart contract platforms). Failures or breaches at
          these providers may impact your use of the Services.
        </li>
        <li>
          Digital assets held through Novunt are{' '}
          <strong>
            not deposits, not legal tender, not backed by any government, and are
            not covered by any deposit insurance or investor protection scheme
          </strong>{' '}
          (such as FDIC or similar).
        </li>
      </ul>
      <p>
        You should only stake or deposit funds that you can afford to lose and
        you remain solely responsible for understanding and accepting all
        associated risks.
      </p>

      <h2 id="accounts">5. Accounts and Security</h2>
      <p>
        To use the Services, you are required to create an account by providing
        your name, username, and email address.
      </p>
      <ul>
        <li>
          You agree to provide accurate, current, and complete information and to
          promptly update it when it changes.
        </li>
        <li>
          You are responsible for maintaining the confidentiality of your login
          credentials and for all activity that occurs under your account.
        </li>
        <li>
          You must promptly notify us at{' '}
          <a href="mailto:support@novunt.com">support@novunt.com</a> if you
          suspect unauthorized use of your account or a security breach.
        </li>
        <li>
          Novunt may, at its discretion and without liability, suspend, restrict,
          or terminate your access to some or all Services if we suspect fraud,
          abuse, violation of these Terms, or to comply with applicable law or
          requests from competent authorities.
        </li>
      </ul>

      <h2 id="deposits">6. Deposits, Staking, Rewards, and Withdrawals</h2>
      <p>
        The Services may allow you to deposit supported digital assets, create
        stakes, earn rewards, and withdraw assets, subject to conditions
        published in the app and these Terms.
      </p>
      <ul>
        <li>
          <strong>Supported assets and networks.</strong> Only assets and networks
          explicitly supported in the app may be deposited or staked. Deposits
          sent via unsupported networks or to incorrect addresses may be
          permanently lost.
        </li>
        <li>
          <strong>Staking and ROS model.</strong> Smart Goal Staking and
          accumulated ROS models are internal reward frameworks used by Novunt.
          They do not create any contractual right to a specific rate of return
          or a fixed timeline to reach a particular percentage.
        </li>
        <li>
          <strong>Performance &amp; Premium pools.</strong> Any pools or bonus
          programs are discretionary and may be modified, paused, or discontinued
          at any time without notice.
        </li>
        <li>
          <strong>Fees.</strong> Novunt may charge fees (including but not limited
          to deposit, withdrawal, staking, or performance fees). Fees, if any,
          will be disclosed in the app or in related documentation and may be
          updated from time to time.
        </li>
        <li>
          <strong>Withdrawals and lockups.</strong> Certain positions may be
          subject to lock periods, notice periods, protocol-level unbonding, or
          minimum/maximum limits. Network congestion or technical issues may
          delay withdrawals.
        </li>
        <li>
          <strong>Errors and adjustments.</strong> If a reward, bonus, or credit
          is displayed or paid in error, Novunt may correct the error and reverse
          or adjust the relevant transaction to the correct amount.
        </li>
      </ul>

      <h2 id="prohibited">7. Prohibited Activities</h2>
      <p>
        You agree not to use the Services for any unlawful purpose or in any way
        that violates these Terms. Without limitation, you must not:
      </p>
      <ul>
        <li>
          use the Services in violation of any applicable sanctions, export
          controls, or anti-money laundering laws;
        </li>
        <li>
          engage in fraud, market manipulation, wash trading, or other abusive or
          deceptive conduct;
        </li>
        <li>
          interfere with or disrupt the integrity, performance, or security of
          the Services, or attempt to gain unauthorized access to any systems or
          data;
        </li>
        <li>
          use bots or automated scripts in a way that overloads or harms the
          Services;
        </li>
        <li>
          decompile, reverse engineer, or attempt to derive the source code of
          any component of the Services, except to the extent such restriction is
          prohibited by applicable law;
        </li>
        <li>
          use the Services to transmit or store malicious code, spam, or content
          that is unlawful, harmful, or infringing.
        </li>
      </ul>

      <h2 id="ip">8. Intellectual Property</h2>
      <p>
        The Services, including all content, trademarks, logos, visual
        interfaces, graphics, design, compilation, information, software, and
        other materials (excluding your own content and third-party content) are
        owned by or licensed to Novunt and are protected by applicable
        intellectual property laws.
      </p>
      <p>
        Novunt grants you a limited, non-exclusive, non-transferable, revocable
        licence to access and use the Services for your personal, non-commercial
        use in accordance with these Terms. You obtain no ownership rights in the
        Services or any related intellectual property.
      </p>

      <h2 id="third-parties">9. Third-Party Services</h2>
      <p>
        The Services may integrate or interoperate with third-party websites,
        applications, smart contracts, wallets, or other services. Novunt does
        not control and is not responsible for any third-party services and does
        not endorse or assume any liability for them.
      </p>
      <p>
        Your use of third-party services is at your own risk and may be subject
        to separate terms and privacy policies between you and the relevant third
        party.
      </p>

      <h2 id="disclaimer">10. Disclaimer of Warranties</h2>
      <p>
        To the fullest extent permitted by law, the Services are provided on an{' '}
        <strong>&quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</strong> basis,
        without any warranties of any kind, whether express, implied, or
        statutory, including but not limited to warranties of merchantability,
        fitness for a particular purpose, non-infringement, or that the Services
        will be uninterrupted, error-free, secure, or free of harmful components.
      </p>

      <h2 id="liability">11. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, in no event will Novunt, its
        affiliates, or their respective directors, officers, employees, or agents
        be liable for:
      </p>
      <ul>
        <li>
          any indirect, incidental, special, consequential, punitive, or
          exemplary damages; or
        </li>
        <li>
          any loss of profits, revenue, data, goodwill, or other intangible
          losses,
        </li>
      </ul>
      <p>
        arising out of or in connection with your use of, or inability to use,
        the Services, whether based on warranty, contract, tort (including
        negligence), strict liability, or any other legal theory, even if Novunt
        has been advised of the possibility of such damages.
      </p>
      <p>
        To the extent Novunt is found liable, our aggregate liability to you for
        all claims arising out of or relating to the Services or these Terms will
        not exceed the total fees, if any, paid by you to Novunt for the
        Services giving rise to the claim during the six (6) months immediately
        preceding the event giving rise to the claim.
      </p>

      <h2 id="indemnity">12. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless Novunt, its
        affiliates, and their respective directors, officers, employees, and
        agents from and against any and all claims, losses, damages, liabilities,
        costs, and expenses (including reasonable legal fees) arising out of or
        in connection with:
      </p>
      <ul>
        <li>your use of or access to the Services;</li>
        <li>your violation of these Terms or any applicable law; or</li>
        <li>
          any claim that your content or conduct infringes or misappropriates the
          rights of any third party.
        </li>
      </ul>

      <h2 id="changes">13. Changes to the Services and Terms</h2>
      <p>
        Novunt may modify or discontinue any part of the Services at any time,
        with or without notice. We may also update these Terms from time to time.
        When we do, we will post the updated version on this page and update the
        &quot;Last updated&quot; date above.
      </p>
      <p>
        Your continued use of the Services after any changes to the Terms
        constitutes your acceptance of the updated Terms. If you do not agree to
        the updated Terms, you must stop using the Services.
      </p>

      <h2 id="governing-law">14. Governing Law and Dispute Resolution</h2>
      <p>
        These Terms and any dispute or claim arising out of or in connection with
        them or their subject matter or formation (including non-contractual
        disputes or claims) will be governed by and construed in accordance with
        the laws of the jurisdiction in which Novunt is incorporated, without
        giving effect to any choice or conflict of law rules.
      </p>
      <p>
        Any dispute arising out of or relating to these Terms or the Services
        shall be subject to the exclusive jurisdiction of the courts of that
        jurisdiction, unless mandatory consumer protection laws in your country
        of residence require otherwise.
      </p>

      <h2 id="misc">15. Miscellaneous</h2>
      <p>
        If any provision of these Terms is held to be invalid, illegal, or
        unenforceable, that provision will be enforced to the maximum extent
        permissible and the remaining provisions will remain in full force and
        effect.
      </p>
      <p>
        Our failure to enforce any right or provision of these Terms will not be
        considered a waiver of those rights. These Terms constitute the entire
        agreement between you and Novunt regarding the Services and supersede and
        replace any prior agreements or understandings.
      </p>

      <h2 id="contact">16. Contact Us</h2>
      <p>
        If you have any questions about these Terms or the Services, you can
        contact us at:{' '}
        <a href="mailto:support@novunt.com">support@novunt.com</a>.
      </p>
    </div>
  );
}
