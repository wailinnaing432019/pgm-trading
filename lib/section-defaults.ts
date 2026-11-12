export type SectionDefaultContent = {
  title?: string;
  subtitle?: string;
  body?: string;
};

export type SectionFieldCopy = {
  label: string;
  placeholder: string;
  hint: string;
  recommendedMax: number;
};

export type SectionPreviewTone = "dark" | "cream" | "quote";

export type SectionGuide = {
  /** Plain-English explanation of where visitors see this block on the website. */
  whereShown: string;
  /** Visual style used in the live preview card inside the editor. */
  previewTone: SectionPreviewTone;
  /** True when the public page hides the band entirely until customized (e.g. home story). */
  hiddenUntilSaved?: boolean;
  /** Built-in website fallback copy when no custom record is saved. */
  defaults: SectionDefaultContent;
  /** Non-technical labels, hints, and recommended length targets per field. */
  fields: Partial<Record<"title" | "subtitle" | "body", SectionFieldCopy>>;
  imageCopy?: { label: string; hint: string };
};

const defaultFields: Record<"title" | "subtitle" | "body", SectionFieldCopy> = {
  title: {
    label: "Main heading",
    placeholder: "Write a clear heading…",
    hint: "Short, easy-to-scan titles look best on both desktop and mobile.",
    recommendedMax: 65,
  },
  subtitle: {
    label: "Small tag above heading",
    placeholder: "e.g. CORE SERVICES",
    hint: "Optional 2–4 word badge shown in gold above the main heading.",
    recommendedMax: 32,
  },
  body: {
    label: "Supporting description",
    placeholder: "Write 1–2 short sentences introducing this section…",
    hint: "Shown directly below the heading to give visitors helpful context.",
    recommendedMax: 180,
  },
};

function makeHeadingGuide(
  whereShown: string,
  defaults: SectionDefaultContent,
  previewTone: SectionPreviewTone = "cream"
): SectionGuide {
  return {
    whereShown,
    previewTone,
    defaults,
    fields: {
      subtitle: { ...defaultFields.subtitle },
      title: { ...defaultFields.title },
      body: { ...defaultFields.body },
    },
  };
}

