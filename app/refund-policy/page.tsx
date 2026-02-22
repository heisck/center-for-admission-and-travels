import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export const metadata = {
  title: "Refund Policy | Center for Admission and Travels",
  description: "Refund Policy for Center for Admission and Travels (CFAAT) — cancellation terms, refund timelines, and conditions.",
}

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Refund Policy
            </h1>
            <p className="text-sm text-muted-foreground mb-10">
              Last updated: February 2026
            </p>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  1. General Refund Conditions
                </h2>
                <p>
                  At Center for Admission and Travels (&quot;CFAAT&quot;), we strive to deliver excellent service. We understand that circumstances may change, and this Refund Policy outlines the conditions under which refunds may be issued for our services.
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>All refund requests must be submitted in writing via email to <a href="mailto:info@centerforadmissionandtravels.com" className="text-primary hover:underline">info@centerforadmissionandtravels.com</a>.</li>
                  <li>Refunds are processed based on the type of service, the stage of processing, and the cancellation timeline.</li>
                  <li>Administrative and processing fees may be deducted from refund amounts where applicable.</li>
                  <li>Refunds are subject to review and approval by our team.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  2. Travel Packages
                </h2>
                <p>
                  Refunds for travel and tour packages are determined by the timing of your cancellation request relative to the scheduled departure date:
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground border border-slate-200">Cancellation Timeline</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-foreground border border-slate-200">Refund Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 border border-slate-200">More than 30 days before departure</td>
                        <td className="px-4 py-3 border border-slate-200 font-medium text-foreground">80% refund</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="px-4 py-3 border border-slate-200">15 – 30 days before departure</td>
                        <td className="px-4 py-3 border border-slate-200 font-medium text-foreground">50% refund</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border border-slate-200">Less than 15 days before departure</td>
                        <td className="px-4 py-3 border border-slate-200 font-medium text-foreground">No refund</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>The 20% deduction on early cancellations covers administrative costs and third-party booking fees that may not be recoverable.</li>
                  <li>If CFAAT cancels a trip due to low enrolment or operational reasons, you will receive a full 100% refund or the option to reschedule.</li>
                  <li>No-shows (failure to appear on the departure date without prior cancellation) are not eligible for any refund.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  3. Study Abroad Services
                </h2>
                <p>
                  Refund eligibility for study abroad admission services depends on the stage of application processing:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>
                    <strong className="text-foreground">Application Fees:</strong> Non-refundable. These fees cover initial consultation, document review, and application submission to institutions.
                  </li>
                  <li>
                    <strong className="text-foreground">Service Fees (before processing begins):</strong> Up to 70% refundable if you cancel before CFAAT has commenced processing your application with the target institution.
                  </li>
                  <li>
                    <strong className="text-foreground">Service Fees (after processing begins):</strong> Non-refundable once applications have been submitted to institutions, as third-party fees and administrative work cannot be reversed.
                  </li>
                  <li>
                    <strong className="text-foreground">Visa Rejection:</strong> If your visa application is refused, CFAAT service fees are non-refundable. However, we may offer discounted re-application assistance on a case-by-case basis.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  4. Work Abroad Services
                </h2>
                <p>
                  Refund eligibility for work abroad placement services is as follows:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>
                    <strong className="text-foreground">Registration and Application Fees:</strong> Non-refundable. These cover profile creation, employer matching, and initial processing.
                  </li>
                  <li>
                    <strong className="text-foreground">Placement Fees (before job offer):</strong> Up to 50% refundable if you cancel before a job offer or placement has been secured.
                  </li>
                  <li>
                    <strong className="text-foreground">Placement Fees (after job offer):</strong> Non-refundable once a valid job offer or placement has been confirmed, regardless of whether you choose to accept or decline the offer.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  5. Payment Processing and Refund Method
                </h2>
                <p>
                  All payments are processed through <strong className="text-foreground">Paystack</strong>. Refunds will be handled as follows:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Approved refunds will be returned to the <strong className="text-foreground">original payment method</strong> used for the transaction.</li>
                  <li>Refund processing typically takes <strong className="text-foreground">7 – 14 business days</strong> from the date of approval, depending on your bank or payment provider.</li>
                  <li>CFAAT is not responsible for delays caused by banks, mobile money providers, or payment processors.</li>
                  <li>In cases where the original payment method is no longer available, we will work with you to arrange an alternative refund method.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  6. Force Majeure
                </h2>
                <p>
                  CFAAT shall not be held liable for cancellations, delays, or inability to provide services due to events beyond our reasonable control, including but not limited to:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Natural disasters, pandemics, or epidemics.</li>
                  <li>Government restrictions, travel bans, or border closures.</li>
                  <li>Civil unrest, wars, or acts of terrorism.</li>
                  <li>Strikes, labour disputes, or infrastructure failures.</li>
                </ul>
                <p className="mt-3">
                  In force majeure situations, CFAAT will make reasonable efforts to offer alternatives such as rescheduling, service credits, or partial refunds on a case-by-case basis.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  7. How to Request a Refund
                </h2>
                <p>To request a refund, please follow these steps:</p>
                <ol className="list-decimal pl-6 mt-3 space-y-2">
                  <li>Send an email to <a href="mailto:info@centerforadmissionandtravels.com" className="text-primary hover:underline">info@centerforadmissionandtravels.com</a> with the subject line: <strong className="text-foreground">&quot;Refund Request – [Your Name]&quot;</strong>.</li>
                  <li>Include your full name, booking or transaction reference number, service type, and the reason for your refund request.</li>
                  <li>Attach any supporting documents if applicable (e.g., visa refusal letter, medical certificate).</li>
                  <li>Our team will acknowledge your request within <strong className="text-foreground">3 business days</strong> and provide a resolution within <strong className="text-foreground">7 – 10 business days</strong>.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  8. Contact Information
                </h2>
                <p>For any questions regarding this Refund Policy, please reach out to us:</p>
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
