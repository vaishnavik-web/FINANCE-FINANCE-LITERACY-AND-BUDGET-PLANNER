import type { LanguageCode } from '../types/finance';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' }
];

export type TranslationKey =
  | 'appName'
  | 'tagline'
  | 'nav.dashboard'
  | 'nav.income'
  | 'nav.expenses'
  | 'nav.budget'
  | 'nav.goals'
  | 'nav.calculators'
  | 'nav.schemes'
  | 'nav.learning'
  | 'nav.assistant'
  | 'nav.reports'
  | 'nav.notifications'
  | 'nav.settings'
  | 'nav.admin'
  | 'auth.signIn'
  | 'auth.register'
  | 'auth.tryDemo'
  | 'auth.logout'
  | 'auth.forgotPassword'
  | 'dash.totalIncome'
  | 'dash.totalExpenses'
  | 'dash.totalSavings'
  | 'dash.availableBalance'
  | 'dash.financialGoals'
  | 'dash.financialOverview'
  | 'dash.recentTransactions'
  | 'dash.savingsRate'
  | 'common.searchPlaceholder'
  | 'common.add'
  | 'common.edit'
  | 'common.delete'
  | 'common.save'
  | 'common.cancel'
  | 'common.reset'
  | 'common.calculate'
  | 'common.filter'
  | 'common.all'
  | 'common.offlineBanner'
  | 'common.demoBanner'
  | 'common.syncNow'
  | 'common.unsynced'
  | 'common.synced'
  | 'calc.title'
  | 'calc.subtitle'
  | 'calc.formula'
  | 'calc.example'
  | 'calc.history'
  | 'schemes.title'
  | 'schemes.subtitle'
  | 'schemes.officialSite'
  | 'schemes.lastVerified'
  | 'learn.title'
  | 'learn.subtitle'
  | 'learn.takeQuiz'
  | 'ai.title'
  | 'ai.subtitle'
  | 'ai.askPlaceholder'
  | 'reports.title'
  | 'reports.exportPdf'
  | 'reports.exportExcel'
  | 'reports.exportCsv'
  | 'budget.title'
  | 'budget.monthlyTarget'
  | 'budget.remaining'
  | 'budget.utilized'
  | 'goals.title'
  | 'goals.newGoal'
  | 'settings.title'
  | 'settings.language'
  | 'settings.theme'
  | 'settings.currency'
  | 'landing.heroTitle'
  | 'landing.heroDesc'
  | 'landing.getStarted'
  | 'landing.exploreDemo';