const sectionGuides: Record<string, SectionGuide> = {
  "home.hero": {
    whereShown: "Very top dark banner when visitors first open your website.",
    previewTone: "dark",
    defaults: {
      title: "From Myanmar Fields to Global Markets",
      subtitle:
        "Pacific Global Myanmar links farmers, processors and international buyers through transparent import, export, trading and cold-chain distribution.",
    },
    fields: {
      title: {
        label: "Main welcome headline",
        placeholder: "e.g. From Myanmar Fields to Global Markets",
        hint: "Your biggest headline on the homepage. Aim for 5–9 words so it stays bold and readable.",
        recommendedMax: 60,
      },
      subtitle: {
        label: "Intro sentence under the headline",
        placeholder: "Briefly explain what Pacific Global Myanmar does…",
        hint: "Shown directly beneath the main headline, above the Explore Products and Contact Us buttons.",
        recommendedMax: 170,
      },
    },
    imageCopy: {
      label: "Hero background photo (optional)",
      hint: "Wide landscape photo (JPG or WebP, ~1600×900 px). We add a dark tint automatically so white text stays crisp.",
    },
  },
  "home.story": {
    whereShown: "Two-column Our Story section in the middle of the homepage.",
    previewTone: "cream",
    hiddenUntilSaved: true,
    defaults: {
      title: "Rooted in the Land, Geared for Trade",
      body: "Founded in Yangon, PGM builds resilient supply chains that move Myanmar's finest produce and agro-inputs across borders — reliably, traceably, sustainably.",
    },
    fields: {
      title: {
        label: "Story headline",
        placeholder: "e.g. Rooted in the Land, Geared for Trade",
        hint: "Displayed on the right side next to the leadership quote box.",
        recommendedMax: 60,
      },
      body: {
        label: "Company story paragraph",
        placeholder: "Share who PGM is and what makes your supply chain dependable…",
        hint: "2–4 crisp sentences work best beside the quote card.",
        recommendedMax: 320,
      },
    },
    imageCopy: {
      label: "Quote card backdrop photo (optional)",
      hint: "Optional photo shown gently behind the dark leadership quote card on the left.",
    },
  },
  "home.storyQuote": {
    whereShown: "Dark green quote box inside the Our Story band on the homepage.",
    previewTone: "quote",
    defaults: {
      title:
        "We build supply chains that respect the farmer, protect the produce, and deliver certainty to the buyer.",
      subtitle: "Managing Director, PGM",
    },
    fields: {
      title: {
        label: "Quote text",
        placeholder: "We build supply chains that respect the farmer…",
        hint: "Quotation marks are added automatically by the page design.",
        recommendedMax: 160,
      },
      subtitle: {
        label: "Person's name or role",
        placeholder: "e.g. Managing Director, PGM",
        hint: "Displayed below the quote as attribution.",
        recommendedMax: 50,
      },
    },
  },
  "home.servicesHeading": makeHeadingGuide(
    "Intro heading above the Services cards on the homepage.",
    {
      subtitle: "Core Services",
      title: "One partner for the whole agri value chain",
      body: "From grower contracts and warehousing to customs clearance and international freight — managed end-to-end.",
    }
  ),
  "home.productHeading": makeHeadingGuide(
    "Intro heading above the Featured Products grid on the homepage.",
    {
      subtitle: "Featured Products",
      title: "Commodities moving right now",
      body: "A selection of our in-demand export and import products — graded, milled and shipped to specification.",
    }
  ),
  "home.supplyChain": makeHeadingGuide(
    "Dark section header above the 4-step Supply Chain cards on the homepage.",
    {
      subtitle: "Global Supply Chain",
      title: "Designed to move, engineered to stay fresh",
      body: "A single orchestrated corridor from Myanmar's growing regions to receiving ports worldwide.",
    },
    "dark"
  ),
  "home.newsHeading": makeHeadingGuide(
    "Intro heading above your latest news articles on the homepage.",
    {
      subtitle: "News & Insights",
      title: "Trade updates from the paddy fields",
      body: "Export market movements, harvest outlooks and company announcements.",
    }
  ),
  "home.cta": {
    whereShown: "Large green invitation banner at the bottom of Home and Services pages.",
    previewTone: "dark",
    defaults: {
      title: "Ready to trade? Let's talk specifications, pricing and shipping windows.",
      subtitle:
        "Our export desk responds within one business day with grades, load availability and freight quotes.",
    },
    fields: {
      title: {
        label: "Invitation headline",
        placeholder: "e.g. Ready to trade? Let's talk specifications and pricing.",
        hint: "Encourages visitors to click 'Start an Inquiry' or call your desk.",
        recommendedMax: 85,
      },
      subtitle: {
        label: "Supporting promise",
        placeholder: "e.g. Our export desk responds within one business day…",
        hint: "One reassuring sentence underneath the invitation headline.",
        recommendedMax: 150,
      },
    },
  },

  "about.hero": {
    whereShown: "Top dark header banner on the About Us page.",
    previewTone: "dark",
    defaults: {
      subtitle: "About Us",
      title: "Rooted in the land, geared for trade",
      body: "",
    },
    fields: {
      subtitle: { ...defaultFields.subtitle, placeholder: "e.g. ABOUT US" },
      title: {
        label: "About page headline",
        placeholder: "e.g. Rooted in the land, geared for trade",
        hint: "Large serif title at the top of the About page.",
        recommendedMax: 60,
      },
      body: {
        label: "Optional intro sentence",
        placeholder: "Brief overview of your company (optional)…",
        hint: "Shown below the headline inside the dark top banner.",
        recommendedMax: 180,
      },
    },
    imageCopy: {
      label: "About banner background photo (optional)",
      hint: "Wide landscape photo (JPG or WebP, ~1600×900 px). Softly tinted dark behind white text.",
    },
  },
  "about.story": {
    whereShown: "Main 'Our Story' column on the About Us page.",
    previewTone: "cream",
    defaults: {
      title: "Our story",
      body: "Founded in Yangon, Pacific Global Myanmar builds resilient supply chains that move Myanmar's finest produce and agro-inputs across borders — reliably, traceably, sustainably.",
    },
    fields: {
      title: {
        label: "Story section heading",
        placeholder: "e.g. Our story",
        hint: "Heading displayed above your company background text.",
        recommendedMax: 55,
      },
      body: {
        label: "Company story",
        placeholder: "Tell visitors when PGM started, who you serve, and how you work…",
        hint: "You can write multiple paragraphs — line breaks are preserved on the About page.",
        recommendedMax: 700,
      },
    },
  },
  "about.mission": {
    whereShown: "Green highlight box for 'Our Mission' on the About Us page.",
    previewTone: "cream",
    defaults: {
      title: "Our Mission",
      body: "Connect Myanmar's agricultural heartland with world markets through dependable logistics and fair, transparent trade.",
    },
    fields: {
      title: {
        label: "Mission box title",
        placeholder: "e.g. Our Mission",
        hint: "Short title beside the target icon.",
        recommendedMax: 35,
      },
      body: {
        label: "Mission statement",
        placeholder: "Describe what PGM delivers every day…",
        hint: "1–3 clear sentences work best inside the side-by-side card.",
        recommendedMax: 220,
      },
    },
  },
  "about.vision": {
    whereShown: "Green highlight box for 'Our Vision' next to Mission on the About Us page.",
    previewTone: "cream",
    defaults: {
      title: "Our Vision",
      body: "A Myanmar agri-trade hub trusted by every link of the chain — from smallholder farmers to global food companies.",
    },
    fields: {
      title: {
        label: "Vision box title",
        placeholder: "e.g. Our Vision",
        hint: "Short title beside the eye icon.",
        recommendedMax: 35,
      },
      body: {
        label: "Vision statement",
        placeholder: "Describe your long-term goal for the business…",
        hint: "1–3 clear sentences work best inside the side-by-side card.",
        recommendedMax: 220,
      },
    },
  },
  "about.valuesHeading": makeHeadingGuide(
    "Heading shown directly above the Core Values cards on the About Us page.",
    {
      subtitle: "Core Values",
      title: "What we stand behind",
    }
  ),
  "about.milestonesHeading": makeHeadingGuide(
    "Centered heading above your company timeline on the About Us page.",
    {
      subtitle: "Milestones",
      title: "Our growth, season by season",
      body: "Key moments in the PGM journey.",
    }
  ),
  "about.certificationsHeading": makeHeadingGuide(
    "Centered heading above your quality & compliance badges on the About Us page.",
    {
      subtitle: "Quality & Compliance",
      title: "Certified at every step",
      body: "Compliance badges we maintain across farming, milling, warehousing and export.",
    }
  ),

  "services.hero": {
    whereShown: "Top dark header banner on the Services page.",
    previewTone: "dark",
    defaults: {
      subtitle: "Services",
      title: "Services & global logistics",
      body: "A single partner for sourcing, trading, warehousing and delivery — built around Myanmar's growing regions and export corridors.",
    },
    fields: {
      subtitle: { ...defaultFields.subtitle, placeholder: "e.g. SERVICES" },
      title: {
        label: "Services page headline",
        placeholder: "e.g. Services & global logistics",
        hint: "Main heading displayed at the top of the Services page.",
        recommendedMax: 60,
      },
      body: {
        label: "Intro sentence",
        placeholder: "Briefly summarize your logistics and trade services…",
        hint: "Shown below the headline inside the dark top banner.",
        recommendedMax: 180,
      },
    },
    imageCopy: {
      label: "Services banner background photo (optional)",
      hint: "Wide landscape photo (JPG or WebP, ~1600×900 px). Softly tinted dark behind white text.",
    },
  },
  "services.servicesHeading": makeHeadingGuide(
    "Heading directly above your Service cards on the Services page.",
    {
      subtitle: "What we do",
      title: "Core service lines",
      body: "",
    }
  ),
  "services.capabilitiesHeading": makeHeadingGuide(
    "Heading next to the shipment capabilities checklist on the Services page.",
    {
      subtitle: "Full-service trading",
      title: "What's included in every shipment",
      body: "We absorb the paperwork so you can focus on the trade.",
    }
  ),
  "services.quote": {
    whereShown: "Highlighted quote card beside the Capabilities Checklist on the Services page.",
    previewTone: "quote",
    defaults: {
      title: "Give us the origin and the destination — we'll build the route.",
      subtitle: "Head of Logistics, PGM",
    },
    fields: {
      title: {
        label: "Quote text",
        placeholder: "Give us the origin and the destination…",
        hint: "Displayed in large serif type inside the earthy gradient box.",
        recommendedMax: 140,
      },
      subtitle: {
        label: "Name or title",
        placeholder: "e.g. Head of Logistics, PGM",
        hint: "Shown right below the quote.",
        recommendedMax: 50,
      },
    },
  },

  "contact.hero": {
    whereShown: "Top dark header banner on the Contact & Trade Enquiries page.",
    previewTone: "dark",
    defaults: {
      subtitle: "Contact",
      title: "Let's move crops & cargo",
      body: "Tell us what you want to buy or sell, and our trade desk will bring you pricing, grades and logistics within one business day.",
    },
    fields: {
      subtitle: { ...defaultFields.subtitle, placeholder: "e.g. CONTACT" },
      title: {
        label: "Contact page headline",
        placeholder: "e.g. Let's move crops & cargo",
        hint: "Main heading welcoming buyers and partners.",
        recommendedMax: 60,
      },
      body: {
        label: "Invitation text",
        placeholder: "Let buyers know how fast your trade desk replies…",
        hint: "Displayed below the headline in the top banner.",
        recommendedMax: 180,
      },
    },
    imageCopy: {
      label: "Contact banner background photo (optional)",
      hint: "Wide landscape photo (JPG or WebP, ~1600×900 px). Softly tinted dark behind white text.",
    },
  },

  "shared.newsletter": {
    whereShown: "Dark footer strip shown at the bottom of every public page.",
    previewTone: "dark",
    defaults: {
      title: "Market insights, straight to your inbox",
      body: "Seasonal produce updates, export price outlooks and trade alerts — weekly, no spam.",
    },
    fields: {
      title: {
        label: "Newsletter heading",
        placeholder: "e.g. Market insights, straight to your inbox",
        hint: "Shown beside the email signup box in the footer.",
        recommendedMax: 65,
      },
      body: {
        label: "Short reassurance note",
        placeholder: "e.g. Seasonal produce updates and export price outlooks — weekly, no spam.",
        hint: "Keep it brief — space in the footer is compact.",
        recommendedMax: 130,
      },
    },
  },
};

export function getSectionGuide(page: string, sectionKey: string): SectionGuide {
  return (
    sectionGuides[`${page}.${sectionKey}`] ?? {
      whereShown: "Displayed on this public page.",
      previewTone: "cream",
      defaults: {},
      fields: {
        title: defaultFields.title,
        subtitle: defaultFields.subtitle,
        body: defaultFields.body,
      },
    }
  );
}

export type CollectionKind =
  | "stat"
  | "service"
  | "office"
  | "value"
  | "supplyStep"
  | "checklistItem"
  | "milestone";

