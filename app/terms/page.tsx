import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export const metadata = {
  title: "Terms and Conditions | Center for Admission and Travels",
  description: "Terms and Conditions for using Center for Admission and Travels (CFAAT) services.",
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Terms and Conditions
            </h1>
            <p className="text-sm text-muted-foreground mb-10">
              Last updated: February 2026
            </p>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  1. Introduction and Acceptance of Terms
                </h2>
                <p>
                  Welcome to Center for Admission and Travels (&quot;CFAAT,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms and Conditions govern your access to and use of our website, mobile applications, and all related services (collectively, the &quot;Services&quot;). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
                </p>
                <p className="mt-3">
                  CFAAT is a Ghanaian travel and admissions agency that assists individuals with studying abroad, working abroad, and travel planning. These Terms constitute a legally binding agreement between you and CFAAT.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  2. Description of Services
                </h2>
                <p>CFAAT provides the following services:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>
                    <strong className="text-foreground">Study Abroad Admissions:</strong> Assistance with university applications, admission processing, visa guidance, document preparation, and pre-departure orientation for students seeking to study at institutions outside Ghana.
                  </li>
                  <li>
                    <strong className="text-foreground">Work Abroad Placements:</strong> Facilitation of international employment opportunities, work permit guidance, job placement services, and relocation support for individuals seeking to work overseas.
                  </li>
                  <li>
                    <strong className="text-foreground">Travel &amp; Tours Packages:</strong> Planning and booking of domestic and international travel, including flights, accommodation, tour packages, group travel, and customised itineraries.
                  </li>
                </ul>
                <p className="mt-3">
                  We act as intermediaries between you and third-party service providers such as airlines, hotels, universities, and employers. While we strive to provide accurate information and reliable services, final decisions regarding admissions, visas, and employment rest with the respective institutions and authorities.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  3. User Accounts and Responsibilities
                </h2>
                <p>To access certain features of our Services, you may be required to create an account. You agree to:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Provide accurate, current, and complete information during registration.</li>
                  <li>Maintain and promptly update your account information to keep it accurate.</li>
                  <li>Maintain the security and confidentiality of your login credentials.</li>
                  <li>Accept responsibility for all activities that occur under your account.</li>
                  <li>Notify us immediately of any unauthorised use of your account.</li>
                </ul>
                <p className="mt-3">
                  We reserve the right to suspend or terminate accounts that violate these Terms, contain false information, or are used for fraudulent purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  4. Payment Terms
                </h2>
                <p>
                  All payments for our Services are processed securely through <strong className="text-foreground">Paystack</strong>, a licensed payment processor. By making a payment, you agree to Paystack&apos;s terms of service in addition to these Terms.
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Prices for services are quoted in <strong className="text-foreground">Ghana Cedis (GHS)</strong> unless otherwise stated. Payments may also be accepted in other supported currencies where applicable.</li>
                  <li>All fees are due at the time of booking or as specified in your service agreement.</li>
                  <li>You are responsible for any additional bank charges, currency conversion fees, or taxes that may apply to your transaction.</li>
                  <li>Payment confirmation will be sent to your registered email address upon successful processing.</li>
                  <li>For details on refunds, please refer to our <a href="/refund-policy" className="text-primary hover:underline font-medium">Refund Policy</a>.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  5. Booking and Cancellation
                </h2>
                <p>
                  Bookings are confirmed only upon receipt of full payment or the required deposit, and a confirmation notification from CFAAT. By making a booking, you confirm that all information provided is accurate.
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Cancellation requests must be submitted in writing to our email address.</li>
                  <li>Cancellation fees may apply depending on the type of service and the timing of the request. Please refer to our <a href="/refund-policy" className="text-primary hover:underline font-medium">Refund Policy</a> for detailed cancellation and refund schedules.</li>
                  <li>CFAAT reserves the right to cancel or modify a booking due to unforeseen circumstances, in which case you will be offered an alternative or a refund as applicable.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  6. Intellectual Property
                </h2>
                <p>
                  All content on our website and Services — including text, graphics, logos, images, software, and design elements — is the property of CFAAT or its licensors and is protected by applicable intellectual property laws. You may not:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Reproduce, distribute, or publicly display any content without prior written consent.</li>
                  <li>Use our branding, logos, or trademarks without authorisation.</li>
                  <li>Modify, reverse-engineer, or create derivative works from our Services.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  7. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, CFAAT shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of our Services. This includes, but is not limited to:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Visa refusals or delays caused by embassies or immigration authorities.</li>
                  <li>University admission rejections.</li>
                  <li>Travel disruptions, cancellations, or delays caused by airlines, hotels, or other third parties.</li>
                  <li>Employment-related issues with overseas employers.</li>
                  <li>Loss of data or any damages resulting from unauthorised access to your account.</li>
                </ul>
                <p className="mt-3">
                  Our total liability for any claim shall not exceed the amount you paid to CFAAT for the specific service giving rise to the claim.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  8. Privacy
                </h2>
                <p>
                  Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our{" "}
                  <a href="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </a>
                  , which forms part of these Terms. By using our Services, you consent to the practices described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  9. Governing Law
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising from or relating to these Terms or your use of our Services shall be subject to the exclusive jurisdiction of the courts of Ghana.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  10. Changes to Terms
                </h2>
                <p>
                  We reserve the right to update or modify these Terms at any time. Changes will be effective immediately upon posting the revised Terms on our website with an updated &quot;Last updated&quot; date. Your continued use of our Services after any changes constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  11. Contact Information
                </h2>
                <p>If you have any questions or concerns about these Terms, please contact us:</p>
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