const en: Record<TranslationKey, string> = {
  appName: 'Smart Financial Literacy & Budget Planner',
  tagline: 'Understand Money. Manage Better. Build Your Future.',
  'nav.dashboard': 'Dashboard',
  'nav.income': 'Income',
  'nav.expenses': 'Expenses',
  'nav.budget': 'Budget Planner',
  'nav.goals': 'Savings Goals',
  'nav.calculators': 'Financial Calculators',
  'nav.schemes': 'Government Schemes',
  'nav.learning': 'Financial Learning',
  'nav.assistant': 'AI Assistant',
  'nav.reports': 'Reports',
  'nav.notifications': 'Notifications',
  'nav.settings': 'Profile & Settings',
  'nav.admin': 'Admin Panel',
  'auth.signIn': 'Sign In',
  'auth.register': 'Create Account',
  'auth.tryDemo': 'Explore Demo Mode',
  'auth.logout': 'Logout',
  'auth.forgotPassword': 'Forgot Password?',
  'dash.totalIncome': 'Total Income',
  'dash.totalExpenses': 'Total Expenses',
  'dash.totalSavings': 'Total Savings',
  'dash.availableBalance': 'Available Balance',
  'dash.financialGoals': 'Financial Goals',
  'dash.financialOverview': 'Financial Overview',
  'dash.recentTransactions': 'Recent Transactions',
  'dash.savingsRate': 'Savings Rate',
  'common.searchPlaceholder': 'Search schemes, calculators, lessons, transactions...',
  'common.add': 'Add',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.reset': 'Reset',
  'common.calculate': 'Calculate',
  'common.filter': 'Filter',
  'common.all': 'All',
  'common.offlineBanner': 'Offline Mode — Calculators, cached guides, and local pending transactions remain available.',
  'common.demoBanner': 'Demo Mode (Local Sample Data) — Changes stay in your browser. Register to sync securely.',
  'common.syncNow': 'Sync Now',
  'common.unsynced': 'Unsynced (Offline)',
  'common.synced': 'Synced',
  'calc.title': 'Financial Calculator Centre',
  'calc.subtitle': '60 verified financial, loan, savings, investment, tax, and household calculators with clear formulas.',
  'calc.formula': 'Formula Used',
  'calc.example': 'Worked Example',
  'calc.history': 'Calculation History',
  'schemes.title': 'Government Schemes — India',
  'schemes.subtitle': 'Searchable Central and State welfare, savings, scholarship, and pension schemes with verified official portals.',
  'schemes.officialSite': 'Official Application Portal',
  'schemes.lastVerified': 'Last Verified',
  'learn.title': 'Financial Literacy & Learning Centre',
  'learn.subtitle': 'Structured lessons, real-life rupee examples, and quizzes from beginner to advanced levels.',
  'learn.takeQuiz': 'Check Understanding Quiz',
  'ai.title': 'AI Financial Assistant',
  'ai.subtitle': 'Ask plain-language questions about budgeting, calculators, Indian schemes, or your authorized household summary.',
  'ai.askPlaceholder': 'Ask about your monthly budget, SIP, EMI, GST, or schemes...',
  'reports.title': 'Monthly & Yearly Financial Reports',
  'reports.exportPdf': 'Export PDF',
  'reports.exportExcel': 'Export Excel',
  'reports.exportCsv': 'Export CSV',
  'budget.title': 'Household Budget Planner',
  'budget.monthlyTarget': 'Monthly Budget Limit',
  'budget.remaining': 'Remaining Budget',
  'budget.utilized': 'Budget Utilized',
  'goals.title': 'Savings & Financial Goals',
  'goals.newGoal': 'Create Savings Goal',
  'settings.title': 'Profile & Financial Settings',
  'settings.language': 'Preferred Language',
  'settings.theme': 'Appearance Theme',
  'settings.currency': 'Preferred Currency',
  'landing.heroTitle': 'Practical household money management, calculators, and verified public schemes in one clear workspace.',
  'landing.heroDesc': 'Track family income and daily expenses, plan monthly category budgets, compute 60+ financial formulas, explore Central & State welfare schemes, and build lasting financial literacy.',
  'landing.getStarted': 'Create Free Account',
  'landing.exploreDemo': 'Try Guest Demo'
};

