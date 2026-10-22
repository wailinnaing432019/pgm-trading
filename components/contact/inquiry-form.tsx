"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { CheckCircle2, FileText, Loader2, Send } from "lucide-react";
import { submitInquiry, type ActionState } from "@/lib/actions/public";
import { useLanguage } from "@/lib/i18n";
import { WhatsAppIcon, ViberIcon } from "@/components/ui/trade-icons";
import { viberHref, whatsappHref } from "@/lib/contact-links";

const initialState: ActionState = { ok: false };

export function InquiryForm({
  initialSubject = "",
  initialTab = "rfq",
  whatsapp = "+959 123 456 789",
  viber = "+959 123 456 789",
}: {
  initialSubject?: string;
  initialTab?: "general" | "rfq";
  phone?: string;
  whatsapp?: string;
  viber?: string;
}) {
  const [tab, setTab] = useState<"general" | "rfq">(initialTab);
  const [state, action, pending] = useActionState<ActionState, FormData>(submitInquiry, initialState);
  const { t } = useLanguage();

  // RFQ State fields to combine into message
  const [company, setCompany] = useState("");
  const [volume, setVolume] = useState("");
  const [incoterm, setIncoterm] = useState("FOB Yangon Port");
  const [destinationPort, setDestinationPort] = useState("");
  const [packaging, setPackaging] = useState("50kg PP Bags");

  const quickWhatsappMessage = `Hello PGM Trade Desk, I would like to request an official quote for: ${
    initialSubject || "agricultural commodities"
  }`;
  const whatsappUrl = whatsappHref(whatsapp, quickWhatsappMessage);
  const viberUrl = viberHref(viber);

  return (
    <div className="card-surface overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 md:p-8 shadow-sm">
      {/* Mode Switcher */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-sand-200 pb-5">
        <div className="flex rounded-xl bg-sand-100 p-1">
          <button
            type="button"
            onClick={() => setTab("rfq")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              tab === "rfq"
                ? "bg-forest-900 text-cream shadow-sm"
                : "text-forest-800 hover:text-forest-950"
            }`}
          >
            <FileText className="h-4 w-4" />
            {t.rfq.tabRfq}
          </button>
          <button
            type="button"
            onClick={() => setTab("general")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              tab === "general"
                ? "bg-forest-900 text-cream shadow-sm"
                : "text-forest-800 hover:text-forest-950"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            {t.rfq.tabGeneral}
          </button>
        </div>

        {/* Instant Chat Shortcuts */}
        <div className="flex items-center gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-600 hover:text-white"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4 text-emerald-600 group-hover:text-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
          {viberUrl && (
            <a
              href={viberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 transition-colors hover:bg-purple-600 hover:text-white"
              title="Chat on Viber"
            >
              <ViberIcon className="h-4 w-4 text-purple-600 group-hover:text-white" />
              <span className="hidden sm:inline">Viber</span>
            </a>
          )}
        </div>
      </div>

      <form action={action} className="grid gap-5">
        {/* RFQ Structured Fields */}
        {tab === "rfq" && (
          <div className="rounded-xl border border-sand-200/90 bg-sand-50/60 p-4 sm:p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-forest-800">
              Commercial Trade Specifications
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-forest-900">
                  {t.rfq.companyName}
                </label>
                <input
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t.rfq.companyPlaceholder}
                  className="h-11 w-full rounded-lg border border-sand-200 bg-white px-3.5 text-sm focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-forest-900">
                  {t.rfq.volume}
                </label>
                <input
                  required
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder={t.rfq.volumePlaceholder}
                  className="h-11 w-full rounded-lg border border-sand-200 bg-white px-3.5 text-sm focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-forest-900">
                  {t.rfq.incoterm}
                </label>
                <select
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                  className="h-11 w-full rounded-lg border border-sand-200 bg-white px-3.5 text-sm focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600/20"
                >
                  <option value="FOB Yangon Port (AWPT / Sule)">FOB Yangon Port (AWPT / Sule)</option>
                  <option value="FOB Thilawa Port (MITT)">FOB Thilawa Port (MITT)</option>
                  <option value="CIF Destination Port">CIF Destination Port</option>
                  <option value="CFR (Cost and Freight)">CFR (Cost and Freight)</option>
                  <option value="Ex-Warehouse Yangon / Mandalay">Ex-Warehouse (Domestic Distribution)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-forest-900">
                  {t.rfq.destinationPort}
                </label>
                <input
                  required
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  placeholder={t.rfq.destinationPlaceholder}
                  className="h-11 w-full rounded-lg border border-sand-200 bg-white px-3.5 text-sm focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-forest-900">
                  {t.rfq.packaging}
                </label>
                <input
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  placeholder={t.rfq.packagingPlaceholder}
                  className="h-11 w-full rounded-lg border border-sand-200 bg-white px-3.5 text-sm focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact info grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="inquiry-name" className="mb-1.5 block text-xs font-semibold text-forest-900">
              {t.rfq.fullName}
            </label>
            <input
              id="inquiry-name"
              name="name"
              required
              placeholder="U Win Myint / John Smith"
              className="h-11 w-full rounded-xl border border-sand-200 bg-cream/50 px-3.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          <div>
            <label htmlFor="inquiry-email" className="mb-1.5 block text-xs font-semibold text-forest-900">
              {t.rfq.workEmail}
            </label>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              required
              placeholder="procurement@company.com"
              className="h-11 w-full rounded-xl border border-sand-200 bg-cream/50 px-3.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          <div>
            <label htmlFor="inquiry-phone" className="mb-1.5 block text-xs font-semibold text-forest-900">
              {t.rfq.phoneOrViber}
            </label>
            <input
              id="inquiry-phone"
              name="phone"
              required
              placeholder="+95 9… / +65 … / +91 …"
              className="h-11 w-full rounded-xl border border-sand-200 bg-cream/50 px-3.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </div>

          <div>
            <label htmlFor="inquiry-subject" className="mb-1.5 block text-xs font-semibold text-forest-900">
              {t.rfq.subject}
            </label>
            <input
              id="inquiry-subject"
              name="subject"
              required
              defaultValue={initialSubject || (tab === "rfq" ? "Official RFQ Trade Enquiry" : "General Trade Enquiry")}
              className="h-11 w-full rounded-xl border border-sand-200 bg-cream/50 px-3.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="inquiry-message" className="mb-1.5 block text-xs font-semibold text-forest-900">
            {tab === "rfq" ? t.rfq.message : "Message *"}
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            required
            rows={4}
            placeholder={tab === "rfq" ? t.rfq.messagePlaceholder : "Describe your trade inquiry or questions…"}
            className="w-full rounded-xl border border-sand-200 bg-cream/50 px-3.5 py-2.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </div>

        {/* Hidden inputs to pass RFQ metadata to Server Action */}
        {tab === "rfq" && (
          <>
            <input type="hidden" name="rfq_company" value={company} />
            <input type="hidden" name="rfq_volume" value={volume} />
            <input type="hidden" name="rfq_incoterm" value={incoterm} />
            <input type="hidden" name="rfq_destination" value={destinationPort} />
            <input type="hidden" name="rfq_packaging" value={packaging} />
          </>
        )}

        {state.fieldErrors?.message ? (
          <p className="text-sm text-soil-700">{state.fieldErrors.message[0]}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest-900 px-8 text-sm font-semibold text-cream transition-colors hover:bg-forest-950 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {tab === "rfq" ? t.rfq.submitRfq : t.rfq.submitGeneral}
          </button>

          {state.ok ? (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800" role="status">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              {t.rfq.successMessage}
            </p>
          ) : state.error ? (
            <p className="text-sm font-medium text-soil-700" role="alert">{state.error}</p>
          ) : null}
        </div>
      </form>
    </div>
  );
}