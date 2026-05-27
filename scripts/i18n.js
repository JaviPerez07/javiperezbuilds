// ============================================
// i18n — EN / ES toggle for javiperezbuilds.com
// Strategy:
//   - Markup is EN by default.
//   - On load: read localStorage 'preferred-lang', else read navigator.language.
//   - setLanguage(lang) walks every [data-i18n], [data-i18n-html],
//     [data-i18n-placeholder], [data-i18n-aria-label] and swaps content.
//   - Technical terms (Claude Code, AdSense, Cloudflare, Stripe, etc.)
//     stay in English in both languages.
//   - Currency stays in original unit ($ for global services, € for local).
// ============================================
(() => {
  'use strict';

  const T = {
    en: {
      // ===== Top urgency strip =====
      topbar_slots: '3 slots left',
      topbar_for_month_pre: ' for ',
      topbar_for_month_post: ' builds',
      topbar_closing: 'Closing in',
      topbar_response_pre: 'Avg. response: ',
      topbar_response: 'under 4h',

      // ===== Nav =====
      nav_services: 'Services',
      nav_work: 'Work',
      nav_process: 'Process',
      nav_about: 'About',
      nav_cta: 'Get in touch',

      // ===== Hero =====
      hero_hook: 'The average founder wastes 11h/week on tasks Claude does in seconds.',
      hero_h1_w1: "You're",
      hero_h1_w2: 'burning',
      hero_h1_w3: 'money',
      hero_h1_w4: 'on',
      hero_h1_w5: 'busywork.',
      hero_h1_aria: "You're burning money on busywork.",
      hero_sub: 'I ship the AI systems that stop the bleeding — in 48–72h. Daily Claude Code operator across nine production sites in U.S. financial verticals. Fixed scope, fixed price, async only.',
      hero_counter_burned: 'burned by founders',
      hero_counter_burned2: 'since you opened this page',
      hero_counter_sites: 'sites live',
      hero_counter_sites2: 'in production',
      hero_cta_primary: 'Claim a slot',
      hero_cta_secondary: 'See what I build →',
      hero_featured: 'Featured in',
      hero_caption: 'Almería, Spain · Working async',
      hero_scroll: 'Scroll',

      // ===== Social proof strip =====
      proof_caption: 'Editorial coverage and citations',

      // ===== Pain Dashboard =====
      pain_kicker: 'The cost of doing nothing',
      pain_h2_pre: 'Every week without automation is ',
      pain_h2_accent: 'money on fire.',
      pain_sub: "Industry benchmarks for founder-led teams shipping content, support, or lead-gen by hand. The math doesn't care how busy you feel.",
      pain_c1_label: 'Wasted weekly',
      pain_c1_ctx: 'Avg. founder time spent on tasks Claude can ship in seconds.',
      pain_c2_label: 'Monthly cost',
      pain_c2_ctx: 'Of your time at $50/h, doing copy-paste work an agent should own.',
      pain_c3_label: 'Slower than rivals',
      pain_c3_ctx: "Time-to-ship gap between teams using AI workflows and teams that don't.",
      pain_c4_label: 'Lost lead-time',
      pain_c4_ctx: 'What most agencies need to deliver what I ship in 5–10 days.',
      pain_disclaimer: 'Industry benchmarks · founder time priced at $50/h · indicative figures for illustration, not a quote from your data.',

      // ===== Services =====
      srv_kicker: 'What I build',
      srv_h2_pre: 'Four ways I work with ',
      srv_h2_accent: 'founders.',
      srv_sub: 'Productized engagements with clear scope, timeline, and price. No project bloat. No discovery calls disguised as scoping.',
      srv_price: 'Price',
      srv_timeline: 'Timeline',
      srv_cta: 'Lock in this price',
      srv_badge_popular: 'Most popular',

      srv_c1_title: 'AI Site Build for AdSense',
      srv_c1_tag: 'Static site built with Claude Code, E-E-A-T compliant, AdSense-ready out of the box. No WordPress, no bloat.',
      srv_c1_time: '10–21 days',
      srv_c1_savings: 'Save $15,000+ vs. agency',
      srv_c1_f1: 'Claude-powered static site (HTML or framework, your call)',
      srv_c1_f2: 'Cloudflare Pages or Vercel deployment',
      srv_c1_f3: 'E-E-A-T compliant structure (editor schema, citations, sourcing)',
      srv_c1_f4: 'AdSense application package (ads.txt, schemas, policies)',
      srv_c1_f5: '5–15 pillar pages + supporting structure',
      srv_c1_f6: 'Calculators or interactive tools (1–3 included)',
      srv_c1_f7: 'Search Console + GA4 + Bing Webmaster setup',
      srv_c1_f8: '30-day post-launch support',

      srv_c2_title: 'Claude Code Production Setup',
      srv_c2_tag: 'From zero to shipping with Claude Code in 7 days. For devs and founders who want to start right without burning 6 hours debugging multi-agent loops.',
      srv_c2_time: '4–7 days',
      srv_c2_savings: 'Save 50h+ of trial & error',
      srv_c2_f1: 'Claude Code CLI configured for your stack',
      srv_c2_f2: 'Multi-agent workflow architecture (Opus + Sonnet split)',
      srv_c2_f3: 'Custom slash commands + agent definitions',
      srv_c2_f4: 'MCP server setup (relevant integrations)',
      srv_c2_f5: 'Token budget + rate limit handling patterns',
      srv_c2_f6: 'Production prompt engineering templates',
      srv_c2_f7: 'Async handover documentation',
      srv_c2_f8: '14-day chat support',

      srv_c3_title: 'AI Workflow Automation',
      srv_c3_tag: 'Claude API + n8n workflows for your existing stack. Lead intake, content pipelines, support triage.',
      srv_c3_time: '5–10 days',
      srv_c3_savings: 'Save 11h/week, every week',
      srv_c3_f1: 'Lead qualification + intake automation',
      srv_c3_f2: 'Content pipeline (research → draft → review)',
      srv_c3_f3: 'Customer support triage with Claude API',
      srv_c3_f4: 'Document drafting + summarization workflows',
      srv_c3_f5: 'n8n flows + integrations (Slack, Notion, CRMs, Sheets)',
      srv_c3_f6: 'Webhook + retry logic + observability',
      srv_c3_f7: '30-day maintenance retainer included',

      srv_c4_title: 'AI Site Deploy',
      srv_c4_tag: 'From Claude/Lovable build → live site with analytics. Fast turnaround for founders who already have the build.',
      srv_c4_time: '48–72h turnaround',
      srv_c4_savings: 'Save 5 days vs. typical agency',
      srv_c4_f1: 'Vercel or Cloudflare Pages deployment',
      srv_c4_f2: 'Custom domain + SSL + DNS configuration',
      srv_c4_f3: 'GA4 + Search Console + Bing Webmaster setup',
      srv_c4_f4: 'Sitemap submission + verification',
      srv_c4_f5: 'Production handover documentation',

      // ===== Comparison =====
      cmp_kicker: 'You vs. them',
      cmp_h2_pre: 'The math is ',
      cmp_h2_accent: 'embarrassing.',
      cmp_sub: 'Compare your three real options against the one you keep avoiding. Pretty obvious which column wins.',
      cmp_winner_badge: 'Winner',
      cmp_row_price: 'Price',
      cmp_row_time: 'Time to ship',
      cmp_row_ai: 'Built with AI',
      cmp_row_calls: 'Discovery calls',
      cmp_row_async: 'Async-first',
      cmp_row_prod: 'Production-tested',
      cmp_row_risk: 'Risk',

      cmp_col1_name: 'Do nothing',
      cmp_col1_sub: 'Status quo',
      cmp_col1_price: '$0 + lost revenue',
      cmp_col1_time: 'Never',
      cmp_col1_ai: 'No',
      cmp_col1_calls: 'Constant tab spirals',
      cmp_col1_async: '—',
      cmp_col1_prod: '—',
      cmp_col1_risk: '100% — every day',

      cmp_col2_name: 'Hire a dev',
      cmp_col2_sub: 'In-house · $8k+/mo',
      cmp_col2_price: '$8,000+/mo',
      cmp_col2_time: '6–10 weeks',
      cmp_col2_ai: 'Maybe',
      cmp_col2_calls: '3 weekly meetings',
      cmp_col2_async: 'No',
      cmp_col2_prod: 'Side projects',
      cmp_col2_risk: '50%',

      cmp_col3_name: 'Hire an agency',
      cmp_col3_sub: '$20k–$50k · 3+ months',
      cmp_col3_price: '$20,000–$50,000',
      cmp_col3_time: '3–6 months',
      cmp_col3_ai: 'Add-on $$$',
      cmp_col3_calls: '2-week kickoff phase',
      cmp_col3_async: 'No',
      cmp_col3_prod: 'Outsourced offshore',
      cmp_col3_risk: '70%',

      cmp_col4_name: 'Work with me',
      cmp_col4_sub: 'Async · 48h–10d · $200–$4,500',
      cmp_col4_price: '$200 — $4,500',
      cmp_col4_time: '48h — 10 days',
      cmp_col4_ai: 'Default',
      cmp_col4_calls: 'Zero — async only',
      cmp_col4_async: 'Yes — no Zoom',
      cmp_col4_prod: '9 live sites',
      cmp_col4_risk: '0% — miss deadline = free',

      cmp_cta: 'Stop overpaying — claim a slot',

      // ===== Case Study =====
      case_kicker: 'Receipts',
      case_h2_pre: 'Real production. ',
      case_h2_accent: 'Real numbers.',
      case_tag: 'Multi-agent editorial review · 9 sites',
      case_title: 'From 16 hours of human review to 45 minutes of guided agents.',
      case_body1_html: 'Nine production sites in U.S. consumer-finance verticals. <strong>200+ E-E-A-T compliance issues</strong> blocking AdSense monetization. Typical industry quote: <strong>$20k–$50k and 3–4 months.</strong> Cost of doing nothing: <strong>~$3,200/mo in lost ad revenue.</strong>',
      case_body2_html: 'I shipped a <strong>multi-agent review pipeline</strong> using Claude Code + custom prompts. One operator now audits all nine sites in under an hour. Built solo, in 6 working days.',
      case_bar1_lbl: 'Before — manual review',
      case_bar1_val: '16h / site / week',
      case_bar2_lbl: 'After — multi-agent pipeline',
      case_bar2_val: '0.75h / site / week',
      case_delta: '↓ 95% time saved · industry quote avoided · ad revenue restored in 6 days',
      case_bar3_lbl: 'Industry quote',
      case_bar3_val: '$20k–$50k · 3–4 mo',
      case_bar4_lbl: 'My build',
      case_bar4_val: '6 days · solo',

      // ===== Interactive Demos =====
      demos_kicker: 'Interactive demos',
      demos_h2_pre: "How I'd lift ",
      demos_h2_accent: 'your numbers.',
      demos_sub: 'Three live tools I run on every project. Pick one — see the math behind a senior conversion build vs. the typical founder homepage.',
      demos_tab_adsense: 'AdSense compliance',
      demos_tab_conversion: 'Conversion audit',
      demos_tab_revenue: 'Revenue lift',

      // AdSense
      ads_chip_demo: 'Live audit',
      ads_title: 'AdSense compliance auditor',
      ads_context: 'Same audit I run on production YMYL sites — distilled into 5 categories and rendered in real time. Pick an example to see the breakdown.',
      ads_select_label: 'Example site',
      ads_opt_strong: 'Strong example',
      ads_opt_typical: 'Typical AI-generated example',
      ads_opt_under: 'Underoptimized example',
      ads_run: 'Run audit',
      ads_idle: 'Pick an example and run the audit.',
      ads_scanning: 'Scanning E-E-A-T signals, schema, citations…',
      ads_out_of: 'out of 100',
      ads_cta: 'Get this audit on your site',

      // Conversion
      conv_chip_demo: 'Live audit',
      conv_title: 'Conversion audit',
      conv_context: 'The same 5-factor diagnostic I run on landing pages before quoting a rebuild. Compare three real-world archetypes — see where the leaks are.',
      conv_select_label: 'Example page',
      conv_opt_founder: 'Typical founder homepage',
      conv_opt_saas: 'Templated SaaS landing',
      conv_opt_rebuilt: 'Same page, after my rebuild',
      conv_scanning: 'Measuring hero clarity, CTA visibility, social proof…',
      conv_cta: 'Lift these numbers on your site',

      // Revenue
      rev_chip_calc: 'Calculator',
      rev_chip_math: 'Conversion math',
      rev_chip_live: 'Live preview',
      rev_title: 'Revenue lift calculator',
      rev_context: 'Plug in your real numbers. See what a senior conversion build adds vs. doing nothing, vs. an industry-average landing.',
      rev_slider_visitors: 'Monthly visitors',
      rev_slider_rate: 'Current conversion rate',
      rev_slider_value: 'Avg. customer value',
      rev_results_title: 'Monthly revenue scenarios',
      rev_row_today: 'Today',
      rev_row_today_sub: 'Your numbers',
      rev_row_industry: 'Industry-avg landing',
      rev_row_industry_sub: '2.5% conversion',
      rev_row_mine: 'Built by me',
      rev_row_mine_sub: '5% conversion target',
      rev_lift_label: 'Net monthly lift',
      rev_lift_yr_suffix: '/ year',
      rev_cta: 'Lock in this lift',

      // ===== Recent Work =====
      work_kicker: 'Recent work',
      work_h2_pre: 'Production builds, not ',
      work_h2_accent: 'portfolio fluff.',
      work_c1_title: 'Multi-agent editorial review system',
      work_c1_ctx: 'Reduction in full-site audit time. From ~16 hours of manual review to ~45 minutes of guided multi-agent execution across nine sites.',
      work_c1_footer: 'Case study coming soon',
      work_c2_title: 'Cloudflare Pages middleware fix',
      work_c2_ctx: 'Resolved an AdSense crawling issue that blocked monetization on a credit education site. Diagnosed via multi-agent debugging workflow.',
      work_c2_footer: 'Case study coming soon',
      work_c3_title: 'Sales funnel for algorithmic trading community',
      work_c3_ctx: 'Built the complete sales funnel for nico66fx PRO — a Spanish algorithmic trading community. Hero, 3-tier persona segmentation, live demo panel, Myfxbook audit integration, Stripe checkout, WhatsApp + Telegram CTAs, Skool community embedded. 102 PRO members live in production.',
      work_c3_footer: 'Visit live site',

      // ===== Local business (already authored in B2 markup) =====
      local_kicker: 'For local businesses',
      local_heading_pre: 'Your local business deserves to be online ',
      local_heading_accent: 'too.',
      local_intro: 'For small businesses, autónomos, and local shops who need a working website + sales funnel — not a $5,000 brochure.',
      local_badge: 'Local',
      local_price: 'Price',
      local_timeline: 'Timeline',
      local_cta: "Let's talk",
      local_card1_title: 'Website for your local business',
      local_card1_tagline: 'A landing that sells, not a digital brochure.',
      local_card1_time: '5–10 days',
      local_card1_f1: 'Custom design (no WordPress templates)',
      local_card1_f2: 'Mobile-optimized (where 80% of customers find you)',
      local_card1_f3: 'WhatsApp button + Google Maps integration',
      local_card1_f4: 'Contact form + email integration',
      local_card1_f5: 'Local SEO basics (Google Business + schema)',
      local_card1_f6: 'Fast loading on Cloudflare Pages',
      local_card1_f7: '30 days post-launch support',
      local_card2_title: 'Local sales funnel',
      local_card2_tagline: 'The system that captures, qualifies and closes local customers automatically.',
      local_card2_time: '7–14 days',
      local_card2_f1: 'Conversion-optimized landing page',
      local_card2_f2: 'Lead capture via form + WhatsApp',
      local_card2_f3: 'Automated email follow-up (Brevo / Mailchimp)',
      local_card2_f4: 'WhatsApp Business API integration',
      local_card2_f5: 'Booking calendar (Calendly or similar)',
      local_card2_f6: 'Basic metrics dashboard',
      local_card2_f7: '30 days iteration + adjustments',
      local_card3_title: 'Google Maps + Local SEO',
      local_card3_tagline: "If you're not on Google Maps, you don't exist. Fix in 48-72h.",
      local_card3_time: '48–72h',
      local_card3_f1: 'Google Business Profile setup or optimization',
      local_card3_f2: 'Categories, attributes, hours, photos',
      local_card3_f3: 'Review strategy (how to ask correctly)',
      local_card3_f4: 'LocalBusiness schema on your site',
      local_card3_f5: 'NAP audit on local directories',
      local_card3_f6: 'Initial report vs. 30 days after',
      local_recent_label: 'Recent local builds',
      local_recent1_tag: 'Neighborhood fruit shop · Almería',
      local_recent1_desc: 'Website + Google Business · Month 1 organic traffic: 0 → 240 visits',
      local_recent2_tag: 'nico66fx PRO · Algorithmic trading',
      local_recent2_desc: 'Full funnel: hero, pricing, Stripe, Skool · 102 PRO members in production',
      local_recent3_tag: 'Coming soon — your business',
      local_recent3_desc: 'Open slot · Ship in 7-10 days',
      local_section_cta: "Got a local business and tired of losing customers because you don't show up on Google? Let's talk.",
      local_email_cta: 'Direct email',
      local_whatsapp_cta: 'Direct WhatsApp',

      // ===== Process =====
      process_kicker: 'Zero friction',
      process_h2_pre: 'From email to ',
      process_h2_accent: 'shipped',
      process_h2_post: ' in four moves.',
      process_sub: "No discovery calls. No status meetings. No Slack at midnight. You write me an email, I send you a fixed quote, and the work starts.",
      process_s1_title: 'You email',
      process_s1_meta: '— under 4h reply',
      process_s1_body: 'Describe the project in writing. I respond within 4 hours with scope, timeline, and a fixed price. No call required, ever.',
      process_s2_title: 'Sign + start',
      process_s2_meta: '— same day',
      process_s2_body: 'Contract setup same day. Multiple payment options including Stripe and invoicing. 50% upfront for projects over $500. Work begins within hours of payment.',
      process_s3_title: 'Daily logs',
      process_s3_meta: '— async',
      process_s3_body: 'Written progress updates daily. Loom screen-recordings for technical handovers — watch at your speed. You review, I iterate. No status meetings.',
      process_s4_title: 'Ship + warranty',
      process_s4_meta: '— 7–30 days',
      process_s4_body: 'Production deploy + documentation + 7–30 days post-launch support. If something breaks, I fix it. Miss the deadline and the deploy is free.',

      // ===== About =====
      about_kicker: 'About',
      about_h2_pre: "Hi, I'm ",
      about_h2_accent: 'Javi.',
      about_p1_html: "I'm 20 years old, based in Almería, Spain. I build production AI systems and websites with <strong>Claude Code</strong> as my daily driver.",
      about_p2: "I don't have a CS degree. I don't come from a fintech job. What I have is 15+ months of intensive AI tool deployment, an operator's mindset, and the discipline to ship production-grade work fast.",
      about_p3_html: 'My portfolio runs across <strong>nine sites</strong> in U.S. consumer-finance verticals: insurance, mortgage refinance, tax relief, legal costs, Medicare, VPN pricing, credit, travel budgeting, and personal finance. Every workflow on this site has been pressure-tested in live production environments.',
      about_p4: 'Available for hire. I work async, in English or Spanish, and I deliver in days, not months.',
      about_flow_title: 'How I actually work with Claude Code',
      about_flow_pause: 'Pause',
      about_flow_play: 'Play',
      about_flow_replay: 'Replay',
      about_flow_node1_label: 'Opus 4.7',
      about_flow_node1_role: 'Diagnostic',
      about_flow_node1_title: 'Opus 4.7 · diagnostic',
      about_flow_node1_body: 'Root cause analysis. High-stakes decisions. Reads code, identifies architectural issues, proposes plan.',
      about_flow_node2_label: 'Sonnet 4.6',
      about_flow_node2_role: 'Executor',
      about_flow_node2_title: 'Sonnet 4.6 · executor',
      about_flow_node2_body: 'Plan execution. Multi-file edits, script generation, batch operations. Validated by Opus.',
      about_flow_node3_label: 'Verification',
      about_flow_node3_role: 'Audit live',
      about_flow_node3_title: 'Verification',
      about_flow_node3_body: 'Live site audit. curl checks, schema validation, redirect testing. Catches regressions before commit.',
      about_flow_node4_label: 'Human approval',
      about_flow_node4_role: 'You',
      about_flow_node4_title: 'Human approval',
      about_flow_node4_body: 'Final review. Diff inspection, visual check, explicit OK before git push. No autonomous commits.',

      // ===== Guarantee =====
      guar_kicker: 'Risk reversal',
      guar_h2_pre: "You don't take the risk. ",
      guar_h2_accent: 'I do.',
      guar_title_pre: 'Miss the deadline, and the ',
      guar_title_accent: 'deploy is free.',
      guar_body1: 'Every project ships with a written delivery date. If I miss it for any reason on my end, you get the production deploy free — keep the code, keep the work, owe me $0.',
      guar_body2_html: '<strong>9 production sites shipped, zero missed deadlines.</strong> If you’re going to bet on someone you’ve never worked with, this is how I de-risk it.',

      // ===== FAQ =====
      faq_kicker: 'Objections, handled',
      faq_h2_pre: 'The questions you were about to ',
      faq_h2_accent: 'type.',
      faq_q1: "Why so cheap? What's the catch?",
      faq_a1_html: "There isn't one. I use AI to do in days what agencies bill 3 months for. They pay junior teams hourly; I ship solo with Claude Code as a force multiplier. Same output, fraction of the time, fraction of the price. <strong>You are not the customer they're built for, and that's good news.</strong>",
      faq_q2: 'What if I already have a developer?',
      faq_a2_html: "Great — they'll thank you. I plug into existing repos, deploy to your stack, and hand back clean documentation. Most of my workflow automation gigs are <strong>bought by founders to give to their developers.</strong> Frees them up for higher-leverage work.",
      faq_q3: "I've never hired async. What if I need a call?",
      faq_a3_html: "Try writing the email first. 95% of the time, the question that “needs a call” gets resolved in 3 lines of writing. If it genuinely doesn’t, I'll do one 20-min Loom for free. <strong>Zero recurring meetings, ever.</strong>",
      faq_q4: "What's your stack?",
      faq_a4: 'Claude Code (daily driver), Cloudflare Pages, Vercel, n8n, Anthropic API, GA4, Search Console. For workflows: Slack, Notion, Airtable, Stripe, most major CRMs. If you have an unusual stack, ask — I’ve seen most of them.',
      faq_q5: 'Do you take equity instead of cash?',
      faq_a5: 'No. Fixed-price USD only. I keep things simple so you can fire me anytime.',
      faq_q6: "You're 20. Why should I trust you?",
      faq_a6_html: "Because I have <strong>nine sites in live U.S. production</strong>, editorial coverage in The Epoch Times and CMSWire, and a multi-agent workflow that solves the AdSense E-E-A-T problem no agency I've seen has solved. Age isn't a credential. Receipts are.",
      faq_q7: 'How fast can we actually start?',
      faq_a7_html: "If you email today and pay tomorrow, I'm writing code Wednesday. <strong>3 slots open for the current intake</strong> — when they fill, the next intake is the following month.",

      // ===== Last call (Final CTA) =====
      lc_kicker: 'Last call',
      lc_h2_pre: 'Or keep ',
      lc_h2_accent: 'bleeding.',
      lc_sub_html: '$2,400/month doing busywork. Slow rivals lapping you. Agencies quoting you next quarter.<br/>Or one email. Today.',
      lc_countdown_pre: ' intake closes in',
      lc_form_name: 'Name',
      lc_form_name_ph: 'Your name',
      lc_form_email: 'Email',
      lc_form_email_ph: 'you@company.com',
      lc_form_msg: "What you're working on",
      lc_form_msg_ph: "A short brief: what you're building, timeline, and what kind of help you need.",
      lc_form_submit: 'Claim my slot',
      lc_meta_reply: '4h avg. reply',
      lc_meta_price: 'Fixed price',
      lc_meta_async: 'Async only',
      lc_meta_warranty: 'Deploy free if I miss',
      lc_dm_label: 'Or DM directly',

      // ===== Sticky mobile CTA =====
      sticky_from: 'Async · Fixed price',
      sticky_price_html: 'From <b>$200</b> — ships in days',
      sticky_cta: 'Claim slot',

      // ===== Footer =====
      footer_tagline: 'Production AI systems · shipped in days',
      footer_copyright: '© 2026 Javi Pérez · Almería, Spain',

      // ===== Intake reopens (when countdown hits 0) =====
      countdown_reopens: 'Intake reopens 1st',

      // ===== Work card 3 — nico66fx live case study =====
      work_c3_live_badge: 'Live case study',
      work_c3_metric_sub: 'PRO members',

      // ===== Local recent strip 2 — nico66fx link =====
      local_recent2_link: 'Visit live site →',

      // ===== WhatsApp floating button =====
      whatsapp_fab_label: 'WhatsApp',
    },

    es: {
      // ===== Top urgency strip =====
      topbar_slots: '3 slots disponibles',
      topbar_for_month_pre: ' para builds de ',
      topbar_for_month_post: '',
      topbar_closing: 'Cierra en',
      topbar_response_pre: 'Respuesta media: ',
      topbar_response: 'menos de 4h',

      // ===== Nav =====
      nav_services: 'Servicios',
      nav_work: 'Trabajos',
      nav_process: 'Proceso',
      nav_about: 'Sobre mí',
      nav_cta: 'Contactar',

      // ===== Hero =====
      hero_hook: 'El founder medio pierde 11h/semana en tareas que Claude resuelve en segundos.',
      hero_h1_w1: 'Estás',
      hero_h1_w2: 'quemando',
      hero_h1_w3: 'dinero',
      hero_h1_w4: 'en',
      hero_h1_w5: 'busywork.',
      hero_h1_aria: 'Estás quemando dinero en busywork.',
      hero_sub: 'Construyo los sistemas de IA que paran la hemorragia — en 48–72h. Operador diario de Claude Code en nueve sites en producción del sector financiero US. Scope cerrado, precio cerrado, todo async.',
      hero_counter_burned: 'quemados por founders',
      hero_counter_burned2: 'desde que abriste esta página',
      hero_counter_sites: 'sites live',
      hero_counter_sites2: 'en producción',
      hero_cta_primary: 'Reservar slot',
      hero_cta_secondary: 'Ver qué construyo →',
      hero_featured: 'Aparecido en',
      hero_caption: 'Almería, España · Trabajando async',
      hero_scroll: 'Scroll',

      // ===== Social proof strip =====
      proof_caption: 'Cobertura editorial y citaciones',

      // ===== Pain Dashboard =====
      pain_kicker: 'El coste de no hacer nada',
      pain_h2_pre: 'Cada semana sin automatizar es ',
      pain_h2_accent: 'dinero ardiendo.',
      pain_sub: 'Benchmarks de la industria para equipos founder-led que envían contenido, soporte o lead-gen a mano. Las matemáticas no entienden de cuánto trabajas.',
      pain_c1_label: 'Perdidas a la semana',
      pain_c1_ctx: 'Tiempo medio del founder en tareas que Claude resuelve en segundos.',
      pain_c2_label: 'Coste mensual',
      pain_c2_ctx: 'De tu tiempo a $50/h, haciendo trabajo copy-paste que un agente debería llevar.',
      pain_c3_label: 'Más lento que rivales',
      pain_c3_ctx: 'Diferencia de time-to-ship entre equipos que usan workflows de IA y los que no.',
      pain_c4_label: 'Lead-time perdido',
      pain_c4_ctx: 'Lo que la mayoría de agencias necesitan para entregar lo que yo envío en 5–10 días.',
      pain_disclaimer: 'Benchmarks de industria · tiempo de founder valorado a $50/h · cifras indicativas para ilustración, no una estimación basada en tus datos.',

      // ===== Services =====
      srv_kicker: 'Qué construyo',
      srv_h2_pre: 'Cuatro formas de trabajar con ',
      srv_h2_accent: 'founders.',
      srv_sub: 'Engagements productizados con scope, plazo y precio cerrados. Sin project bloat. Sin discovery calls disfrazadas de scoping.',
      srv_price: 'Precio',
      srv_timeline: 'Plazo',
      srv_cta: 'Reservar este precio',
      srv_badge_popular: 'Más popular',

      srv_c1_title: 'AI Site Build para AdSense',
      srv_c1_tag: 'Site estático construido con Claude Code, E-E-A-T compliant, AdSense-ready de salida. Sin WordPress, sin bloat.',
      srv_c1_time: '10–21 días',
      srv_c1_savings: 'Ahorras $15,000+ vs. agencia',
      srv_c1_f1: 'Site estático con Claude Code (HTML o framework, tú decides)',
      srv_c1_f2: 'Despliegue en Cloudflare Pages o Vercel',
      srv_c1_f3: 'Estructura E-E-A-T compliant (editor schema, citas, fuentes)',
      srv_c1_f4: 'Paquete de aplicación a AdSense (ads.txt, schemas, políticas)',
      srv_c1_f5: '5–15 pillar pages + estructura de soporte',
      srv_c1_f6: 'Calculadoras o tools interactivos (1–3 incluidos)',
      srv_c1_f7: 'Setup de Search Console + GA4 + Bing Webmaster',
      srv_c1_f8: '30 días de soporte post-launch',

      srv_c2_title: 'Claude Code Production Setup',
      srv_c2_tag: 'De cero a shipping con Claude Code en 7 días. Para devs y founders que quieren empezar bien sin quemar 6 horas debuggeando multi-agent loops.',
      srv_c2_time: '4–7 días',
      srv_c2_savings: 'Ahorras 50h+ de prueba y error',
      srv_c2_f1: 'Claude Code CLI configurado para tu stack',
      srv_c2_f2: 'Arquitectura de workflow multi-agent (split Opus + Sonnet)',
      srv_c2_f3: 'Slash commands custom + definiciones de agentes',
      srv_c2_f4: 'Setup de MCP servers (integraciones relevantes)',
      srv_c2_f5: 'Patrones para manejar token budget + rate limits',
      srv_c2_f6: 'Templates de prompt engineering para producción',
      srv_c2_f7: 'Documentación async para handover',
      srv_c2_f8: '14 días de soporte por chat',

      srv_c3_title: 'AI Workflow Automation',
      srv_c3_tag: 'Claude API + workflows n8n para tu stack actual. Captación de leads, pipelines de contenido, triage de soporte.',
      srv_c3_time: '5–10 días',
      srv_c3_savings: 'Ahorras 11h/semana, todas las semanas',
      srv_c3_f1: 'Cualificación + intake de leads automatizado',
      srv_c3_f2: 'Pipeline de contenido (research → draft → review)',
      srv_c3_f3: 'Triage de soporte al cliente con Claude API',
      srv_c3_f4: 'Workflows de redacción + resumen de documentos',
      srv_c3_f5: 'Flujos n8n + integraciones (Slack, Notion, CRMs, Sheets)',
      srv_c3_f6: 'Webhooks + retry logic + observabilidad',
      srv_c3_f7: 'Retainer de mantenimiento 30 días incluido',

      srv_c4_title: 'AI Site Deploy',
      srv_c4_tag: 'De build Claude/Lovable → site en vivo con analytics. Turnaround rápido para founders que ya tienen la build.',
      srv_c4_time: 'Turnaround 48–72h',
      srv_c4_savings: 'Ahorras 5 días vs. agencia típica',
      srv_c4_f1: 'Despliegue en Vercel o Cloudflare Pages',
      srv_c4_f2: 'Dominio custom + SSL + configuración DNS',
      srv_c4_f3: 'Setup de GA4 + Search Console + Bing Webmaster',
      srv_c4_f4: 'Envío de sitemap + verificación',
      srv_c4_f5: 'Documentación de handover para producción',

      // ===== Comparison =====
      cmp_kicker: 'Tú vs. ellos',
      cmp_h2_pre: 'Las matemáticas dan ',
      cmp_h2_accent: 'vergüenza.',
      cmp_sub: 'Compara tus tres opciones reales contra la que llevas evitando. Bastante obvio qué columna gana.',
      cmp_winner_badge: 'Ganador',
      cmp_row_price: 'Precio',
      cmp_row_time: 'Time to ship',
      cmp_row_ai: 'Construido con IA',
      cmp_row_calls: 'Discovery calls',
      cmp_row_async: 'Async-first',
      cmp_row_prod: 'Probado en producción',
      cmp_row_risk: 'Riesgo',

      cmp_col1_name: 'No hacer nada',
      cmp_col1_sub: 'Status quo',
      cmp_col1_price: '$0 + ingresos perdidos',
      cmp_col1_time: 'Nunca',
      cmp_col1_ai: 'No',
      cmp_col1_calls: 'Espirales de pestañas constantes',
      cmp_col1_async: '—',
      cmp_col1_prod: '—',
      cmp_col1_risk: '100% — cada día',

      cmp_col2_name: 'Contratar un dev',
      cmp_col2_sub: 'In-house · $8k+/mes',
      cmp_col2_price: '$8,000+/mes',
      cmp_col2_time: '6–10 semanas',
      cmp_col2_ai: 'Quizá',
      cmp_col2_calls: '3 reuniones semanales',
      cmp_col2_async: 'No',
      cmp_col2_prod: 'Proyectos paralelos',
      cmp_col2_risk: '50%',

      cmp_col3_name: 'Contratar una agencia',
      cmp_col3_sub: '$20k–$50k · 3+ meses',
      cmp_col3_price: '$20,000–$50,000',
      cmp_col3_time: '3–6 meses',
      cmp_col3_ai: 'Add-on $$$',
      cmp_col3_calls: 'Fase de kickoff de 2 semanas',
      cmp_col3_async: 'No',
      cmp_col3_prod: 'Outsourced offshore',
      cmp_col3_risk: '70%',

      cmp_col4_name: 'Trabajar conmigo',
      cmp_col4_sub: 'Async · 48h–10d · $200–$4,500',
      cmp_col4_price: '$200 — $4,500',
      cmp_col4_time: '48h — 10 días',
      cmp_col4_ai: 'Por defecto',
      cmp_col4_calls: 'Cero — solo async',
      cmp_col4_async: 'Sí — sin Zoom',
      cmp_col4_prod: '9 sites en producción',
      cmp_col4_risk: '0% — si fallo el deadline = gratis',

      cmp_cta: 'Deja de pagar de más — reserva slot',

      // ===== Case Study =====
      case_kicker: 'Pruebas',
      case_h2_pre: 'Producción real. ',
      case_h2_accent: 'Números reales.',
      case_tag: 'Review editorial multi-agent · 9 sites',
      case_title: 'De 16 horas de review humano a 45 minutos de agentes guiados.',
      case_body1_html: 'Nueve sites en producción en verticales US de finanzas al consumidor. <strong>200+ issues de compliance E-E-A-T</strong> bloqueando la monetización de AdSense. Cotización típica de industria: <strong>$20k–$50k y 3–4 meses.</strong> Coste de no hacer nada: <strong>~$3,200/mes en ad revenue perdido.</strong>',
      case_body2_html: 'Construí un <strong>pipeline de review multi-agent</strong> usando Claude Code + prompts custom. Un operador ahora audita los nueve sites en menos de una hora. Construido solo, en 6 días laborables.',
      case_bar1_lbl: 'Antes — review manual',
      case_bar1_val: '16h / site / semana',
      case_bar2_lbl: 'Después — pipeline multi-agent',
      case_bar2_val: '0.75h / site / semana',
      case_delta: '↓ 95% de tiempo ahorrado · cotización de agencia evitada · ad revenue restaurado en 6 días',
      case_bar3_lbl: 'Cotización industria',
      case_bar3_val: '$20k–$50k · 3–4 meses',
      case_bar4_lbl: 'Mi build',
      case_bar4_val: '6 días · solo',

      // ===== Interactive Demos =====
      demos_kicker: 'Demos interactivas',
      demos_h2_pre: 'Cómo subiría ',
      demos_h2_accent: 'tus números.',
      demos_sub: 'Tres tools en vivo que uso en cada proyecto. Elige una — mira las matemáticas detrás de una build senior de conversión vs. la homepage típica de founder.',
      demos_tab_adsense: 'AdSense compliance',
      demos_tab_conversion: 'Auditoría de conversión',
      demos_tab_revenue: 'Subida de revenue',

      // AdSense
      ads_chip_demo: 'Auditoría en vivo',
      ads_title: 'Auditor de compliance AdSense',
      ads_context: 'La misma auditoría que ejecuto en sites YMYL en producción — destilada en 5 categorías y renderizada en tiempo real. Elige un ejemplo para ver el desglose.',
      ads_select_label: 'Site de ejemplo',
      ads_opt_strong: 'Ejemplo fuerte',
      ads_opt_typical: 'Ejemplo típico generado con IA',
      ads_opt_under: 'Ejemplo sub-optimizado',
      ads_run: 'Ejecutar auditoría',
      ads_idle: 'Elige un ejemplo y ejecuta la auditoría.',
      ads_scanning: 'Escaneando señales E-E-A-T, schema, citaciones…',
      ads_out_of: 'sobre 100',
      ads_cta: 'Conseguir esta auditoría en tu site',

      // Conversion
      conv_chip_demo: 'Auditoría en vivo',
      conv_title: 'Auditoría de conversión',
      conv_context: 'El mismo diagnóstico de 5 factores que ejecuto en landing pages antes de cotizar un rebuild. Compara tres arquetipos reales — mira dónde están las fugas.',
      conv_select_label: 'Página de ejemplo',
      conv_opt_founder: 'Homepage típica de founder',
      conv_opt_saas: 'Landing SaaS de plantilla',
      conv_opt_rebuilt: 'La misma página, después de mi rebuild',
      conv_scanning: 'Midiendo claridad de hero, visibilidad de CTA, social proof…',
      conv_cta: 'Subir estos números en tu site',

      // Revenue
      rev_chip_calc: 'Calculadora',
      rev_chip_math: 'Matemáticas de conversión',
      rev_chip_live: 'Preview en vivo',
      rev_title: 'Calculadora de subida de revenue',
      rev_context: 'Introduce tus números reales. Mira lo que añade una build senior de conversión vs. no hacer nada, vs. una landing media de industria.',
      rev_slider_visitors: 'Visitas mensuales',
      rev_slider_rate: 'Tasa de conversión actual',
      rev_slider_value: 'Valor medio de cliente',
      rev_results_title: 'Escenarios de revenue mensual',
      rev_row_today: 'Hoy',
      rev_row_today_sub: 'Tus números',
      rev_row_industry: 'Landing media de industria',
      rev_row_industry_sub: '2.5% conversión',
      rev_row_mine: 'Construido por mí',
      rev_row_mine_sub: 'Objetivo 5% conversión',
      rev_lift_label: 'Subida mensual neta',
      rev_lift_yr_suffix: '/ año',
      rev_cta: 'Reservar esta subida',

      // ===== Recent Work =====
      work_kicker: 'Trabajos recientes',
      work_h2_pre: 'Builds en producción, no ',
      work_h2_accent: 'relleno de portfolio.',
      work_c1_title: 'Sistema multi-agent de review editorial',
      work_c1_ctx: 'Reducción de tiempo en auditoría completa de site. De ~16 horas de review manual a ~45 minutos de ejecución multi-agent guiada en nueve sites.',
      work_c1_footer: 'Case study en preparación',
      work_c2_title: 'Fix de middleware en Cloudflare Pages',
      work_c2_ctx: 'Resolví un issue de crawling de AdSense que bloqueaba la monetización en un site de educación de crédito. Diagnosticado vía workflow multi-agent de debugging.',
      work_c2_footer: 'Case study en preparación',
      work_c3_title: 'Funnel de ventas para comunidad de trading algorítmico',
      work_c3_ctx: 'Construí el funnel de ventas completo para nico66fx PRO — comunidad española de trading algorítmico. Hero, segmentación 3 perfiles, demo panel en vivo, integración con Myfxbook, Stripe checkout, WhatsApp + Telegram CTAs, comunidad Skool embebida. 102 miembros PRO en producción.',
      work_c3_footer: 'Visita la web',

      // ===== Local business =====
      local_kicker: 'Para negocios locales',
      local_heading_pre: 'Tu negocio local también merece estar ',
      local_heading_accent: 'online.',
      local_intro: 'Para pequeño comercio, autónomos y negocios locales que necesitan una web que venda + funnel de ventas — no un folleto de 5.000€.',
      local_badge: 'Local',
      local_price: 'Precio',
      local_timeline: 'Plazo',
      local_cta: 'Hablamos',
      local_card1_title: 'Web para tu negocio local',
      local_card1_tagline: 'Una landing que vende, no un folleto digital.',
      local_card1_time: '5–10 días',
      local_card1_f1: 'Diseño custom (sin plantillas WordPress)',
      local_card1_f2: 'Optimizada para móvil (donde te encuentra el 80% de tus clientes)',
      local_card1_f3: 'Botón WhatsApp + integración Google Maps',
      local_card1_f4: 'Formulario de contacto + integración email',
      local_card1_f5: 'SEO local básico (Google Business + schema)',
      local_card1_f6: 'Carga rápida en Cloudflare Pages',
      local_card1_f7: '30 días de soporte post-lanzamiento',
      local_card2_title: 'Funnel de ventas local',
      local_card2_tagline: 'El sistema que captura, cualifica y cierra clientes locales en automático.',
      local_card2_time: '7–14 días',
      local_card2_f1: 'Landing optimizada para conversión',
      local_card2_f2: 'Captura de leads vía formulario + WhatsApp',
      local_card2_f3: 'Email follow-up automatizado (Brevo / Mailchimp)',
      local_card2_f4: 'Integración WhatsApp Business API',
      local_card2_f5: 'Calendario de reservas (Calendly o similar)',
      local_card2_f6: 'Dashboard básico de métricas',
      local_card2_f7: '30 días de iteración + ajustes',
      local_card3_title: 'Google Maps + SEO local',
      local_card3_tagline: 'Si no apareces en Google Maps, no existes. Solución en 48-72h.',
      local_card3_time: '48–72h',
      local_card3_f1: 'Setup u optimización de Google Business Profile',
      local_card3_f2: 'Categorías, atributos, horarios, fotos',
      local_card3_f3: 'Estrategia de reseñas (cómo pedirlas)',
      local_card3_f4: 'Schema LocalBusiness en tu web',
      local_card3_f5: 'Auditoría NAP en directorios locales',
      local_card3_f6: 'Reporte inicial vs. 30 días después',
      local_recent_label: 'Trabajos locales recientes',
      local_recent1_tag: 'Frutería de barrio · Almería',
      local_recent1_desc: 'Web + Google Business · Tráfico orgánico mes 1: 0 → 240 visitas',
      local_recent2_tag: 'nico66fx PRO · Trading algorítmico',
      local_recent2_desc: 'Funnel completo: hero, pricing, Stripe, Skool · 102 miembros PRO en producción',
      local_recent3_tag: 'Coming soon — tu negocio',
      local_recent3_desc: 'Slot abierto · Ship en 7-10 días',
      local_section_cta: '¿Tienes un negocio local y estás harto de perder clientes porque no apareces en Google? Hablamos.',
      local_email_cta: 'Email directo',
      local_whatsapp_cta: 'WhatsApp directo',

      // ===== Process =====
      process_kicker: 'Cero fricción',
      process_h2_pre: 'De email a ',
      process_h2_accent: 'shipped',
      process_h2_post: ' en cuatro movimientos.',
      process_sub: 'Sin discovery calls. Sin reuniones de status. Sin Slack a medianoche. Me escribes un email, te mando una cotización cerrada, y empieza el trabajo.',
      process_s1_title: 'Me escribes',
      process_s1_meta: '— respuesta en menos de 4h',
      process_s1_body: 'Describe el proyecto por escrito. Respondo en 4 horas con scope, plazo y precio cerrado. Sin call necesaria, nunca.',
      process_s2_title: 'Firma + arranque',
      process_s2_meta: '— mismo día',
      process_s2_body: 'Contrato firmado el mismo día. Múltiples opciones de pago incluyendo Stripe y factura. 50% por adelantado en proyectos sobre $500. El trabajo arranca en horas tras el pago.',
      process_s3_title: 'Logs diarios',
      process_s3_meta: '— async',
      process_s3_body: 'Updates de progreso escritos cada día. Loom screen-recordings para handovers técnicos — los ves a tu ritmo. Tú revisas, yo itero. Sin reuniones de status.',
      process_s4_title: 'Ship + garantía',
      process_s4_meta: '— 7–30 días',
      process_s4_body: 'Despliegue de producción + documentación + 7–30 días de soporte post-launch. Si algo se rompe, lo arreglo. Si fallo el deadline, el deploy es gratis.',

      // ===== About =====
      about_kicker: 'Sobre mí',
      about_h2_pre: 'Hola, soy ',
      about_h2_accent: 'Javi.',
      about_p1_html: 'Tengo 20 años, vivo en Almería, España. Construyo sistemas de IA en producción y webs con <strong>Claude Code</strong> como mi daily driver.',
      about_p2: 'No tengo título de informática. No vengo de un trabajo en fintech. Lo que tengo son 15+ meses de deployment intensivo de tools de IA, mentalidad de operador, y la disciplina para shipping de calidad de producción rápido.',
      about_p3_html: 'Mi portfolio corre en <strong>nueve sites</strong> en verticales US de finanzas al consumidor: seguros, refinanciación de hipoteca, alivio fiscal, costes legales, Medicare, precios de VPN, crédito, presupuesto de viajes y finanzas personales. Cada workflow en este site ha sido testado a presión en entornos live de producción.',
      about_p4: 'Disponible para contratar. Trabajo async, en español o inglés, y entrego en días, no meses.',
      about_flow_title: 'Cómo trabajo realmente con Claude Code',
      about_flow_pause: 'Pausar',
      about_flow_play: 'Play',
      about_flow_replay: 'Replay',
      about_flow_node1_label: 'Opus 4.7',
      about_flow_node1_role: 'Diagnóstico',
      about_flow_node1_title: 'Opus 4.7 · diagnóstico',
      about_flow_node1_body: 'Análisis de causa raíz. Decisiones de alto impacto. Lee código, identifica problemas arquitectónicos, propone plan.',
      about_flow_node2_label: 'Sonnet 4.6',
      about_flow_node2_role: 'Ejecutor',
      about_flow_node2_title: 'Sonnet 4.6 · ejecutor',
      about_flow_node2_body: 'Ejecución del plan. Edits multi-archivo, generación de scripts, operaciones en lote. Validado por Opus.',
      about_flow_node3_label: 'Verificación',
      about_flow_node3_role: 'Auditoría live',
      about_flow_node3_title: 'Verificación',
      about_flow_node3_body: 'Auditoría live del site. curl checks, validación de schema, testing de redirects. Pilla regresiones antes del commit.',
      about_flow_node4_label: 'Aprobación humana',
      about_flow_node4_role: 'Tú',
      about_flow_node4_title: 'Aprobación humana',
      about_flow_node4_body: 'Revisión final. Inspección de diff, check visual, OK explícito antes del git push. Sin commits autónomos.',

      // ===== Guarantee =====
      guar_kicker: 'Reversión del riesgo',
      guar_h2_pre: 'Tú no asumes el riesgo. ',
      guar_h2_accent: 'Yo sí.',
      guar_title_pre: 'Si fallo el deadline, el ',
      guar_title_accent: 'deploy es gratis.',
      guar_body1: 'Cada proyecto sale con una fecha de entrega por escrito. Si la fallo por cualquier motivo de mi lado, te llevas el deploy de producción gratis — quédate el código, quédate el trabajo, me debes $0.',
      guar_body2_html: '<strong>9 sites en producción shipped, cero deadlines fallados.</strong> Si vas a apostar por alguien con quien nunca has trabajado, así es como te quito el riesgo.',

      // ===== FAQ =====
      faq_kicker: 'Objeciones, resueltas',
      faq_h2_pre: 'Las preguntas que ibas a ',
      faq_h2_accent: 'escribir.',
      faq_q1: '¿Por qué tan barato? ¿Dónde está el truco?',
      faq_a1_html: 'No hay truco. Uso IA para hacer en días lo que las agencias facturan a 3 meses. Ellos pagan a juniors por horas; yo envío solo con Claude Code como force multiplier. Mismo output, fracción del tiempo, fracción del precio. <strong>No eres el cliente para el que están construidos, y eso es buena noticia.</strong>',
      faq_q2: '¿Y si ya tengo un desarrollador?',
      faq_a2_html: 'Genial — te lo van a agradecer. Me enchufo en repos existentes, despliego en tu stack, y devuelvo documentación limpia. La mayoría de mis gigs de workflow automation son <strong>comprados por founders para dárselos a sus desarrolladores.</strong> Les libera para trabajo de mayor leverage.',
      faq_q3: 'Nunca he contratado async. ¿Y si necesito una call?',
      faq_a3_html: 'Prueba escribir el email primero. El 95% de las veces, la pregunta que "necesita una call" se resuelve en 3 líneas escritas. Si genuinamente no, hago una Loom de 20 min gratis. <strong>Cero reuniones recurrentes, nunca.</strong>',
      faq_q4: '¿Cuál es tu stack?',
      faq_a4: 'Claude Code (daily driver), Cloudflare Pages, Vercel, n8n, Anthropic API, GA4, Search Console. Para workflows: Slack, Notion, Airtable, Stripe, la mayoría de CRMs principales. Si tienes un stack raro, pregunta — habré visto la mayoría.',
      faq_q5: '¿Aceptas equity en vez de dinero?',
      faq_a5: 'No. Solo precio cerrado en USD. Mantengo las cosas simples para que puedas despedirme cuando quieras.',
      faq_q6: 'Tienes 20 años. ¿Por qué debería confiar en ti?',
      faq_a6_html: 'Porque tengo <strong>nueve sites en producción US live</strong>, cobertura editorial en The Epoch Times y CMSWire, y un workflow multi-agent que resuelve el problema E-E-A-T de AdSense que ninguna agencia que he visto ha resuelto. La edad no es una credencial. Los receipts sí.',
      faq_q7: '¿Cómo de rápido podemos empezar?',
      faq_a7_html: 'Si me escribes hoy y pagas mañana, miércoles estoy escribiendo código. <strong>3 slots abiertos para el intake actual</strong> — cuando se llenan, el siguiente intake es el mes que viene.',

      // ===== Last call (Final CTA) =====
      lc_kicker: 'Última llamada',
      lc_h2_pre: 'O sigue ',
      lc_h2_accent: 'sangrando.',
      lc_sub_html: '$2,400/mes haciendo busywork. Rivales lentos pasándote por encima. Agencias cotizándote el trimestre que viene.<br/>O un email. Hoy.',
      lc_countdown_pre: ' cierra en',
      lc_form_name: 'Nombre',
      lc_form_name_ph: 'Tu nombre',
      lc_form_email: 'Email',
      lc_form_email_ph: 'tu@empresa.com',
      lc_form_msg: 'En qué estás trabajando',
      lc_form_msg_ph: 'Brief corto: qué estás construyendo, plazo, y qué tipo de ayuda necesitas.',
      lc_form_submit: 'Reservar mi slot',
      lc_meta_reply: 'Respuesta media 4h',
      lc_meta_price: 'Precio cerrado',
      lc_meta_async: 'Solo async',
      lc_meta_warranty: 'Deploy gratis si fallo',
      lc_dm_label: 'O DM directo',

      // ===== Sticky mobile CTA =====
      sticky_from: 'Async · Precio cerrado',
      sticky_price_html: 'Desde <b>$200</b> — envío en días',
      sticky_cta: 'Reservar slot',

      // ===== Footer =====
      footer_tagline: 'Sistemas de IA en producción · shipped en días',
      footer_copyright: '© 2026 Javi Pérez · Almería, España',

      // ===== Intake reopens =====
      countdown_reopens: 'Próxima entrada el día 1',

      // ===== Work card 3 — nico66fx live case study =====
      work_c3_live_badge: 'Case study en vivo',
      work_c3_metric_sub: 'miembros PRO',

      // ===== Local recent strip 2 — nico66fx link =====
      local_recent2_link: 'Visita la web →',

      // ===== WhatsApp floating button =====
      whatsapp_fab_label: 'WhatsApp',
    },
  };

  // Expose translations so other scripts (countdown, audit summaries, etc.)
  // can localize their dynamic text by reading window.__i18nGet('key').
  window.__i18nT = T;
  window.__i18nGet = (key, fallback = '') => {
    const lang = document.documentElement.lang || 'en';
    return (T[lang] && T[lang][key]) || (T.en && T.en[key]) || fallback;
  };

  const applyTranslations = (lang) => {
    const dict = T[lang] || T.en;

    // Pure textContent
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = dict[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    // innerHTML (for strings that contain inline <strong>, <br>, etc.)
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = dict[el.dataset.i18nHtml];
      if (v != null) el.innerHTML = v;
    });
    // Attribute translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const v = dict[el.dataset.i18nPlaceholder];
      if (v != null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const v = dict[el.dataset.i18nAriaLabel];
      if (v != null) el.setAttribute('aria-label', v);
    });
  };

  window.setLanguage = (lang) => {
    if (!T[lang]) return;
    document.documentElement.lang = lang;
    applyTranslations(lang);

    // Toggle visual state
    document.querySelectorAll('.lang-toggle').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    // Persist
    try { localStorage.setItem('preferred-lang', lang); } catch (_) {}

    // Notify other listeners (countdown, audit checkers, etc.)
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  };

  const initLanguage = () => {
    let saved = null;
    try { saved = localStorage.getItem('preferred-lang'); } catch (_) {}
    const browserLang = (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
    const lang = saved || browserLang;
    window.setLanguage(lang);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
  } else {
    initLanguage();
  }
})();