const hi: Partial<Record<TranslationKey, string>> = {
  appName: 'स्मार्ट वित्तीय साक्षरता और बजट प्लानर',
  tagline: 'पैसे को समझें। बेहतर प्रबंधन करें। अपना भविष्य बनाएं।',
  'nav.dashboard': 'डैशबोर्ड',
  'nav.income': 'आय',
  'nav.expenses': 'खर्च',
  'nav.budget': 'बजट प्लानर',
  'nav.goals': 'बचत लक्ष्य',
  'nav.calculators': 'वित्तीय कैलकुलेटर',
  'nav.schemes': 'सरकारी योजनाएं',
  'nav.learning': 'वित्तीय शिक्षा',
  'nav.assistant': 'AI सहायक',
  'nav.reports': 'रिपोर्ट्स',
  'nav.notifications': 'सूचनाएं',
  'nav.settings': 'प्रोफ़ाइल और सेटिंग्स',
  'nav.admin': 'एडमिन पैनल',
  'auth.signIn': 'लॉग इन करें',
  'auth.register': 'खाता बनाएं',
  'auth.tryDemo': 'डेमो मोड देखें',
  'auth.logout': 'लॉग आउट',
  'auth.forgotPassword': 'पासवर्ड भूल गए?',
  'dash.totalIncome': 'कुल आय',
  'dash.totalExpenses': 'कुल खर्च',
  'dash.totalSavings': 'कुल बचत',
  'dash.availableBalance': 'उपलब्ध शेष',
  'dash.financialGoals': 'वित्तीय लक्ष्य',
  'dash.financialOverview': 'वित्तीय अवलोकन',
  'dash.recentTransactions': 'हाल के लेन-देन',
  'dash.savingsRate': 'बचत दर',
  'common.searchPlaceholder': 'योजनाएं, कैलकुलेटर, पाठ, लेन-देन खोजें...',
  'common.add': 'जोड़ें',
  'common.edit': 'संपादित करें',
  'common.delete': 'हटाएं',
  'common.save': 'सहेजें',
  'common.cancel': 'रद्द करें',
  'common.reset': 'रीसेट',
  'common.calculate': 'गणना करें',
  'common.filter': 'फ़िल्टर',
  'common.all': 'सभी',
  'common.offlineBanner': 'ऑफ़लाइन मोड — कैलकुलेटर, सहेजे गए पाठ और स्थानीय लेन-देन उपलब्ध हैं।',
  'common.demoBanner': 'डेमो मोड (नमूना डेटा) — बदलाव केवल आपके ब्राउज़र में सहेजे जाते हैं।',
  'common.syncNow': 'सिंक करें',
  'common.unsynced': 'असिंक्रनाइज़्ड (ऑफ़लाइन)',
  'common.synced': 'सिंक हो गया',
  'calc.title': 'वित्तीय कैलकुलेटर केंद्र',
  'calc.subtitle': 'स्पष्ट फ़ॉर्मूलों के साथ 60 वित्तीय, ऋण, बचत, निवेश, कर और घरेलू कैलकुलेटर।',
  'calc.formula': 'प्रयुक्त सूत्र',
  'calc.example': 'उदाहरण गणना',
  'calc.history': 'गणना इतिहास',
  'schemes.title': 'सरकारी योजनाएं — भारत',
  'schemes.subtitle': 'सत्यापित आधिकारिक पोर्टल्स के साथ केंद्र और राज्य सरकार की योजनाएं।',
  'schemes.officialSite': 'आधिकारिक वेबसाइट',
  'schemes.lastVerified': 'अंतिम सत्यापन',
  'learn.title': 'वित्तीय साक्षरता और शिक्षा केंद्र',
  'learn.subtitle': 'शुरुआती से उन्नत स्तर तक सरल पाठ, उदाहरण और क्विज़।',
  'learn.takeQuiz': 'क्विज़ हल करें',
  'ai.title': 'AI वित्तीय सहायक',
  'ai.subtitle': 'बजट, कैलकुलेटर, सरकारी योजनाओं या अपने खर्चों के बारे में सरल भाषा में पूछें।',
  'ai.askPlaceholder': 'मासिक बजट, SIP, EMI, GST या योजनाओं के बारे में पूछें...',
  'reports.title': 'मासिक और वार्षिक वित्तीय रिपोर्ट्स',
  'reports.exportPdf': 'PDF डाउनलोड',
  'reports.exportExcel': 'Excel डाउनलोड',
  'reports.exportCsv': 'CSV डाउनलोड',
  'budget.title': 'घरेलू बजट प्लानर',
  'budget.monthlyTarget': 'मासिक बजट सीमा',
  'budget.remaining': 'शेष बजट',
  'budget.utilized': 'उपयोग किया गया बजट',
  'goals.title': 'बचत और वित्तीय लक्ष्य',
  'goals.newGoal': 'नया बचत लक्ष्य बनाएं',
  'settings.title': 'प्रोफ़ाइल और वित्तीय सेटिंग्स',
  'settings.language': 'पसंदीदा भाषा',
  'settings.theme': 'थीम चुनें',
  'settings.currency': 'मुद्रा',
  'landing.heroTitle': 'परिवार के बजट, 60+ वित्तीय कैलकुलेटर और सत्यापित सरकारी योजनाओं के लिए एक सरल मंच।',
  'landing.heroDesc': 'आय और दैनिक खर्च ट्रैक करें, मासिक श्रेणी बजट बनाएं, सटीक गणना करें और वित्तीय रूप से सशक्त बनें।',
  'landing.getStarted': 'मुफ़्त खाता बनाएं',
  'landing.exploreDemo': 'डेमो आज़माएं'
};

