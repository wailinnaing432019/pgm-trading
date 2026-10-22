"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "my";

export interface Translations {
  nav: {
    home: string;
    about: string;
    products: string;
    services: string;
    news: string;
    contact: string;
    getQuote: string;
    tradeDesk: string;
  };
  trade: {
    export: string;
    import: string;
    both: string;
    rentable: string;
    indicativePrice: string;
    priceOnRequest: string;
    origin: string;
    tradingMode: string;
    enquireProduct: string;
    whatsappEnquiry: string;
    viberEnquiry: string;
    talkToExportDesk: string;
    preferCall: string;
  };
  rfq: {
    title: string;
    subtitle: string;
    tabGeneral: string;
    tabRfq: string;
    companyName: string;
    companyPlaceholder: string;
    volume: string;
    volumePlaceholder: string;
    incoterm: string;
    destinationPort: string;
    destinationPlaceholder: string;
    packaging: string;
    packagingPlaceholder: string;
    fullName: string;
    workEmail: string;
    phoneOrViber: string;
    subject: string;
    message: string;
    messagePlaceholder: string;
    submitGeneral: string;
    submitRfq: string;
    successMessage: string;
  };
  trust: {
    credentialsTitle: string;
    credentialsSubtitle: string;
    regTitle: string;
    regSubtitle: string;
    licenseTitle: string;
    licenseSubtitle: string;
    mpbsaTitle: string;
    mpbsaSubtitle: string;
    mrfTitle: string;
    mrfSubtitle: string;
    qualityTitle: string;
    qualitySubtitle: string;
    portTitle: string;
    portSubtitle: string;
  };
  floating: {
    tradeDesk: string;
    chatWhatsapp: string;
    chatViber: string;
    instantRfq: string;
  };
}

