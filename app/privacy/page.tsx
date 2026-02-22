import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export const metadata = {
  title: "Privacy Policy | Center for Admission and Travels",
  description: "Privacy Policy for Center for Admission and Travels (CFAAT) — how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground mb-10">
              Last updated: February 2026
            </p>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  1. Introduction
                </h2>
                <p>
                  Center for Admission and Travels (&quot;CFAAT,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website, use our mobile applications, or engage with our services (collectively, the &quot;Services&quot;).
                </p>
                <p className="mt-3">
                  By using our Services, you consent to the data practices described in this policy. If you do not agree, please discontinue use of our Services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  2. Information We Collect
                </h2>
                <p>We collect the following types of personal information:</p>

                <h3 className="text-lg font-medium text-foreground mt-4 mb-2">a) Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-foreground">Account Information:</strong> Full name, email address, phone number, username, and password when you create an account.</li>
                  <li><strong className="text-foreground">Profile Information:</strong> Profile photos, biographical details, and preferences you choose to share.</li>
                  <li><strong className="text-foreground">Application Data:</strong> Educational records, employment history, passport details, and other documents submitted for study abroad or work abroad services.</li>
                  <li><strong className="text-foreground">Payment Information:</strong> Payment details processed securely through Paystack. We do not store your full card number, CVV, or PIN on our servers — this data is handled entirely by Paystack in compliance with PCI-DSS standards.</li>
                  <li><strong className="text-foreground">Communication Data:</strong> Messages, enquiries, and feedback you send to us.</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-4 mb-2">b) Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information (browser type, operating system, device identifiers).</li>
                  <li>IP address and approximate geolocation.</li>
                  <li>Pages visited, time spent, and navigation patterns on our website.</li>
                  <li>Referral URLs and search terms used to find our website.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  3. How We Use Your Information
                </h2>
                <p>We use the information collected to:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Provide, maintain, and improve our Services.</li>
                  <li>Process your bookings, applications, and payments.</li>
                  <li>Communicate with you regarding your account, transactions, and service updates.</li>
                  <li>Send promotional materials and newsletters (with your consent; you may opt out at any time).</li>
                  <li>Personalise your experience and recommend relevant services.</li>
                  <li>Comply with legal obligations and resolve disputes.</li>
                  <li>Detect, prevent, and address fraud or security issues.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  4. Third-Party Services
                </h2>
                <p>We use trusted third-party services to operate our platform:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>
                    <strong className="text-foreground">Paystack:</strong> We use Paystack to process all payments securely. When you make a payment, your financial data is handled directly by Paystack in accordance with their privacy policy and PCI-DSS compliance standards. We only receive transaction confirmation details (amount, status, reference) — not your full card information.
                  </li>
                  <li>
                    <strong className="text-foreground">Cloudinary:</strong> We use Cloudinary for image storage and delivery. Profile photos and other images you upload are stored on Cloudinary&apos;s servers. Cloudinary processes this data in accordance with their privacy policy.
                  </li>
                </ul>
                <p className="mt-3">
                  We may also share data with universities, embassies, employers, airlines, and hotels as necessary to deliver the services you have requested. We only share the minimum information required to fulfil your request.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  5. Cookies and Tracking Technologies
                </h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience. Cookies are small data files stored on your device that help us remember your preferences, analyse usage patterns, and improve site performance.
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li><strong className="text-foreground">Essential Cookies:</strong> Required for the website to function properly (e.g., authentication, session management).</li>
                  <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how visitors use our website so we can improve it.</li>
                  <li><strong className="text-foreground">Preference Cookies:</strong> Remember your settings and preferences for future visits.</li>
                </ul>
                <p className="mt-3">
                  You can control cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of our website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  6. Data Security
                </h2>
                <p>
                  We implement appropriate technical and organisational measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Encryption of data in transit (SSL/TLS) and at rest.</li>
                  <li>Secure password hashing and storage.</li>
                  <li>Regular security audits and vulnerability assessments.</li>
                  <li>Access controls limiting employee access to personal data on a need-to-know basis.</li>
                </ul>
                <p className="mt-3">
                  While we strive to protect your information, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  7. Your Rights
                </h2>
                <p>Depending on applicable laws, you may have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you.</li>
                  <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate or incomplete information.</li>
                  <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
                  <li><strong className="text-foreground">Objection:</strong> Object to processing of your data for marketing purposes.</li>
                  <li><strong className="text-foreground">Data Portability:</strong> Request your data in a structured, commonly used, machine-readable format.</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, please contact us using the information provided below. We will respond to your request within a reasonable timeframe.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  8. Children&apos;s Privacy
                </h2>
                <p>
                  Our Services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child without parental consent, we will take steps to delete that information promptly. If you believe a child has provided us with personal data, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  9. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. The updated policy will be posted on this page with a revised &quot;Last updated&quot; date. We encourage you to review this policy periodically. Your continued use of our Services after any changes constitutes your acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  10. Contact Information
                </h2>
                <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:</p>
                <div className="mt-3 bg-slate-50 rounded-lg p-5 space-y-2">
                  <p>
                    <strong className="text-foreground">Center for Admission and Travels (CFAAT)</strong>
                  </p>
                  <p>
                    Email:{" "}
                    <a href="mailto:info@centerforadmissionandtravels.com" className="text-primary hover:underline">
                      info@centerforadmissionandtravels.com
                    </a>
                  </p>
                  <p>
                    Phone:{" "}
                    <a href="tel:+233248422663" className="text-primary hover:underline">
                      +233 248 422 663
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