const kn: Partial<Record<TranslationKey, string>> = {
  appName: 'ಸ್ಮಾರ್ಟ್ ಹಣಕಾಸು ಸಾಕ್ಷರತೆ ಮತ್ತು ಬಜೆಟ್ ಪ್ಲಾನರ್',
  tagline: 'ಹಣವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಉತ್ತಮವಾಗಿ ನಿರ್ವಹಿಸಿ. ಭವಿಷ್ಯ ನಿರ್ಮಿಸಿ.',
  'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
  'nav.income': 'ಆದಾಯ',
  'nav.expenses': 'ವೆಚ್ಚಗಳು',
  'nav.budget': 'ಬಜೆಟ್ ಪ್ಲಾನರ್',
  'nav.goals': 'ಉಳಿತಾಯ ಗುರಿಗಳು',
  'nav.calculators': 'ಹಣಕಾಸು ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು',
  'nav.schemes': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
  'nav.learning': 'ಹಣಕಾಸು ಶಿಕ್ಷಣ',
  'nav.assistant': 'AI ಸಹಾಯಕ',
  'nav.reports': 'ವರದಿಗಳು',
  'nav.notifications': 'ಸೂಚನೆಗಳು',
  'nav.settings': 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  'nav.admin': 'ನಿರ್ವಹಣಾ ಫಲಕ',
  'auth.signIn': 'ಸೈನ್ ಇನ್',
  'auth.register': 'ಖಾತೆ ರಚಿಸಿ',
  'auth.tryDemo': 'ಡೆಮೊ ಮೋಡ್ ನೋಡಿ',
  'auth.logout': 'ಲಾಗ್ ಔಟ್',
  'auth.forgotPassword': 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರುವಿರಾ?',
  'dash.totalIncome': 'ಒಟ್ಟು ಆದಾಯ',
  'dash.totalExpenses': 'ಒಟ್ಟು ವೆಚ್ಚ',
  'dash.totalSavings': 'ಒಟ್ಟು ಉಳಿತಾಯ',
  'dash.availableBalance': 'ಲಭ್ಯವಿರುವ ಬ್ಯಾಲೆನ್ಸ್',
  'dash.financialGoals': 'ಹಣಕಾಸು ಗುರಿಗಳು',
  'dash.financialOverview': 'ಹಣಕಾಸು ಅವಲೋಕನ',
  'dash.recentTransactions': 'ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು',
  'dash.savingsRate': 'ಉಳಿತಾಯ ದರ',
  'common.searchPlaceholder': 'ಯೋಜನೆಗಳು, ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು, ಪಾಠಗಳು ಹುಡುಕಿ...',
  'common.add': 'ಸೇರಿಸಿ',
  'common.edit': 'ತಿದ್ದುಪಡಿ',
  'common.delete': 'ಅಳಿಸಿ',
  'common.save': 'ಉಳಿಸಿ',
  'common.cancel': 'ರದ್ದುಮಾಡಿ',
  'common.reset': 'ಮರುಹೊಂದಿಸಿ',
  'common.calculate': 'ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ',
  'common.filter': 'ಫಿಲ್ಟರ್',
  'common.all': 'ಎಲ್ಲಾ',
  'common.offlineBanner': 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ — ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಡೇಟಾ ಲಭ್ಯವಿದೆ.',
  'common.demoBanner': 'ಡೆಮೊ ಮೋಡ್ — ಬದಲಾವಣೆಗಳು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತವೆ.',
  'common.syncNow': 'ಸಿಂಕ್ ಮಾಡಿ',
  'common.unsynced': 'ಸಿಂಕ್ ಆಗಿಲ್ಲ (ಆಫ್‌ಲೈನ್)',
  'common.synced': 'ಸಿಂಕ್ ಆಗಿದೆ',
  'calc.title': 'ಹಣಕಾಸು ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಕೇಂದ್ರ',
  'calc.subtitle': 'ಸ್ಪಷ್ಟ ಸೂತ್ರಗಳೊಂದಿಗೆ 60 ಹಣಕಾಸು, ಸಾಲ, ಉಳಿತಾಯ, ತೆರಿಗೆ ಮತ್ತು ಗೃಹ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು.',
  'schemes.title': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು — ಭಾರತ ಮತ್ತು ಕರ್ನಾಟಕ',
  'learn.title': 'ಹಣಕಾಸು ಸಾಕ್ಷರತೆ ಮತ್ತು ಕಲಿಕಾ ಕೇಂದ್ರ',
  'ai.title': 'AI ಹಣಕಾಸು ಸಹಾಯಕ',
  'reports.title': 'ಮಾಸಿಕ ಮತ್ತು ವಾರ್ಷಿಕ ಹಣಕಾಸು ವರದಿಗಳು',
  'budget.title': 'ಮನೆ ಬಜೆಟ್ ಪ್ಲಾನರ್',
  'goals.title': 'ಉಳಿತಾಯ ಗುರಿಗಳು',
  'settings.title': 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  'landing.heroTitle': 'ಕುಟುಂಬದ ಬಜೆಟ್, ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ಒಂದೇ ಸುಲಭ ವೇದಿಕೆ.',
  'landing.getStarted': 'ಉಚಿತ ಖಾತೆ ತೆರೆಯಿರಿ',
  'landing.exploreDemo': 'ಡೆಮೊ ಪ್ರಯತ್ನಿಸಿ'
};