const dictionaries: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      products: "Products",
      services: "Services",
      news: "News",
      contact: "Contact",
      getQuote: "Get a Quote",
      tradeDesk: "Trade Desk",
    },
    trade: {
      export: "Export",
      import: "Import",
      both: "Import & Export",
      rentable: "Rentable",
      indicativePrice: "Indicative Price",
      priceOnRequest: "Price on Request",
      origin: "Origin",
      tradingMode: "Trading Mode",
      enquireProduct: "Enquire About This Product",
      whatsappEnquiry: "Inquire via WhatsApp",
      viberEnquiry: "Inquire via Viber",
      talkToExportDesk: "Talk to Export Desk",
      preferCall: "Prefer to talk? Call",
    },
    rfq: {
      title: "Request for Quotation (RFQ) & Trade Desk",
      subtitle: "Connect with our Yangon export/import trade desks for commercial quotes, specifications and contracts.",
      tabGeneral: "General Inquiry",
      tabRfq: "Request Official RFQ (B2B)",
      companyName: "Company Name *",
      companyPlaceholder: "e.g. Agri Global Traders Pte Ltd",
      volume: "Estimated Volume *",
      volumePlaceholder: "e.g. 100 MT, 5x 20ft FCL",
      incoterm: "Incoterms *",
      destinationPort: "Destination Port (POD) *",
      destinationPlaceholder: "e.g. Nhava Sheva (India), Port Klang, Singapore",
      packaging: "Packaging Requirement",
      packagingPlaceholder: "e.g. 50kg PP bags, 25kg, Jumbo bags",
      fullName: "Contact Person *",
      workEmail: "Work Email *",
      phoneOrViber: "Phone / WhatsApp / Viber *",
      subject: "Subject *",
      message: "Specifications & Additional Notes *",
      messagePlaceholder: "State your target crop year, purity/moisture tolerance, inspection requirements (SGS), and target delivery window…",
      submitGeneral: "Send Message",
      submitRfq: "Submit Official RFQ",
      successMessage: "RFQ received. Our Trade Desk will reply with an official indicative quote within 1 business day.",
    },
    trust: {
      credentialsTitle: "Official Trade Registrations & Compliance",
      credentialsSubtitle: "Fully registered and compliant with Myanmar Ministry of Commerce and recognized trade associations.",
      regTitle: "MyCO / DICA Registered",
      regSubtitle: "Directorate of Investment and Company Administration",
      licenseTitle: "Exporter / Importer License",
      licenseSubtitle: "Ministry of Commerce (PaThaKa registered)",
      mpbsaTitle: "MPBSA Association",
      mpbsaSubtitle: "Myanmar Pulses, Beans & Sesame Seeds Merchants Assoc.",
      mrfTitle: "MRF Rice Federation",
      mrfSubtitle: "Myanmar Rice Federation trade member",
      qualityTitle: "Quality & Inspection",
      qualitySubtitle: "SGS / Bureau Veritas pre-shipment inspection compliant",
      portTitle: "Ports of Loading",
      portSubtitle: "Yangon Port Terminals & Thilawa SEZ (MITT)",
    },
    floating: {
      tradeDesk: "Trade Desk",
      chatWhatsapp: "WhatsApp Desk",
      chatViber: "Viber Desk",
      instantRfq: "Request RFQ",
    },
  },
  my: {
    nav: {
      home: "ပင်မစာမျက်နှာ",
      about: "ကုမ္ပဏီအကြောင်း",
      products: "ထုတ်ကုန်များ",
      services: "ဝန်ဆောင်မှုများ",
      news: "သတင်းများ",
      contact: "ဆက်သွယ်ရန်",
      getQuote: "ဈေးနှုန်းတောင်းခံရန်",
      tradeDesk: "အရောင်းဌာန",
    },
    trade: {
      export: "ပြည်ပတင်ပို့",
      import: "ပြည်တွင်းတင်သွင်း",
      both: "တင်ပို့/တင်သွင်း",
      rentable: "ငှားရမ်းနိုင်သော",
      indicativePrice: "ခန့်မှန်းဈေးနှုန်း",
      priceOnRequest: "ဈေးနှုန်းစုံစမ်းရန်",
      origin: "မူရင်းဒေသ",
      tradingMode: "ကုန်သွယ်မှုအမျိုးအစား",
      enquireProduct: "ကုန်ပစ္စည်းအကြောင်း မေးမြန်းမည်",
      whatsappEnquiry: "WhatsApp ဖြင့် မေးမြန်းမည်",
      viberEnquiry: "Viber ဖြင့် မေးမြန်းမည်",
      talkToExportDesk: "ပို့ကုန်ဌာနသို့ ဆက်သွယ်ရန်",
      preferCall: "ဖုန်းဖြင့် တိုက်ရိုက်ဆက်သွယ်ရန်",
    },
    rfq: {
      title: "ကုန်သွယ်မှု ဈေးနှုန်းတောင်းခံလွှာ (RFQ)",
      subtitle: "ပို့ကုန်/သွင်းကုန် ကုန်သွယ်မှုဆိုင်ရာ စာချုပ်၊ သတ်မှတ်ချက်နှင့် ဈေးနှုန်းများကို တိုက်ရိုက်စုံစမ်းနိုင်ပါသည်။",
      tabGeneral: "အထွေထွေ စုံစမ်းရန်",
      tabRfq: "တရားဝင် ဈေးနှုန်းတောင်းခံလွှာ (RFQ)",
      companyName: "ကုမ္ပဏီအမည် *",
      companyPlaceholder: "ဥပမာ - ရွှေလယ်ယာ ကုန်သွယ်ရေး ကုမ္ပဏီ",
      volume: "မှာယူမည့် ပမာဏ *",
      volumePlaceholder: "ဥပမာ - မက်ထရစ်တန် ၁၀၀၊ 20ft ကွန်တိန်နာ ၅ လုံး",
      incoterm: "ကုန်သွယ်မှု စည်းမျဉ်း (Incoterms) *",
      destinationPort: "ဆိုက်ရောက်ဆိပ်ကမ်း (POD) *",
      destinationPlaceholder: "ဥပမာ - ရန်ကုန်ဆိပ်ကမ်း၊ စင်ကာပူ၊ အိန္ဒိယဆိပ်ကမ်း",
      packaging: "ထုပ်ပိုးမှုပုံစံ",
      packagingPlaceholder: "ဥပမာ - ၅၀ ကီလို ဂုံနီအိတ်/ပလတ်စတစ်အိတ်၊ ဂျမ်ဘိုအိတ်",
      fullName: "ဆက်သွယ်ရမည့်ပုဂ္ဂိုလ် *",
      workEmail: "လုပ်ငန်းသုံး အီးမေးလ် *",
      phoneOrViber: "ဖုန်း သို့မဟုတ် Viber/WhatsApp *",
      subject: "ခေါင်းစဉ် *",
      message: "အသေးစိတ်အချက်အလက်နှင့် သတ်မှတ်ချက်များ *",
      messagePlaceholder: "သီးနှံထွက်ရှိသည့်ခုနှစ်၊ သန့်စင်မှုရာခိုင်နှုန်း၊ SGS စစ်ဆေးမှု လိုအပ်ချက်များကို ဖော်ပြပေးပါရန်…",
      submitGeneral: "မက်ဆေ့ခ်ျ ပေးပို့မည်",
      submitRfq: "RFQ တရားဝင် ပေးပို့မည်",
      successMessage: "ဈေးနှုန်းတောင်းခံလွှာ လက်ခံရရှိပါသည်။ ရုံးဖွင့်ရက် ၁ ရက်အတွင်း အရောင်းဌာနမှ ပြန်လည်ဆက်သွယ်ပါမည်။",
    },
    trust: {
      credentialsTitle: "တရားဝင် ကုန်သွယ်ရေးမှတ်ပုံတင်နှင့် အသိအမှတ်ပြုလက်မှတ်များ",
      credentialsSubtitle: "စီးပွားရေးနှင့် ကူးသန်းရောင်းဝယ်ရေးဝန်ကြီးဌာနနှင့် ကုန်သည်အသင်းချုပ်များ၏ စည်းမျဉ်းများနှင့်အညီ တရားဝင်ရပ်တည်ဆောင်ရွက်ပါသည်။",
      regTitle: "DICA / MyCO မှတ်ပုံတင်",
      regSubtitle: "ရင်းနှီးမြှုပ်နှံမှုနှင့် ကုမ္ပဏီများညွှန်ကြားမှုဦးစီးဌာန တရားဝင်မှတ်ပုံတင်",
      licenseTitle: "ပို့ကုန်/သွင်းကုန် လိုင်စင် (ပသက)",
      licenseSubtitle: "စီးပွားရေးနှင့် ကူးသန်းရောင်းဝယ်ရေး ဝန်ကြီးဌာန မှတ်ပုံတင်",
      mpbsaTitle: "ပဲမျိုးစုံနှင့် နှမ်းအသင်းဝင် (MPBSA)",
      mpbsaSubtitle: "မြန်မာနိုင်ငံ ပဲမျိုးစုံနှင့် နှမ်းကုန်သည်များအသင်းဝင်",
      mrfTitle: "ဆန်စပါးအသင်းချုပ် (MRF)",
      mrfSubtitle: "မြန်မာနိုင်ငံ ဆန်စပါးအသင်းချုပ် အဖွဲ့ဝင်",
      qualityTitle: "အရည်အသွေး စစ်ဆေးမှု (SGS)",
      qualitySubtitle: "SGS / Bureau Veritas နိုင်ငံတကာစံချိန်မီ စစ်ဆေးမှုအာမခံချက်",
      portTitle: "ဆိပ်ကမ်းတင်ပို့မှု",
      portSubtitle: "ရန်ကုန်ဆိပ်ကမ်းများနှင့် သီလဝါအထူးစီးပွားရေးဇုန် (MITT)",
    },
    floating: {
      tradeDesk: "အရောင်းဌာန",
      chatWhatsapp: "WhatsApp စားပွဲ",
      chatViber: "Viber ဖြင့် ဆက်သွယ်ရန်",
      instantRfq: "ဈေးနှုန်းတောင်းခံရန်",
    },
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: dictionaries.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("pgm_lang") as Language | null;
    if (saved === "en" || saved === "my") {
      // Reading the persisted preference after hydration avoids a server/client
      // markup mismatch. The effect only synchronizes with localStorage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(saved);
    }
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem("pgm_lang", next);
    document.cookie = `pgm_lang=${next}; path=/; max-age=31536000`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

import { englishToMyanmarMap, myanmarToEnglishMap } from "@/lib/translations-dict";
export { englishToMyanmarMap, myanmarToEnglishMap };

export function translateTradeTerm(term?: string | null, targetLang: Language = "my"): string {
  if (!term) return "";
  const trimmed = term.trim();
  if (targetLang === "my") {
    return englishToMyanmarMap[trimmed] || trimmed;
  }
  return myanmarToEnglishMap[trimmed] || trimmed;
}
