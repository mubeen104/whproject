import { useStoreSettings } from '@/hooks/useStoreSettings';

export default function AboutUs() {
  const { storeName } = useStoreSettings();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8"><em>Effective Date: August 1, 2025</em></p>
          
          <div className="space-y-8 text-foreground">
            <section>
              <p>
                <strong>{storeName}</strong> operates this website and online store, including all associated features, tools, products, content, and services (collectively, the "Services"), to provide you with a personalized and convenient shopping experience. Our Services are powered by Shopify, which enables us to manage and deliver these Services effectively.
              </p>
              
              <p>
                This Privacy Policy outlines how we collect, use, and disclose your personal information when you access or use our Services, make a purchase, or otherwise interact with us. In the event of any conflict between this Privacy Policy and our Terms of Service regarding the collection or handling of personal information, this Privacy Policy will prevail.
              </p>
              
              <p>
                By accessing or using the Services, you acknowledge that you have read, understood, and agreed to the collection, use, and disclosure of your personal information as described herein.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Personal Information We Collect</h2>
              <p>
                "Personal information" refers to data that identifies, relates to, or could reasonably be linked to an individual. This excludes anonymized or aggregated information.
              </p>
              
              <p>We may collect and process the following categories of personal information:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contact Information:</strong> Name, billing/shipping address, phone number, and email address.</li>
                <li><strong>Account Details:</strong> Username, password, preferences, and other account settings.</li>
                <li><strong>Transactional Data:</strong> Items viewed, added to cart, purchased, returned, or exchanged.</li>
                <li><strong>Communications:</strong> Customer service inquiries, messages, or feedback.</li>
                <li><strong>Device & Usage Information:</strong> IP address, browser type, device identifiers, and browsing behavior.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Sources of Personal Information</h2>
              <p>We may collect personal information from the following sources:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Directly from you</strong>, such as when you register an account, place an order, or communicate with us.</li>
                <li><strong>Automatically</strong>, through cookies and other tracking technologies when you use the Services.</li>
                <li><strong>Service providers</strong>, who collect or process information on our behalf.</li>
                <li><strong>Third-party partners</strong>, such as marketing platforms or advertising networks.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Personal Information</h2>
              <p>Your personal information may be used for purposes including:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>To Provide and Improve Services:</strong> Fulfilling orders, processing payments, personalizing shopping experiences, managing accounts, handling returns, and enhancing site functionality.</li>
                <li><strong>Marketing and Promotions:</strong> Sending you promotional emails, advertisements, and offers tailored to your interests.</li>
                <li><strong>Security and Fraud Prevention:</strong> Detecting unauthorized activity, securing your account, and safeguarding our platform.</li>
                <li><strong>Customer Support:</strong> Responding to inquiries and providing ongoing support.</li>
                <li><strong>Legal Compliance:</strong> Meeting legal obligations and responding to regulatory inquiries or court orders.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Disclosure of Personal Information</h2>
              <p>We may share your personal information in the following contexts:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With service providers</strong> who assist with hosting, payment processing, shipping, analytics, marketing, and customer support.</li>
                <li><strong>With advertising and marketing partners</strong> for targeted advertising based on your interactions with our Services and others.</li>
                <li><strong>With affiliates or corporate entities</strong> within our business group.</li>
                <li><strong>With third parties</strong> as required by law, in connection with legal proceedings, or during a business transfer such as a merger or acquisition.</li>
                <li><strong>With your consent</strong> or at your direction, including through integrations with third-party platforms (e.g., social media or shipping partners).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Links to Third-Party Sites</h2>
              <p>
                Our Services may contain links to third-party websites or platforms. We are not responsible for the content, policies, or practices of these external sites. We encourage you to review their privacy policies before submitting any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
              <p>
                Our Services are not intended for individuals under the age of majority in their respective jurisdictions. We do not knowingly collect personal information from minors. If you are a parent or guardian and believe we have collected such data, please contact us to request deletion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security and Retention</h2>
              <p>
                We implement reasonable security measures to protect your information; however, no system is completely secure. Please avoid transmitting sensitive information through unsecured channels.
              </p>
              <p>
                We retain personal information only for as long as necessary to fulfill the purposes outlined in this policy, including legal, operational, and accounting requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights and Choices</h2>
              <p>Depending on your jurisdiction, you may have rights that include:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access/Know:</strong> Request access to the personal information we hold about you.</li>
                <li><strong>Delete:</strong> Request that we delete your personal information.</li>
                <li><strong>Correct:</strong> Request corrections to inaccurate data.</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format.</li>
                <li><strong>Manage Communications:</strong> Opt out of marketing emails by using the unsubscribe link provided. Non-promotional emails will still be sent regarding account activity or orders.</li>
              </ul>
              
              <p>
                To exercise your rights, contact us at the information below. We may need to verify your identity before fulfilling your request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Complaints</h2>
              <p>
                If you have concerns about our data practices, you may contact us directly using the information below. Depending on your location, you may also have the right to file a complaint with your local data protection authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">International Data Transfers</h2>
              <p>
                Your personal information may be stored or processed outside of your home country. Where required, we implement appropriate safeguards such as Standard Contractual Clauses to protect your data during international transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect operational, legal, or regulatory changes. The revised version will be posted on this page with an updated effective date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}