const mr: Partial<Record<TranslationKey, string>> = {
  appName: 'स्मार्ट आर्थिक साक्षरता आणि बजेट प्लॅनर',
  tagline: 'पैसा समजून घ्या. उत्तम व्यवस्थापन करा. भविष्य घडवा.',
  'nav.dashboard': 'डॅशबोर्ड',
  'nav.income': 'उत्पन्न',
  'nav.expenses': 'खर्च',
  'nav.budget': 'बजेट प्लॅनर',
  'nav.goals': 'बचत उद्दिष्टे',
  'nav.calculators': 'आर्थिक कॅल्क्युलेटर',
  'nav.schemes': 'सरकारी योजना',
  'nav.learning': 'आर्थिक शिक्षण',
  'nav.assistant': 'AI सहाय्यक',
  'nav.reports': 'अहवाल',
  'nav.notifications': 'सूचना',
  'nav.settings': 'प्रोफाइल आणि सेटिंग्ज',
  'nav.admin': 'प्रशासन पॅनेल',
  'auth.signIn': 'साइन इन',
  'auth.register': 'नोंदणी करा',
  'auth.tryDemo': 'डेमो मोड पहा',
  'auth.logout': 'लॉग आऊट',
  'dash.totalIncome': 'एकूण उत्पन्न',
  'dash.totalExpenses': 'एकूण खर्च',
  'dash.totalSavings': 'एकूण बचत',
  'dash.availableBalance': 'उपलब्ध शिल्लक',
  'common.add': 'जोडा',
  'common.save': 'जतन करा',
  'common.cancel': 'रद्द करा',
  'common.calculate': 'मोजा',
  'calc.title': 'आर्थिक कॅल्क्युलेटर केंद्र',
  'schemes.title': 'सरकारी योजना — भारत',
  'learn.title': 'आर्थिक साक्षरता केंद्र',
  'ai.title': 'AI आर्थिक सहाय्यक',
  'reports.title': 'मासिक आणि वार्षिक अहवाल',
  'budget.title': 'कौटुंबिक बजेट प्लॅनर',
  'goals.title': 'बचत उद्दिष्टे',
  'settings.title': 'प्रोफाइल आणि सेटिंग्ज',
  'landing.getStarted': 'मोफत खाते तयार करा',
  'landing.exploreDemo': 'डेमो वापरून पहा'
};

