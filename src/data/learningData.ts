import type { LearningTopic } from '../types/finance';

export const LEARNING_CATEGORIES = [
  { id: 'basic_knowledge', name: 'A. Basic Financial Knowledge', shortName: 'Basic Finance' },
  { id: 'saving_budgeting', name: 'B. Saving and Budgeting', shortName: 'Saving & Budgeting' },
  { id: 'investment_education', name: 'C. Investment Education', shortName: 'Investments' },
  { id: 'loans_credit', name: 'D. Loans and Credit', shortName: 'Loans & Credit' },
  { id: 'tax_education', name: 'E. Tax Education', shortName: 'Tax Education' },
  { id: 'financial_safety', name: 'F. Financial Safety', shortName: 'Financial Safety' }
] as const;

export const INITIAL_LEARNING_TOPICS: LearningTopic[] = [
  // A. BASIC FINANCIAL KNOWLEDGE
  {
    id: 'learn-money-banks',
    categoryId: 'basic_knowledge',
    categoryName: 'Basic Financial Knowledge',
    title: 'What is Money & What Does a Bank Do?',
    level: 'Beginner',
    readTimeMinutes: 4,
    simpleExplanation: 'Money is an accepted medium of exchange used to buy goods, pay for services, and store value for future needs. A bank is a regulated financial institution (licensed by the RBI in India) that safeguards your money, pays interest on deposits, enables digital payments, and lends funds responsibly.',
    realLifeExample: 'Suppose Ramesh earns ₹18,000/month as a technician. Instead of keeping cash at home—where it earns zero interest and risks theft—he deposits it in his savings account. The bank keeps it safe, pays ~2.7%–3.5% annual interest, and lets him pay bills via UPI.',
    visualDiagramSummary: [
      { label: 'Medium of Exchange', value: '₹ Notes / UPI', note: 'Replaces barter so anyone can trade goods easily' },
      { label: 'Store of Value', value: 'Bank Deposit', note: 'Protected by DICGC insurance up to ₹5 lakh per bank' },
      { label: 'Credit Intermediation', value: 'Loans', note: 'Depositors’ pooled savings fund home/education/business loans' }
    ],
    importantPoints: [
      'RBI-regulated scheduled banks insure deposits up to ₹5,00,000 per depositor per bank via DICGC.',
      'Keeping excess cash idle at home loses purchasing power each year due to inflation.',
      'Always verify a bank or NBFC registration on the RBI website before depositing money.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Up to what amount are bank deposits insured per depositor per bank by DICGC in India?',
        options: ['₹1,00,000', '₹5,00,000', '₹10,00,000', 'No insurance'],
        correctIndex: 1,
        explanation: 'Under DICGC rules, eligible bank deposits (principal + interest) are insured up to ₹5 lakh per depositor per bank.'
      },
      {
        id: 'q2',
        question: 'Why is keeping all savings as physical cash at home risky?',
        options: ['It earns zero interest and loses value to inflation', 'Banks charge fees to count cash', 'Cash expires every year', 'Cash cannot buy groceries'],
        correctIndex: 0,
        explanation: 'Physical cash earns 0% return, faces theft/damage risk, and loses real purchasing power to inflation.'
      }
    ]
  },
  {
    id: 'learn-bank-accounts',
    categoryId: 'basic_knowledge',
    categoryName: 'Basic Financial Knowledge',
    title: 'Types of Bank Accounts: Savings, Current, FD & RD',
    level: 'Beginner',
    readTimeMinutes: 5,
    simpleExplanation: 'Banks offer specialized accounts for different goals: Savings Accounts for everyday household income and emergency cash; Current Accounts for businesses with frequent high-volume transactions (0% interest); Fixed Deposits (FD) for locking a lump sum at higher fixed interest; and Recurring Deposits (RD) for saving a fixed monthly amount.',
    realLifeExample: 'Ananya keeps ₹30,000 in her Savings Account for monthly bills, puts ₹2,000/month into a 12-month RD for her laptop goal, and places a ₹50,000 family bonus in a 2-year FD at 7% p.a.',
    visualDiagramSummary: [
      { label: 'Savings Account', value: '2.5% – 4% p.a.', note: 'Instant liquidity via ATM, UPI, NEFT' },
      { label: 'Current Account', value: '0% interest', note: 'Designed for businesses; unlimited daily transactions' },
      { label: 'Fixed / Recurring Deposit', value: '6% – 7.5% p.a.', note: 'Fixed tenure lock-in with higher predictable return' }
    ],
    importantPoints: [
      'Never use a Current Account for personal idle savings since it pays no interest.',
      'BSBDA / Jan Dhan savings accounts require zero minimum balance.',
      'Check premature withdrawal penalty rules before opening an FD or RD.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which account is best suited for a shopkeeper making 30+ daily business transactions?',
        options: ['Savings Account', 'Current Account', 'Recurring Deposit', 'PPF Account'],
        correctIndex: 1,
        explanation: 'Current Accounts are built for frequent commercial transactions without typical savings withdrawal caps.'
      }
    ]
  },
  {
    id: 'learn-cards-upi',
    categoryId: 'basic_knowledge',
    categoryName: 'Basic Financial Knowledge',
    title: 'Debit Cards, Credit Cards, UPI & Digital Banking',
    level: 'Beginner',
    readTimeMinutes: 5,
    simpleExplanation: 'A Debit Card spends money directly from your bank balance. A Credit Card lets you borrow money up to a limit and repay it by the billing due date (usually interest-free for 20–45 days if paid in full). UPI (Unified Payments Interface) enables instant mobile bank-to-bank transfers 24/7 using a VPA or QR code.',
    realLifeExample: 'When Priya buys groceries for ₹1,200 via UPI or Debit Card, ₹1,200 leaves her bank immediately. If she uses a Credit Card and pays only the minimum due instead of the full ₹1,200, she could face 36%–42% annualized interest on the remaining balance.',
    visualDiagramSummary: [
      { label: 'UPI', value: 'Instant · ₹0 Fee', note: 'Requires bank account + UPI PIN; never enter PIN to receive money' },
      { label: 'Debit Card', value: 'Your Own Funds', note: 'Cannot spend beyond account balance (unless overdraft enabled)' },
      { label: 'Credit Card', value: 'Short-Term Loan', note: 'Always pay Total Amount Due before due date to avoid ~36%+ APR' }
    ],
    importantPoints: [
      'Entering a UPI PIN is ONLY needed to send money—never to receive money.',
      'Paying only the "Minimum Amount Due" on a credit card triggers heavy compounding interest.',
      'Enable transaction SMS alerts and set sensible daily UPI/card limits in your banking app.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'When someone sends you money via UPI, do you need to enter your UPI PIN?',
        options: ['Yes, always', 'Only for amounts over ₹5,000', 'No, PIN is only required to send money', 'Only on weekends'],
        correctIndex: 2,
        explanation: 'You NEVER enter your UPI PIN to receive money. Requests asking for your PIN to receive funds are fraud.'
      }
    ]
  },

  // B. SAVING AND BUDGETING
  {
    id: 'learn-household-budget',
    categoryId: 'saving_budgeting',
    categoryName: 'Saving and Budgeting',
    title: 'How to Prepare a Household Budget & Needs vs Wants',
    level: 'Beginner',
    readTimeMinutes: 5,
    simpleExplanation: 'A household budget is a monthly plan deciding where every rupee of income goes before it is spent. Separating Needs (rent, staple groceries, school fees, utilities, essential medicine) from Wants (food delivery, streaming, impulse shopping) keeps your family financially stable.',
    realLifeExample: 'With ₹30,000 monthly family income, allocating ₹15,000 (50%) to essential Needs, ₹9,000 (30%) to Wants/lifestyle, and ₹6,000 (20%) to Savings first ensures ₹72,000 saved in one year.',
    visualDiagramSummary: [
      { label: 'Needs (50%)', value: 'Rent · Food · Bills', note: 'Non-negotiable survival and obligation costs' },
      { label: 'Wants (30%)', value: 'Dining · Gadgets', note: 'Discretionary upgrades you can pause during tight months' },
      { label: 'Savings First (20%)', value: 'Goals · Emergency', note: 'Transfer savings on salary day rather than saving leftovers' }
    ],
    importantPoints: [
      'Follow "Income − Savings = Expenses" instead of "Income − Expenses = Savings".',
      'Track small daily ₹50–₹200 UPI spends; they often add up to ₹3,000+ monthly.',
      'Review and adjust category limits at the end of every month.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which golden formula builds reliable monthly savings?',
        options: ['Income − Expenses = Savings', 'Income − Savings = Expenses', 'Borrowing − Expenses = Savings', 'Spending everything first'],
        correctIndex: 1,
        explanation: 'Setting aside savings immediately when income arrives ensures goals are funded before discretionary spending.'
      }
    ]
  },
  {
    id: 'learn-emergency-fund',
    categoryId: 'saving_budgeting',
    categoryName: 'Saving and Budgeting',
    title: 'Emergency Funds & Financial Discipline',
    level: 'Beginner',
    readTimeMinutes: 4,
    simpleExplanation: 'An emergency fund is 3 to 6 months of essential monthly household expenses kept in an easily accessible place (savings account, sweep-in FD, or liquid mutual fund). It prevents you from taking high-interest personal loans during medical emergencies or job loss.',
    realLifeExample: 'If a household’s essential expenses (rent, groceries, bills, school fees) total ₹18,000/month, an ideal emergency fund target is ₹54,000 (3 months) to ₹1,08,000 (6 months).',
    visualDiagramSummary: [
      { label: 'Starter Target', value: '1 Month Expenses', note: 'Immediate buffer against minor repairs or medical bills' },
      { label: 'Core Target', value: '3–6 Months Expenses', note: 'Protects family during job transitions or major crises' },
      { label: 'Where to Keep', value: 'High liquidity', note: 'Never lock emergency funds in stocks or 5-year illiquid assets' }
    ],
    importantPoints: [
      'Build your emergency fund before starting risky market investments.',
      'Use it strictly for genuine emergencies—not vacations or festival shopping.',
      'Replenish the fund promptly whenever you withdraw from it.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'If essential monthly household costs are ₹20,000, what is a 6-month emergency fund target?',
        options: ['₹40,000', '₹60,000', '₹1,20,000', '₹2,40,000'],
        correctIndex: 2,
        explanation: '6 × ₹20,000 = ₹1,20,000 covers half a year of essential living costs.'
      }
    ]
  },

  // C. INVESTMENT EDUCATION
  {
    id: 'learn-compounding-risk',
    categoryId: 'investment_education',
    categoryName: 'Investment Education',
    title: 'Power of Compounding & Risk vs Return',
    level: 'Beginner',
    readTimeMinutes: 5,
    simpleExplanation: 'Compounding means earning returns not just on your original money, but also on the returns earned in earlier years. Risk and return move together: safer instruments like FDs and PPF offer modest, predictable returns, while equity shares and equity mutual funds fluctuate in the short term but aim for higher long-term growth.',
    realLifeExample: 'Investing ₹5,000/month at an illustrative 12% p.a. grows to ~₹11.6 lakh in 10 years (₹6L invested), but grows to ~₹49.9 lakh in 20 years (₹12L invested) because compounding accelerates in later years. (Note: Market returns are not guaranteed.)',
    visualDiagramSummary: [
      { label: 'Low Risk · Fixed', value: 'PPF · FD · RD', note: 'Capital stability; returns may barely beat inflation after tax' },
      { label: 'Moderate Risk', value: 'Hybrid / Debt Funds', note: 'Mix of bonds and equities for 3–5 year goals' },
      { label: 'Higher Volatility', value: 'Equity / Index Funds', note: 'Suited for 5+ year horizons; short-term dips are normal' }
    ],
    importantPoints: [
      'Starting 5 years earlier often beats investing twice as much later.',
      'Never invest money needed within 1–2 years into volatile stock markets.',
      'Always verify whether an investment product is regulated by SEBI, RBI, or PFRDA.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which statement accurately describes risk and return?',
        options: ['High returns always come with zero risk', 'Higher potential long-term returns usually involve higher short-term price fluctuations', 'FD returns fluctuate daily with stock markets', 'Compounding only works for 1 year'],
        correctIndex: 1,
        explanation: 'Risk and potential return are linked; assets with higher long-term growth potential experience short-term volatility.'
      }
    ]
  },
  {
    id: 'learn-shares-mf-sip',
    categoryId: 'investment_education',
    categoryName: 'Investment Education',
    title: 'Shares, Stock Market, Mutual Funds & SIP Explained',
    level: 'Intermediate',
    readTimeMinutes: 6,
    simpleExplanation: 'A Share represents fractional ownership in a company traded on exchanges like NSE or BSE. A Mutual Fund pools money from many investors and invests across dozens of stocks or bonds managed by SEBI-registered professionals. A SIP (Systematic Investment Plan) lets you invest a fixed amount (even ₹500/month) automatically into a mutual fund.',
    realLifeExample: 'Instead of trying to guess one winning company stock, Meera invests ₹2,500/month via SIP into a Nifty 50 Index Mutual Fund. She buys more units when markets dip and fewer when prices rise (rupee cost averaging).',
    visualDiagramSummary: [
      { label: 'Direct Shares', value: 'Single Company', note: 'Requires deep research; high company-specific risk' },
      { label: 'Mutual Fund', value: 'Diversified Basket', note: 'Spreads money across 30–50+ companies or bonds' },
      { label: 'SIP', value: 'Automated Monthly', note: 'Builds investing habit and reduces market-timing stress' }
    ],
    importantPoints: [
      'Mutual fund investments are subject to market risks; past performance does not guarantee future returns.',
      'Check Expense Ratio (Direct plans have lower ongoing fees than Regular plans).',
      'Rupee cost averaging through SIP helps smooth out market ups and downs over long horizons.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the primary benefit of a Mutual Fund over buying a single company share?',
        options: ['Guaranteed fixed interest', 'Automatic diversification across many securities', 'Zero market risk', 'Instant government subsidy'],
        correctIndex: 1,
        explanation: 'Mutual funds spread your investment across multiple companies or bonds, reducing single-company risk.'
      }
    ]
  },
  {
    id: 'learn-ppf-nps',
    categoryId: 'investment_education',
    categoryName: 'Investment Education',
    title: 'Long-Term Retirement Tools: PPF & NPS',
    level: 'Intermediate',
    readTimeMinutes: 5,
    simpleExplanation: 'PPF (Public Provident Fund) is a 15-year sovereign-backed fixed-return savings scheme with tax-free returns. NPS (National Pension System) is a PFRDA-regulated retirement investment linking equity, corporate debt, and government bonds to build a retirement pension corpus until age 60.',
    realLifeExample: 'Vikram allocates ₹3,000/month to PPF for safe tax-free debt growth and ₹4,000/month to NPS Tier-I for long-term retirement wealth with additional tax deduction benefits.',
    visualDiagramSummary: [
      { label: 'PPF', value: '15-Year Tenure', note: 'Sovereign guarantee, EEE tax benefit, fixed quarterly-notified rate' },
      { label: 'NPS Tier-I', value: 'Age 60 Retirement', note: 'Market-linked allocation across Equity (E), Corporate (C), Govt Bonds (G)' },
      { label: 'NPS Exit Rule', value: '60% Lump Sum + 40% Annuity', note: 'At least 40% purchases a monthly pension annuity at age 60' }
    ],
    importantPoints: [
      'PPF is 100% debt/fixed-income; NPS allows choosing up to 75% equity allocation.',
      'NPS Tier-I has exit restrictions until age 60 (with limited partial withdrawal rules).',
      'Check Old vs New Tax Regime rules before investing solely for tax deductions.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which regulator oversees the National Pension System (NPS) in India?',
        options: ['TRAI', 'PFRDA', 'IRDAI', 'FSSAI'],
        correctIndex: 1,
        explanation: 'The Pension Fund Regulatory and Development Authority (PFRDA) regulates NPS and Atal Pension Yojana.'
      }
    ]
  },

  // D. LOANS AND CREDIT
  {
    id: 'learn-loans-emi',
    categoryId: 'loans_credit',
    categoryName: 'Loans and Credit',
    title: 'Loans, Interest Rates & How EMI Works',
    level: 'Beginner',
    readTimeMinutes: 5,
    simpleExplanation: 'A loan is borrowed money repaid over time with interest (the cost of borrowing). EMI (Equated Monthly Installment) combines both principal repayment and interest into one fixed monthly payment. In early years, a larger portion of your EMI goes toward interest; in later years, more goes toward principal.',
    realLifeExample: 'On a ₹5,00,000 car loan at 9% p.a. for 5 years, your EMI is ₹10,379/month. Total paid over 60 months is ₹6,22,750—meaning ₹1,22,750 goes purely toward interest.',
    visualDiagramSummary: [
      { label: 'Secured Loans', value: 'Home / Gold / Car', note: 'Backed by collateral; lower interest rates (7.5%–11%)' },
      { label: 'Unsecured Loans', value: 'Personal / Credit Card', note: 'No collateral; much higher rates (11%–40%)' },
      { label: 'Prepayment Power', value: 'Reduces Principal', note: 'Even 1 extra EMI/year can cut years off a home loan' }
    ],
    importantPoints: [
      'Always compare Reducing Balance interest rates rather than Flat interest rates.',
      'Keep total household EMIs under 35%–40% of monthly net income.',
      'Check processing fees, prepayment charges, and foreclosure terms before signing.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Why are Personal Loans usually more expensive than Home Loans?',
        options: ['Home loans have no interest', 'Personal loans are unsecured without collateral', 'Personal loans last 40 years', 'Banks prefer personal loans'],
        correctIndex: 1,
        explanation: 'Without physical collateral like a house, lenders face higher default risk on personal loans and charge higher interest.'
      }
    ]
  },
  {
    id: 'learn-credit-score',
    categoryId: 'loans_credit',
    categoryName: 'Loans and Credit',
    title: 'Credit Score (CIBIL) & Responsible Loan Repayment',
    level: 'Intermediate',
    readTimeMinutes: 5,
    simpleExplanation: 'Your credit score (300–900, tracked by bureaus like TransUnion CIBIL, Experian, Equifax, CRIF High Mark) reflects how reliably you repay loans and credit cards. A score of 750+ improves loan approval odds and helps negotiate lower interest rates.',
    realLifeExample: 'Two borrowers apply for a ₹20 lakh home loan. Borrower A (score 790) gets 8.50% p.a.; Borrower B (score 630) gets 9.50% p.a. or rejection. Over 20 years, 1% extra interest costs over ₹2.8 lakh more.',
    visualDiagramSummary: [
      { label: 'Payment History (~35%)', value: 'On-Time EMIs', note: 'Even one 30-day late payment lowers your score significantly' },
      { label: 'Credit Utilization (~30%)', value: 'Keep < 30% Limit', note: 'Using ₹90k of a ₹1L card limit signals credit stress' },
      { label: 'Hard Inquiries', value: 'Apply Selectively', note: 'Applying to 6 lenders at once hurts your credit profile' }
    ],
    importantPoints: [
      'You are entitled to one free full credit report per year from each RBI-licensed bureau.',
      'Never co-sign or guarantee a friend’s loan unless you are prepared to repay it yourself.',
      'Close unused credit cards carefully—older accounts help credit age history.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What credit card utilization ratio is generally considered healthy for your credit score?',
        options: ['95% of your limit', 'Under 30% of your limit', '100% every month', 'Utilization does not matter'],
        correctIndex: 1,
        explanation: 'Keeping credit card balances below 30% of your total limit signals disciplined credit management.'
      }
    ]
  },

  // E. TAX EDUCATION
  {
    id: 'learn-income-tax-gst-tds',
    categoryId: 'tax_education',
    categoryName: 'Tax Education',
    title: 'Income Tax, GST, TDS & Old vs New Tax Regime',
    level: 'Intermediate',
    readTimeMinutes: 6,
    simpleExplanation: 'Income Tax is a direct tax paid on annual earnings above exemption thresholds. GST (Goods and Services Tax) is an indirect consumption tax included in goods/services you buy (0%, 5%, 12%, 18%, 28%). TDS (Tax Deducted at Source) is tax deducted upfront by employers or banks before paying salary or FD interest. India offers two Income Tax Regimes: New (default, lower slab rates, fewer exemptions) and Old (retains 80C, 80D, HRA deductions).',
    realLifeExample: 'If a bank pays ₹55,000 FD interest in a year (above TDS threshold), it deducts 10% TDS (₹5,500) with PAN. If your total annual income is below the taxable rebate limit, you claim that ₹5,500 back by filing an Income Tax Return (ITR).',
    visualDiagramSummary: [
      { label: 'Direct Tax', value: 'Income Tax · TDS', note: 'Based on your annual income slabs and PAN' },
      { label: 'Indirect Tax', value: 'GST (CGST + SGST)', note: 'Paid at point of purchase on goods & services' },
      { label: 'Regime Choice', value: 'New vs Old', note: 'Compare both each year using total eligible deductions' }
    ],
    importantPoints: [
      'Filing ITR on time lets you claim TDS refunds and creates official income proof for loans and visas.',
      'Always verify your Form 26AS and AIS (Annual Information Statement) on incometax.gov.in before filing.',
      'Tax rules and rebate thresholds change via annual Finance Acts—always confirm current FY slabs.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'How can you get a refund if excess TDS was deducted from your salary or FD interest?',
        options: ['Visit an ATM', 'File your Income Tax Return (ITR)', 'Call your telecom provider', 'TDS can never be refunded'],
        correctIndex: 1,
        explanation: 'Filing your annual Income Tax Return (ITR) reconciles tax owed vs TDS deducted and triggers refunds for excess tax.'
      }
    ]
  },

  // F. FINANCIAL SAFETY
  {
    id: 'learn-cyber-upi-safety',
    categoryId: 'financial_safety',
    categoryName: 'Financial Safety',
    title: 'UPI Fraud Awareness, Phishing & Safe Digital Banking',
    level: 'Beginner',
    readTimeMinutes: 5,
    simpleExplanation: 'Digital financial fraud often relies on urgency, greed, or fear—not technical hacking. Common scams include fake "receive money" QR codes, screen-sharing APK downloads ("AnyDesk/TeamViewer support"), phishing KYC update SMS links, and "Digital Arrest" impersonation calls claiming to be police or customs officers.',
    realLifeExample: 'A fraudster calls pretending to buy your old sofa on a classifieds site and sends a QR code saying "Scan and enter your UPI PIN to receive ₹8,000." Scanning and entering a PIN actually DEBITS ₹8,000 from your account.',
    visualDiagramSummary: [
      { label: 'Golden UPI Rule', value: 'PIN = Debit Only', note: 'Never scan a QR code or enter PIN to receive money' },
      { label: '1930 Cyber Helpline', value: 'Call Immediately', note: 'Report cyber financial fraud at cybercrime.gov.in or dial 1930 within the golden hour' },
      { label: 'Account Hygiene', value: '2FA + Unique Passwords', note: 'Never share OTP, CVV, Aadhaar OTP, or screen-sharing access' }
    ],
    importantPoints: [
      'No bank, RBI official, or police officer ever asks for your OTP, UPI PIN, or remote screen-sharing app.',
      'If scammed online, call National Cyber Crime Helpline 1930 immediately and file at cybercrime.gov.in to freeze fraudster accounts.',
      'Always check the exact URL domain (e.g. .gov.in, official bank domain) before logging in.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the official national helpline number in India to report online financial fraud immediately?',
        options: ['1000', '1930', '1400', '9999'],
        correctIndex: 1,
        explanation: 'Dial 1930 (National Cyber Crime Helpline) and report on cybercrime.gov.in immediately so banks can attempt to freeze funds.'
      },
      {
        id: 'q2',
        question: 'A caller claiming to be from your bank asks you to install a screen-sharing app to stop KYC suspension. What should you do?',
        options: ['Install it quickly', 'Share your OTP', 'Hang up immediately and contact your bank via its official app/number', 'Send ₹1 to verify'],
        correctIndex: 2,
        explanation: 'Banks never ask customers to install remote screen-sharing apps or share OTPs.'
      }
    ]
  },
  {
    id: 'learn-scams-passwords',
    categoryId: 'financial_safety',
    categoryName: 'Financial Safety',
    title: 'Ponzi Scams, Fake Loan Apps & Password Security',
    level: 'Advanced',
    readTimeMinutes: 5,
    simpleExplanation: 'Unregulated Ponzi schemes and fake instant-loan apps promise unrealistic guaranteed returns (e.g., "double your money in 30 days") or instant cash without paperwork, then harvest phone contacts for extortion or disappear. Strong password hygiene—unique passphrases, password managers, and hardware/app-based 2FA—protects financial portals.',
    realLifeExample: 'An unknown Telegram group promises 5% weekly guaranteed crypto/stock profit. Legitimate SEBI-regulated investments never guarantee fixed high equity returns; any "guaranteed 5% weekly" offer is a classic red flag.',
    visualDiagramSummary: [
      { label: 'Red Flag #1', value: 'Guaranteed High Returns', note: 'Returns far above FD/G-Sec rates with "zero risk" signal fraud' },
      { label: 'Red Flag #2', value: 'Unlisted Loan Apps', note: 'Only borrow from RBI-registered banks/NBFCs; deny Contacts permission' },
      { label: 'Password Rule', value: 'Unique 12+ Chars', note: 'Never reuse banking passwords across social or shopping websites' }
    ],
    importantPoints: [
      'Check RBI’s Sachet portal (sachet.rbi.org.in) to verify deposit-taking entities or report unauthorized schemes.',
      'Check app permissions: a genuine loan or utility app never needs access to your photo gallery or contact list.',
      'Enable biometric lock and SIM PIN to guard against SIM-swap attacks.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which of the following is the clearest warning sign of a financial scam?',
        options: ['Returns linked to market performance with risk disclosures', 'Guaranteed 40% monthly profit with zero risk', 'SEBI registration number displayed and verifiable', 'Requirement to complete KYC'],
        correctIndex: 1,
        explanation: 'Guaranteed ultra-high returns with "zero risk" are the hallmark of Ponzi and investment scams.'
      }
    ]
  }
];
