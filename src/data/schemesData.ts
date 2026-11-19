import type { GovernmentScheme } from '../types/finance';

export const INITIAL_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pmjdy',
    name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
    shortCode: 'PMJDY',
    category: 'Financial inclusion schemes',
    level: 'Central Government',
    targetAudiences: ['General Public', 'Women', 'Farmers'],
    description: 'National Mission for Financial Inclusion offering universal access to basic savings bank deposit accounts, RuPay debit cards, and direct benefit transfers without minimum balance requirements.',
    eligibility: [
      'Any Indian citizen aged 10 years and above.',
      'Minors above 10 years can open accounts operated independently or with guardians.',
      'Individuals without an existing basic savings bank account.'
    ],
    requiredDocuments: [
      'Aadhaar Card (or officially valid KYC document such as Voter ID, Driving License, PAN, Passport, or NREGA Job Card).',
      'Two recent passport-size photographs.',
      'Completed account opening form at bank branch or Business Correspondent (Bank Mitra).'
    ],
    benefits: [
      'Zero minimum balance requirement in Basic Savings Bank Deposit Account (BSBDA).',
      'RuPay Debit Card with inbuilt accidental insurance cover (verify current terms with issuing bank; ₹2 lakh for accounts opened after 28.08.2018).',
      'Overdraft facility up to ₹10,000 for eligible account holders after satisfactory operation.',
      'Direct Benefit Transfer (DBT) reception for central and state subsidies.'
    ],
    applicationProcedure: [
      'Visit any scheduled commercial bank branch or authorized Bank Mitra outlet.',
      'Submit the PMJDY account opening form with KYC documents.',
      'Complete biometric e-KYC or document verification and collect passbook and RuPay card.'
    ],
    importantConditions: [
      'Account must remain active with RuPay card usage within stipulated periods to maintain accidental cover eligibility.',
      'Only one BSBDA account is permitted per individual across banks.'
    ],
    deadline: 'Ongoing (Open year-round)',
    officialWebsite: 'https://pmjdy.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Active nationwide across all public and private sector banks with DBT integration.',
    keywords: ['zero balance', 'bank account', 'rupay', 'financial inclusion', 'jan dhan']
  },
  {
    id: 'ssy',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    shortCode: 'SSY',
    category: 'Savings schemes',
    level: 'Central Government',
    targetAudiences: ['Women', 'Families'],
    description: 'Government-backed small savings scheme designed for the long-term education and future security of a girl child, offering tax benefits under Section 80C and sovereign guarantee.',
    eligibility: [
      'Natural or legal guardian on behalf of a girl child.',
      'Girl child must be below 10 years of age at the time of account opening.',
      'Maximum two accounts per family (exception for twins/triplets on second birth).'
    ],
    requiredDocuments: [
      'Birth certificate of the girl child.',
      'Identity and address proof of the parent or legal guardian (Aadhaar/PAN).',
      'Account opening form and initial deposit (minimum ₹250).'
    ],
    benefits: [
      'Government-notified quarterly interest rate (compounded annually; verify current quarterly rate on nsiindia.gov.in).',
      'Deposits qualify for deduction under Section 80C up to ₹1.5 lakh per financial year (under Old Tax Regime).',
      'Interest earned and maturity proceeds are exempt from income tax under current EEE status.',
      'Partial withdrawal up to 50% allowed after the girl turns 18 or passes 10th standard for higher education.'
    ],
    applicationProcedure: [
      'Visit an authorized Post Office or designated public/private sector bank branch.',
      'Fill out the Sukanya Samriddhi Account opening form with guardian KYC and child birth certificate.',
      'Deposit between ₹250 and ₹1,50,000 per financial year.'
    ],
    importantConditions: [
      'Account matures 21 years from the date of opening or upon marriage of the girl child after age 18.',
      'Minimum annual deposit of ₹250 is required to keep the account active (penalty applies on default).'
    ],
    deadline: 'Ongoing (Before girl child turns 10)',
    officialWebsite: 'https://www.nsiindia.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Quarterly small savings interest rates notified by Ministry of Finance; check NSI portal for current quarter rate.',
    keywords: ['girl child', 'sukanya', '80c', 'post office', 'savings']
  },
  {
    id: 'ppf',
    name: 'Public Provident Fund (PPF)',
    shortCode: 'PPF',
    category: 'Savings schemes',
    level: 'Central Government',
    targetAudiences: ['General Public', 'Families'],
    description: 'Long-term 15-year sovereign-backed savings and retirement corpus builder with tax-exempt interest and flexible annual contributions.',
    eligibility: [
      'Any resident Indian citizen in their individual capacity.',
      'Parents/guardians may also open an account on behalf of a minor.',
      'NRIs are not eligible to open new PPF accounts.'
    ],
    requiredDocuments: [
      'Aadhaar Card and PAN Card.',
      'Address proof and passport-size photograph.',
      'Completed Form A (PPF account opening form).'
    ],
    benefits: [
      'Sovereign-backed capital protection and tax-free compounded annual interest.',
      'Minimum deposit ₹500 and maximum ₹1,50,000 per financial year.',
      'Loan facility available between 3rd and 6th financial year; partial withdrawals permitted from 7th year.',
      'Extendable in 5-year blocks after the 15-year lock-in period.'
    ],
    applicationProcedure: [
      'Apply online via net banking of authorized banks or visit a Post Office branch.',
      'Submit KYC documents and initial deposit (₹500 minimum).',
      'Manage annual contributions via lump sum or up to 12 monthly installments.'
    ],
    importantConditions: [
      '15-year lock-in period applies; premature closure permitted only under specified medical or higher education conditions after 5 years.',
      'Only one PPF account per individual is permitted.'
    ],
    deadline: 'Ongoing',
    officialWebsite: 'https://www.nsiindia.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Deposits made on or before the 5th of each month earn interest for that full month.',
    keywords: ['ppf', 'provident fund', 'tax free', '15 years', 'retirement']
  },
  {
    id: 'nsc',
    name: 'National Savings Certificate (NSC VIII Issue)',
    shortCode: 'NSC',
    category: 'Savings schemes',
    level: 'Central Government',
    targetAudiences: ['General Public', 'Senior Citizens'],
    description: 'Fixed-income 5-year Post Office savings instrument with guaranteed compounded interest and Section 80C deduction eligibility.',
    eligibility: [
      'Single adult, joint adults (up to 3), or guardian on behalf of a minor.',
      'Resident Indian citizens only (NRIs and HUFs not eligible).'
    ],
    requiredDocuments: [
      'Aadhaar Card, PAN Card, and photograph.',
      'Post Office savings account or KYC verification documents.'
    ],
    benefits: [
      'Fixed interest rate locked at purchase for the 5-year tenure, compounded annually.',
      'Minimum investment ₹1,000 with no upper ceiling.',
      'Accepted as collateral by banks for secured loans.'
    ],
    applicationProcedure: [
      'Visit any India Post office or use India Post Internet Banking.',
      'Submit NSC purchase application with KYC and deposit amount.'
    ],
    importantConditions: [
      '5-year lock-in period; premature encashment allowed only in specific contingencies like death of holder or court order.',
      'Annual accrued interest is taxable, though reinvested interest (years 1-4) qualifies under 80C limits in Old Tax Regime.'
    ],
    deadline: 'Ongoing',
    officialWebsite: 'https://www.nsiindia.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Available electronically via Post Office e-Passbook and DOP Internet Banking.',
    keywords: ['nsc', 'post office', 'fixed income', '5 year', 'certificate']
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana (APY)',
    shortCode: 'APY',
    category: 'Pension schemes',
    level: 'Central Government',
    targetAudiences: ['General Public', 'Small Business', 'Women'],
    description: 'Guaranteed monthly pension scheme administered by PFRDA providing ₹1,000 to ₹5,000 monthly pension after age 60 for unorganized sector and eligible citizens.',
    eligibility: [
      'Indian citizens aged between 18 and 40 years.',
      'Must hold an active savings bank or post office savings account.',
      'From 1 Oct 2022, individuals who are or have been income tax payers are ineligible to join APY.'
    ],
    requiredDocuments: [
      'Savings bank account number and Aadhaar card.',
      'Active mobile number for SMS alerts and PRAN generation.'
    ],
    benefits: [
      'Guaranteed minimum monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 starting at age 60.',
      'Spouse continues to receive the same pension after subscriber’s demise.',
      'Nominee receives accumulated pension corpus after demise of both subscriber and spouse.'
    ],
    applicationProcedure: [
      'Approach your bank branch or apply through your bank’s net banking / mobile banking portal.',
      'Select desired pension slab and contribution frequency (monthly, quarterly, or half-yearly).',
      'Authorize auto-debit from your savings account.'
    ],
    importantConditions: [
      'Contributions must continue until age 60; auto-debit requires sufficient account balance.',
      'Voluntary exit rules govern corpus return before age 60.'
    ],
    deadline: 'Ongoing (Age 18–40 at enrollment)',
    officialWebsite: 'https://www.npscra.nsdl.co.in/scheme-details.php',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Non-taxpayer eligibility condition verified per PFRDA guidelines.',
    keywords: ['pension', 'atal', 'retirement', 'pfrda', 'unorganized sector']
  },
  {
    id: 'pmjjby',
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    shortCode: 'PMJJBY',
    category: 'Insurance schemes',
    level: 'Central Government',
    targetAudiences: ['General Public', 'Families', 'Women'],
    description: 'Affordable one-year renewable life insurance cover of ₹2 lakh for death due to any cause, linked directly to a savings bank account.',
    eligibility: [
      'Individuals aged 18 to 50 years with a participating bank or post office savings account.',
      'Consent for annual auto-debit of premium.'
    ],
    requiredDocuments: [
      'Savings bank account details and Aadhaar linkage.',
      'Nominee details on consent-cum-declaration form.'
    ],
    benefits: [
      '₹2,00,000 life insurance cover payable to the nominee on death of the insured due to any reason.',
      'Annual premium of ₹436 (pro-rata based on quarter of enrollment; confirm current rate at bank).'
    ],
    applicationProcedure: [
      'Enroll through your bank branch, Bank Mitra, or bank mobile app / net banking.',
      'Complete consent form with nominee information for annual auto-renewal.'
    ],
    importantConditions: [
      'Coverage period runs from 1 June to 31 May each year.',
      '30-day lien period applies from enrollment date (except accidental death).'
    ],
    deadline: 'Annual renewal cycle (1 June – 31 May)',
    officialWebsite: 'https://jansuraksha.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Enrollable digitally via JanSamarth / bank portals.',
    keywords: ['life insurance', 'pmjjby', '2 lakh', 'term cover']
  },
  {
    id: 'pmsby',
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    shortCode: 'PMSBY',
    category: 'Insurance schemes',
    level: 'Central Government',
    targetAudiences: ['General Public', 'Farmers', 'Women'],
    description: 'Low-cost personal accidental death and disability insurance scheme offering ₹2 lakh coverage for ₹20 annual premium.',
    eligibility: [
      'Bank or post office savings account holders aged 18 to 70 years.',
      'Consent for annual auto-debit.'
    ],
    requiredDocuments: [
      'Aadhaar-linked bank account.',
      'Filled enrollment and nominee declaration form.'
    ],
    benefits: [
      '₹2,00,000 cover for accidental death or total permanent disability.',
      '₹1,00,000 cover for permanent partial disability (e.g., loss of one eye or one limb).',
      'Nominal annual premium of ₹20.'
    ],
    applicationProcedure: [
      'Apply via your bank branch, mobile banking app, or Jan Suraksha portal.',
      'Ensure ₹20 balance prior to annual auto-debit cycle.'
    ],
    importantConditions: [
      'Covers accidental death and specified disabilities only; natural death is not covered.',
      'Annual renewal cycle runs 1 June to 31 May.'
    ],
    deadline: 'Annual renewal cycle (1 June – 31 May)',
    officialWebsite: 'https://jansuraksha.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Premium remains ₹20/year under Jan Suraksha framework.',
    keywords: ['accident insurance', 'pmsby', '20 rupees', 'suraksha']
  },
  {
    id: 'pmkisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    shortCode: 'PM-KISAN',
    category: "Farmers' schemes",
    level: 'Central Government',
    targetAudiences: ['Farmers'],
    description: 'Central sector income support scheme providing ₹6,000 per year in three equal installments of ₹2,000 directly into eligible landholding farmer families’ bank accounts.',
    eligibility: [
      'All landholding farmer families having cultivable landholding in their names (subject to exclusion criteria).',
      'Institutional landholders, constitutional post holders, and income tax payers are excluded.'
    ],
    requiredDocuments: [
      'Aadhaar Card (mandatory for e-KYC).',
      'Landholding ownership records (RTC / Khatauni / Patta).',
      'Aadhaar-seeded active bank account.'
    ],
    benefits: [
      '₹6,000 annual financial support transferred directly via DBT in three ₹2,000 installments.',
      'Helps meet agricultural input and household liquidity needs.'
    ],
    applicationProcedure: [
      'Register online at pmkisan.gov.in or via local Common Service Centre (CSC) / Patwari / Agriculture Officer.',
      'Complete mandatory e-KYC through OTP or biometric authentication at CSC.'
    ],
    importantConditions: [
      'e-KYC and land seeding verification are mandatory to receive installments.',
      'Bank account must be Aadhaar-seeded (NPCI DBT enabled).'
    ],
    deadline: 'Ongoing registration',
    officialWebsite: 'https://pmkisan.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'e-KYC via PM-KISAN mobile app face authentication and CSC centers is active.',
    keywords: ['farmer', 'kisan', 'agriculture', '6000', 'dbt']
  },
  {
    id: 'pmjay',
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    shortCode: 'AB-PMJAY',
    category: 'Healthcare schemes',
    level: 'Central Government',
    targetAudiences: ['Families', 'Senior Citizens', 'General Public'],
    description: 'Health assurance scheme providing cashless secondary and tertiary hospitalization cover up to ₹5 lakh per family per year at empanelled public and private hospitals.',
    eligibility: [
      'Eligible families identified via SECC 2011 deprivation/occupational criteria and covered state extensions.',
      'Senior citizens aged 70+ are also eligible under the Ayushman Vaya Vandana extension regardless of income (verify enrollment on beneficiary portal).'
    ],
    requiredDocuments: [
      'Aadhaar Card and Ration Card / Family ID.',
      'Active mobile number for Ayushman card e-KYC.'
    ],
    benefits: [
      'Up to ₹5,00,000 annual cashless hospitalization cover per eligible family.',
      'Covers pre-hospitalization (3 days) and post-hospitalization (15 days) expenses including diagnostics and medicines.',
      'Portable across empanelled hospitals nationwide.'
    ],
    applicationProcedure: [
      'Check eligibility on beneficiary.nha.gov.in or Ayushman App.',
      'Complete Aadhaar e-KYC online or at an empanelled hospital / CSC to download your Ayushman Card.'
    ],
    importantConditions: [
      'Cashless treatment applies strictly at empanelled hospitals for covered medical packages.',
      'No cap on family size or age within eligible family unit.'
    ],
    deadline: 'Ongoing',
    officialWebsite: 'https://pmjay.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Senior citizen 70+ universal cover module live on beneficiary.nha.gov.in.',
    keywords: ['health insurance', 'hospital', 'ayushman', '5 lakh', 'senior citizen']
  },
  {
    id: 'nsp',
    name: 'National Scholarship Portal (NSP) Schemes',
    shortCode: 'NSP',
    category: 'Education scholarships',
    level: 'Central Government',
    targetAudiences: ['Students'],
    description: 'Single-window digital portal hosting Pre-Matric, Post-Matric, Merit-cum-Means, and Central Sector Scholarships across Central Ministries and State Governments.',
    eligibility: [
      'School, college, and university students meeting scheme-specific income, merit, and category thresholds.',
      'One-Time Registration (OTR) on NSP is mandatory.'
    ],
    requiredDocuments: [
      'Aadhaar Card & OTR ID.',
      'Previous academic mark sheets and bonafide student certificate.',
      'Family income certificate, caste/domicile certificate (if applicable), and Aadhaar-seeded bank account.'
    ],
    benefits: [
      'Direct bank transfer of tuition fee reimbursement and maintenance allowances.',
      'Transparent tracking from institute verification to DBT disbursement.'
    ],
    applicationProcedure: [
      'Complete One-Time Registration (OTR) at scholarships.gov.in with Aadhaar face authentication.',
      'Select eligible Central, UGC, AICTE, or State scholarship scheme and upload documents.',
      'Ensure institute nodal officer verifies application before deadline.'
    ],
    importantConditions: [
      'Annual scheme deadlines vary by ministry (typically October–December each academic year); verify exact dates on scholarships.gov.in.',
      'Students cannot simultaneously avail multiple scholarships for the same course unless permitted.'
    ],
    deadline: 'Annual academic cycle (Verify exact dates on NSP portal)',
    officialWebsite: 'https://scholarships.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'OTR (One-Time Registration) mandatory for all fresh and renewal NSP applications.',
    keywords: ['scholarship', 'students', 'education', 'college', 'nsp']
  },
  {
    id: 'pmay',
    name: 'Pradhan Mantri Awas Yojana (PMAY-U / PMAY-G)',
    shortCode: 'PMAY',
    category: 'Housing schemes',
    level: 'Central Government',
    targetAudiences: ['Families', 'Women', 'General Public'],
    description: 'Flagship housing mission supporting EWS, LIG, and MIG urban households and rural families to build or acquire a pucca house with financial assistance or interest subsidies.',
    eligibility: [
      'Family should not own a pucca house anywhere in India.',
      'Household annual income must fall within notified EWS/LIG/MIG guidelines for the active phase (PMAY-U 2.0 / PMAY-G).'
    ],
    requiredDocuments: [
      'Aadhaar details of all family members.',
      'Income proof, bank account details, and land/property documents where applicable.'
    ],
    benefits: [
      'Interest subsidy or direct financial assistance depending on vertical (BLC, AHP, ISS, PMAY-G).',
      'Preference for female ownership or co-ownership.'
    ],
    applicationProcedure: [
      'Apply online via official PMAY-U 2.0 portal (pmaymis.gov.in) or through Urban Local Body / Gram Panchayat.',
      'Track beneficiary assessment and sanction status online.'
    ],
    importantConditions: [
      'Beneficiary must not have previously availed central housing assistance.',
      'Verify active phase eligibility and state norms on pmaymis.gov.in.'
    ],
    deadline: 'Verify active phase dates on PMAY portal',
    officialWebsite: 'https://pmaymis.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'PMAY-U 2.0 unified web portal active for EWS/LIG/MIG urban applicants.',
    keywords: ['housing', 'home', 'awas', 'subsidy', 'pmay']
  },
  {
    id: 'mudra',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    shortCode: 'PMMY',
    category: 'Small business schemes',
    level: 'Central Government',
    targetAudiences: ['Small Business', 'Women', 'General Public'],
    description: 'Collateral-free institutional credit up to ₹20 lakh (under Shishu, Kishore, Tarun, and Tarun Plus categories) for non-corporate, non-farm micro and small enterprises.',
    eligibility: [
      'Indian citizens with a viable business plan in manufacturing, trading, services, or allied agriculture.',
      'Existing or new micro/small enterprise proprietors without willful default history.'
    ],
    requiredDocuments: [
      'Identity and address proof (Aadhaar, PAN, Voter ID).',
      'Business registration/address proof, quotation for machinery/equipment, and 6-month bank statement.'
    ],
    benefits: [
      'Shishu: up to ₹50,000; Kishore: ₹50,001 to ₹5 lakh; Tarun: ₹5 lakh to ₹10 lakh; Tarun Plus: ₹10 lakh to ₹20 lakh (for successful previous Tarun borrowers).',
      'No collateral security required for MUDRA loans.'
    ],
    applicationProcedure: [
      'Apply online through JanSamarth Portal (jansamarth.in) or Udyami Mitra portal, or visit a PSU/Private Bank, RRB, or MFI.',
      'Submit business project report and KYC documents.'
    ],
    importantConditions: [
      'Interest rates are determined by lending banks based on RBI guidelines.',
      'Repayment discipline affects eligibility for higher MUDRA tiers.'
    ],
    deadline: 'Ongoing',
    officialWebsite: 'https://www.mudra.org.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Tarun Plus category up to ₹20 lakh introduced for repeat successful borrowers.',
    keywords: ['business loan', 'mudra', 'startup', 'msme', 'collateral free']
  },
  {
    id: 'gruha-lakshmi-ka',
    name: 'Gruha Lakshmi Scheme (Karnataka)',
    shortCode: 'Gruha Lakshmi',
    category: 'Women empowerment schemes',
    level: 'Karnataka Government',
    stateName: 'Karnataka',
    targetAudiences: ['Women', 'Families'],
    description: 'Karnataka State Government financial assistance programme providing ₹2,000 per month via DBT to the woman head of eligible households holding BPL, APL, or Antyodaya ration cards.',
    eligibility: [
      'Woman head of the family listed on Antyodaya, BPL, or APL ration card issued in Karnataka.',
      'Applicant or spouse must not be an income tax payer or GST-registered business owner.'
    ],
    requiredDocuments: [
      'Ration Card (BPL/APL/Antyodaya) mentioning woman head of family.',
      'Aadhaar Card of applicant and spouse.',
      'Aadhaar-seeded active bank account passbook.'
    ],
    benefits: [
      '₹2,000 monthly direct bank transfer to support household nutrition, education, and financial independence.'
    ],
    applicationProcedure: [
      'Apply via Seva Sindhu portal (sevasindhugs.karnataka.gov.in) or visit Grama One, Karnataka One, or Bangalore One centers.',
      'Complete Aadhaar e-KYC and ration card verification.'
    ],
    importantConditions: [
      'Only one woman head per ration card is eligible.',
      'Bank account must be linked with Aadhaar for DBT.'
    ],
    deadline: 'Ongoing',
    officialWebsite: 'https://sevasindhugs.karnataka.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Applications processed through Seva Sindhu Guarantee Scheme portal and Karnataka One centres.',
    keywords: ['karnataka', 'women', 'gruha lakshmi', '2000', 'seva sindhu']
  },
  {
    id: 'yuva-nidhi-ka',
    name: 'Yuva Nidhi Scheme (Karnataka)',
    shortCode: 'Yuva Nidhi',
    category: 'Employment schemes',
    level: 'Karnataka Government',
    stateName: 'Karnataka',
    targetAudiences: ['Students', 'General Public'],
    description: 'Karnataka State unemployment financial support scheme assisting recent domiciled graduates and diploma holders while they seek employment or pursue skill training.',
    eligibility: [
      'Domicile of Karnataka (studied in Karnataka for at least 6 years up to graduation/diploma).',
      'Passed degree or diploma in the notified academic year and remained unemployed after 6 months of passing.',
      'Not pursuing higher education, self-employment with loans, or receiving ESIC/PF/NPS benefits.'
    ],
    requiredDocuments: [
      'Aadhaar Card and Ration Card / Domicile proof.',
      'Degree or Diploma marks cards / provisional certificate.',
      'Aadhaar-linked bank account and monthly self-declaration.'
    ],
    benefits: [
      '₹3,000 per month for degree holders and ₹1,500 per month for diploma holders for up to 24 months or until employed.'
    ],
    applicationProcedure: [
      'Register on Seva Sindhu Guarantee Portal (sevasindhugs.karnataka.gov.in) or visit Karnataka One / Grama One.',
      'Submit monthly unemployment self-declaration online.'
    ],
    importantConditions: [
      'Assistance stops immediately upon securing employment or completing 24 months.',
      'Monthly self-declaration is mandatory to continue DBT.'
    ],
    deadline: 'Verify eligible passing-year window on Seva Sindhu',
    officialWebsite: 'https://sevasindhugs.karnataka.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Monthly self-declaration and DBT tracking available via Seva Sindhu.',
    keywords: ['karnataka', 'youth', 'students', 'unemployment', 'yuva nidhi']
  },
  {
    id: 'scss',
    name: 'Senior Citizen Savings Scheme (SCSS)',
    shortCode: 'SCSS',
    category: 'Senior citizen schemes',
    level: 'Central Government',
    targetAudiences: ['Senior Citizens'],
    description: 'Government-guaranteed quarterly income savings scheme tailored for senior citizens offering regular quarterly payouts and high sovereign safety.',
    eligibility: [
      'Indian residents aged 60 years or above.',
      'Retired civilian employees aged 55–60 (if invested within 1 month of retirement benefits) and retired defence personnel aged 50+.'
    ],
    requiredDocuments: [
      'Aadhaar Card, PAN Card, and age/retirement proof.',
      'Passport-size photographs and filled Form 1.'
    ],
    benefits: [
      'Maximum deposit limit of ₹30,00,000 per individual.',
      'Quarterly interest payout directly to linked savings account.',
      '5-year tenure extendable by 3 years.'
    ],
    applicationProcedure: [
      'Open at any Post Office or authorized public/private bank branch.',
      'Deposit in multiples of ₹1,000 up to ₹30 lakh.'
    ],
    importantConditions: [
      'Interest earned is taxable and subject to TDS above prescribed senior citizen threshold (Sec 194A / 80TTB in Old Regime).',
      'Premature withdrawal incurs nominal deduction depending on tenure elapsed.'
    ],
    deadline: 'Ongoing',
    officialWebsite: 'https://www.nsiindia.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Maximum deposit limit stands at ₹30 lakh; check current quarterly rate on nsiindia.gov.in.',
    keywords: ['senior citizen', 'pensioners', 'quarterly income', 'scss', 'post office']
  },
  {
    id: 'myscheme-portal',
    name: 'MyScheme National Unified Scheme Discovery Portal',
    shortCode: 'myScheme',
    category: 'Financial inclusion schemes',
    level: 'Central Government',
    targetAudiences: ['General Public', 'Women', 'Students', 'Farmers', 'Senior Citizens'],
    description: 'Official Government of India platform by MeitY/NeGD allowing citizens to discover personalized Central and State welfare schemes based on age, state, income, and occupation.',
    eligibility: [
      'Open to all Indian residents across every state and union territory.'
    ],
    requiredDocuments: [
      'No documents needed to check eligibility; scheme-specific documents listed on each scheme card.'
    ],
    benefits: [
      'Covers 2,000+ Central and State Government schemes with verified eligibility checker.',
      'Direct links to official application portals.'
    ],
    applicationProcedure: [
      'Visit myscheme.gov.in and enter basic profile details (state, age, gender, category, occupation).',
      'Review matched schemes and click official apply links.'
    ],
    importantConditions: [
      'Always verify scheme-specific deadlines on the respective ministry/state portal.'
    ],
    deadline: 'Ongoing',
    officialWebsite: 'https://www.myscheme.gov.in/',
    lastVerifiedDate: '2026-10-15',
    latestUpdate: 'Official national aggregator maintained by National e-Governance Division (NeGD).',
    keywords: ['myscheme', 'india.gov.in', 'state schemes', 'central schemes', 'eligibility']
  }
];