const te: Partial<Record<TranslationKey, string>> = {
  appName: 'స్మార్ట్ ఆర్థిక అక్షరాస్యత & బడ్జెట్ ప్లానర్',
  tagline: 'డబ్బును అర్థం చేసుకోండి. మెరుగ్గా నిర్వహించండి. భవిష్యత్తును నిర్మించుకోండి.',
  'nav.dashboard': 'డ్యాష్‌బోర్డ్',
  'nav.income': 'ఆదాయం',
  'nav.expenses': 'ఖర్చులు',
  'nav.budget': 'బడ్జెట్ ప్లానర్',
  'nav.goals': 'పొదుపు లక్ష్యాలు',
  'nav.calculators': 'ఆర్థిక కాలిక్యులేటర్లు',
  'nav.schemes': 'ప్రభుత్వ పథకాలు',
  'nav.learning': 'ఆర్థిక విద్య',
  'nav.assistant': 'AI సహాయకుడు',
  'nav.reports': 'నివేదికలు',
  'nav.notifications': 'నోటిఫికేషన్లు',
  'nav.settings': 'ప్రొఫైల్ & సెట్టింగ్స్',
  'nav.admin': 'అడ్మిన్ ప్యానెల్',
  'auth.signIn': 'సైన్ ఇన్',
  'auth.register': 'ఖాతా తెరవండి',
  'auth.tryDemo': 'డెమో మోడ్ చూడండి',
  'auth.logout': 'లాగ్ అవుట్',
  'dash.totalIncome': 'మొత్తం ఆదాయం',
  'dash.totalExpenses': 'మొత్తం ఖర్చులు',
  'dash.totalSavings': 'మొత్తం పొదుపు',
  'dash.availableBalance': 'అందుబాటులో ఉన్న బ్యాలెన్స్',
  'common.add': 'జోడించు',
  'common.save': 'సేవ్ చేయి',
  'common.calculate': 'లెక్కించు',
  'calc.title': 'ఆర్థిక కాలిక్యులేటర్ కేంద్రం',
  'schemes.title': 'ప్రభుత్వ పథకాలు — భారతదేశం',
  'learn.title': 'ఆర్థిక అక్షరాస్యత కేంద్రం',
  'ai.title': 'AI ఆర్థిక సహాయకుడు',
  'reports.title': 'ఆర్థిక నివేదికలు',
  'budget.title': 'కుటుంబ బడ్జెట్ ప్లానర్',
  'goals.title': 'పొదుపు లక్ష్యాలు',
  'settings.title': 'ప్రొఫైల్ & సెట్టింగ్స్'
};

const ta: Partial<Record<TranslationKey, string>> = {
  appName: 'ஸ்மார்ட் நிதி எழுத்தறிவு & பட்ஜெட் திட்டமிடுபவர்',
  tagline: 'பணத்தை புரிந்து கொள்ளுங்கள். சிறப்பாக நிர்வகியுங்கள்.',
  'nav.dashboard': 'டாஷ்போர்டு',
  'nav.income': 'வருமானம்',
  'nav.expenses': 'செலவுகள்',
  'nav.budget': 'பட்ஜெட் திட்டம்',
  'nav.goals': 'சேமிப்பு இலக்குகள்',
  'nav.calculators': 'நிதி கால்குலேட்டர்கள்',
  'nav.schemes': 'அரசு திட்டங்கள்',
  'nav.learning': 'நிதி கல்வி',
  'nav.assistant': 'AI உதவியாளர்',
  'nav.reports': 'அறிக்கைகள்',
  'nav.notifications': 'அறிவிப்புகள்',
  'nav.settings': 'சுயவிவரம் & அமைப்புகள்',
  'nav.admin': 'நிர்வாக குழு',
  'auth.signIn': 'உள்நுழைக',
  'auth.register': 'கணக்கு தொடங்குக',
  'auth.tryDemo': 'டெமோ பார்க்கவும்',
  'auth.logout': 'வெளியேறு',
  'dash.totalIncome': 'மொத்த வருமானம்',
  'dash.totalExpenses': 'மொத்த செலவுகள்',
  'dash.totalSavings': 'மொத்த சேமிப்பு',
  'dash.availableBalance': 'இருப்பு தொகை',
  'common.add': 'சேர்க்கவும்',
  'common.save': 'சேமிக்கவும்',
  'common.calculate': 'கணக்கிடு',
  'calc.title': 'நிதி கால்குலேட்டர் மையம்',
  'schemes.title': 'அரசு நலத்திட்டங்கள் — இந்தியா',
  'learn.title': 'நிதி கல்வி மையம்',
  'ai.title': 'AI நிதி உதவியாளர்',
  'reports.title': 'மாதாந்திர & வருடாந்திர அறிக்கைகள்'
};

const bn: Partial<Record<TranslationKey, string>> = {
  appName: 'স্মার্ট আর্থিক সাক্ষরতা ও বাজেট প্ল্যানার',
  tagline: 'অর্থ বুঝুন। আরও ভালো পরিচালনা করুন। ভবিষ্যৎ গড়ুন।',
  'nav.dashboard': 'ড্যাশবোর্ড',
  'nav.income': 'আয়',
  'nav.expenses': 'ব্যয়',
  'nav.budget': 'বাজেট প্ল্যানার',
  'nav.goals': 'সঞ্চয় লক্ষ্য',
  'nav.calculators': 'আর্থিক ক্যালকুলেটর',
  'nav.schemes': 'সরকারি প্রকল্প',
  'nav.learning': 'আর্থিক শিক্ষা',
  'nav.assistant': 'AI সহায়ক',
  'nav.reports': 'রিপোর্ট',
  'nav.notifications': 'বিজ্ঞপ্তি',
  'nav.settings': 'প্রোফাইল ও সেটিংস',
  'nav.admin': 'অ্যাডমিন প্যানেল',
  'auth.signIn': 'সাইন ইন',
  'auth.register': 'অ্যাকাউন্ট তৈরি করুন',
  'auth.tryDemo': 'ডেমো দেখুন',
  'auth.logout': 'লগ আউট',
  'dash.totalIncome': 'মোট আয়',
  'dash.totalExpenses': 'মোট ব্যয়',
  'dash.totalSavings': 'মোট সঞ্চয়',
  'dash.availableBalance': 'উপলব্ধ ব্যালেন্স',
  'common.add': 'যোগ করুন',
  'common.save': 'সংরক্ষণ করুন',
  'common.calculate': 'হিসাব করুন',
  'calc.title': 'আর্থিক ক্যালকুলেটর কেন্দ্র',
  'schemes.title': 'সরকারি প্রকল্প — ভারত',
  'learn.title': 'আর্থিক শিক্ষা কেন্দ্র',
  'ai.title': 'AI আর্থিক সহায়ক',
  'reports.title': 'মাসিক ও বার্ষিক আর্থিক রিপোর্ট'
};

const gu: Partial<Record<TranslationKey, string>> = {
  appName: 'સ્માર્ટ નાણાકીય સાક્ષરતા અને બજેટ પ્લાનર',
  tagline: 'નાણાંને સમજો. વધુ સારી રીતે મેનેજ કરો. તમારું ભવિષ્ય બનાવો.',
  'nav.dashboard': 'ડેશબોર્ડ',
  'nav.income': 'આવક',
  'nav.expenses': 'ખર્ચ',
  'nav.budget': 'બજેટ પ્લાનર',
  'nav.goals': 'બચત લક્ષ્યો',
  'nav.calculators': 'નાણાકીય કેલ્ક્યુલેટર',
  'nav.schemes': 'સરકારી યોજનાઓ',
  'nav.learning': 'નાણાકીય શિક્ષણ',
  'nav.assistant': 'AI સહાયક',
  'nav.reports': 'રિપોર્ટ્સ',
  'nav.notifications': 'સૂચનાઓ',
  'nav.settings': 'પ્રોફાઇલ અને સેટિંગ્સ',
  'nav.admin': 'એડમિન પેનલ',
  'auth.signIn': 'સાઇન ઇન',
  'auth.register': 'ખાતું બનાવો',
  'auth.tryDemo': 'ડેમો મોડ જુઓ',
  'auth.logout': 'લોગ આઉટ',
  'dash.totalIncome': 'કુલ આવક',
  'dash.totalExpenses': 'કુલ ખર્ચ',
  'dash.totalSavings': 'કુલ બચત',
  'dash.availableBalance': 'ઉપલબ્ધ બેલેન્સ',
  'common.add': 'ઉમેરો',
  'common.save': 'સાચવો',
  'common.calculate': 'ગણતરી કરો',
  'calc.title': 'નાણાકીય કેલ્ક્યુલેટર કેન્દ્ર',
  'schemes.title': 'સરકારી યોજનાઓ — ભારત',
  'learn.title': 'નાણાકીય શિક્ષણ કેન્દ્ર',
  'ai.title': 'AI નાણાકીય સહાયક',
  'reports.title': 'માસિક અને વાર્ષિક નાણાકીય રિપોર્ટ્સ'
};

const TRANSLATIONS: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = {
  en,
  hi,
  kn,
  mr,
  te,
  ta,
  bn,
  gu
};

export function translate(lang: LanguageCode, key: TranslationKey): string {
  return TRANSLATIONS[lang]?.[key] || en[key] || key;
}
