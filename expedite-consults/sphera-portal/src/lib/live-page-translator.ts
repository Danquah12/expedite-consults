"use client"

import { LanguageCode, TRANSLATIONS } from "@/lib/translations"

const originalTextMap = new WeakMap<Text, string>()
const originalPlaceholderMap = new WeakMap<Element, string>()
const memoryTranslationCache: Record<string, Record<string, string>> = {}

// Comprehensive instant phrase dictionary across Navbar, Jobs, Network, Alerts, More Menu, Me Menu, and Feed
export const INSTANT_UI_PHRASES: Partial<Record<Exclude<LanguageCode, "en">, Record<string, string>>> = {
  ak: {
    "Home": "Fie",
    "Network": "Nkitahodi",
    "Jobs": "Adwuma",
    "Msgs": "Nkra",
    "Messaging": "Nkratoɔ",
    "Alerts": "Kɔkɔbɔ",
    "Notifications": "Kɔkɔbɔ",
    "Market": "Gua",
    "Marketplace": "Aguadibea",
    "Learn": "Sua",
    "Learning": "Adesua",
    "Media": "Video",
    "Pulse": "Pulse",
    "Ask Noctis": "Bisa Noctis",
    "Me": "Me",
    "More": "Bio",
    "Gate": "Kwan",
    "Tailor Resume": "Siesie Krataa (CV)",
    "Easy Apply": "Fa Kɔ Ntɛm",
    "Apply on Site": "Kɔ Wɔn Dwumadibea",
    "Live Feed": "Mprempren",
    "ConnectLn Job Alert Request": "ConnectLn Adwuma Kɔkɔbɔ Adesrɛ",
    "Get started": "Hyɛ aseɛ",
    "Search": "Hwehwɛ",
    "Refresh": "San Hwehwɛ",
    "Post a Job": "Fa Adwuma To Gua",
    "My workspace": "Me Dwumadibea",
    "Grow with ConnectLn": "Tu Mpɔn Wɔ ConnectLn",
    "Settings & Privacy": "Nhyehyɛeɛ ne Kokoamsɛm",
    "Sign out": "Fi Adi",
    "LOOKING FOR A JOB": "REHWEHWƐ ADWUMA",
    "Looking for a Job": "Rehwehwɛ Adwuma",
  },
  ee: {
    "Home": "Aƒeme",
    "Network": "Kadodo",
    "Jobs": "Dɔwo",
    "Msgs": "Gbedeasi",
    "Messaging": "Gbedeasiwo",
    "Alerts": "Nyadzɔdzɔ",
    "Notifications": "Nyadzɔdzɔwo",
    "Market": "Asi",
    "Marketplace": "Asime",
    "Learn": "Srɔ̃ nu",
    "Learning": "Nusrɔ̃ƒe",
    "Media": "Video",
    "Pulse": "Pulse",
    "Ask Noctis": "Bia Noctis",
    "Me": "Nye",
    "More": "Bubuawo",
    "Gate": "Agbo",
    "Tailor Resume": "Dzra CV Ɖo",
    "Easy Apply": "Dɔbiabia Bɔbɔe",
    "Apply on Site": "Bia Dɔ Le Dɔwɔƒea",
    "Live Feed": " Fifia",
    "ConnectLn Job Alert Request": "ConnectLn Dɔwɔna Nyadzɔdzɔ Biabia",
    "Get started": "Dze egɔme",
    "Search": "Di",
    "Refresh": "Gbugbɔe",
    "Post a Job": "Ɖe Gbeƒã Dɔ",
    "My workspace": "Nye Dɔwɔƒe",
    "Grow with ConnectLn": "Tsi Kple ConnectLn",
    "Settings & Privacy": "Ɖoɖowo Kple Ɣaɣla",
    "Sign out": "Do Go",
    "LOOKING FOR A JOB": "LE DƆ DIM",
    "Looking for a Job": "Le Dɔ Dim",
  },
  gaa: {
    "Home": "Shĩa",
    "Network": "Sharɔ",
    "Jobs": "Nitsumɔ",
    "Msgs": "Shɛɛ",
    "Messaging": "Shɛɛi",
    "Alerts": "Adafitswaa",
    "Market": "Jara",
    "Marketplace": "Jara",
    "Learn": "Kasemɔ",
    "Learning": "Nikasemɔ",
    "Media": "Video",
    "Pulse": "Pulse",
    "Ask Noctis": "Bi Noctis",
    "Me": "Mi",
    "More": "Krokomɛi",
    "Gate": "Agbó",
    "Get started": "Je shishi",
    "Search": "Taomɔ",
    "Sign out": "Je Kpo",
    "LOOKING FOR A JOB": "MITAO NITSUMƆ",
    "Looking for a Job": "Mitao Nitsumɔ",
  },
  ha: {
    "Home": "Gida",
    "Network": "Sadarwa",
    "Jobs": "Ayyuka",
    "Msgs": "Saƙo",
    "Messaging": "Saƙonni",
    "Alerts": "Sanarwa",
    "Market": "Kasuwa",
    "Marketplace": "Kasuwa",
    "Learn": "Koyo",
    "Learning": "Koyo",
    "Media": "Bidiyo",
    "Pulse": "Pulse",
    "Ask Noctis": "Tambayi Noctis",
    "Me": "Ni",
    "More": "Ƙari",
    "Gate": "Ƙofa",
    "Get started": "Fara yanzu",
    "Search": "Bincika",
    "Sign out": "Fita",
    "LOOKING FOR A JOB": "NEMAN AIKI",
    "Looking for a Job": "Neman Aiki",
  },
  yo: {
    "Home": "Ilé",
    "Network": "Ẹgbẹ́",
    "Jobs": "Iṣẹ́",
    "Msgs": "Iṣẹ́",
    "Messaging": "Iṣẹ́ Ránṣẹ́",
    "Alerts": "Ìfitónilétí",
    "Market": "Ọjà",
    "Marketplace": "Ọjà",
    "Learn": "Ẹ̀kọ́",
    "Learning": "Ẹ̀kọ́",
    "Media": "Fídíò",
    "Pulse": "Pulse",
    "Ask Noctis": "Béèrè lọ́wọ́ Noctis",
    "Me": "Èmi",
    "More": "Síwájú",
    "Gate": "Ẹnu-ọ̀nà",
    "Get started": "Bẹ̀rẹ̀",
    "Search": "Wá",
    "Sign out": "Jáde",
    "LOOKING FOR A JOB": "Ń WÁ IṢẸ́",
    "Looking for a Job": "Ń Wá Iṣẹ́",
  },
  ig: {
    "Home": "Ụlọ",
    "Network": "Njikọ",
    "Jobs": "Ọrụ",
    "Msgs": "Ozi",
    "Messaging": "Ozi",
    "Alerts": "Ọkwa",
    "Market": "Ahịa",
    "Marketplace": "Ahịa",
    "Learn": "Mụọ",
    "Learning": "Ọmụmụ",
    "Media": "Vidio",
    "Pulse": "Pulse",
    "Ask Noctis": "Jụọ Noctis",
    "Me": "Mụ",
    "More": "Ndị ọzọ",
    "Gate": "Ọnụ ụzọ",
    "Get started": "Malite",
    "Search": "Chọọ",
    "Sign out": "Pụọ",
    "LOOKING FOR A JOB": "NA-ACHỌ ỌRỤ",
    "Looking for a Job": "Na-achọ Ọrụ",
  },
  es: {
    "Home": "Inicio",
    "Network": "Red",
    "Jobs": "Empleos",
    "Msgs": "Msjs",
    "Messaging": "Mensajería",
    "Alerts": "Alertas",
    "Notifications": "Notificaciones",
    "Market": "Mercado",
    "Marketplace": "Mercado",
    "Learn": "Aprender",
    "Learning": "Aprendizaje",
    "Media": "Medios",
    "Pulse": "Pulso",
    "Ask Noctis": "Preguntar a Noctis",
    "Me": "Yo",
    "More": "Más",
    "Gate": "Acceso",
    "Tailor Resume": "Adaptar CV",
    "CareerTwin™ Prep (25+ Qs)": "Prep. CareerTwin™ (25+ Preg.)",
    "Easy Apply": "Solicitud fácil",
    "Apply on Site": "Postular en el sitio",
    "Applied": "Postulado",
    "Live Feed": "En vivo",
    "Direct Hire": "Contratación directa",
    "Senior Level": "Nivel sénior",
    "Entry Level": "Nivel inicial",
    "Mid-Senior Level": "Nivel intermedio-sénior",
    "Credential & Skill Connection:": "Conexión de credenciales y habilidades:",
    "✓ Top 5% Applicant Fit": "✓ Top 5% de compatibilidad",
    "✓ Early Career & Fellowship Fit": "✓ Ideal para inicio de carrera y becas",
    "✓ Commercial & Operations Fit": "✓ Ideal para operaciones y comercio",
    "Take Masterclass →": "Tomar clase magistral →",
    "Explore Tools in Marketplace →": "Explorar herramientas en el Mercado →",
    "ConnectLn Job Alert Request": "Solicitud de alerta de empleo ConnectLn",
    "Instant Job & Project Match Radar": "Radar instantáneo de empleos y proyectos",
    "ConnectLn Opportunity Radar": "Radar de oportunidades ConnectLn",
    "Get started": "Comenzar",
    "✓ Alert ON": "✓ Alerta ACTIVA",
    "Alert ON": "Alerta ACTIVA",
    "Alert OFF": "Alerta INACTIVA",
    "Instant Alerts": "Alertas instantáneas",
    "Daily Digest": "Resumen diario",
    "Weekly Summary": "Resumen semanal",
    "On": "Sí",
    "Off": "No",
    "Search": "Buscar",
    "Refresh": "Actualizar",
    "Post a Job": "Publicar empleo",
    "Work & Business": "Trabajo y Negocios",
    "My workspace": "Mi espacio de trabajo",
    "Grow with ConnectLn": "Crece con ConnectLn",
    "My work & applications": "Mi trabajo y solicitudes",
    "My services & inquiries": "Mis servicios y consultas",
    "My communities": "Mis comunidades",
    "My learning": "Mi aprendizaje",
    "My business pages": "Mis páginas de negocio",
    "Activity & insights": "Actividad y estadísticas",
    "Billing & settings": "Facturación y ajustes",
    "Find work": "Buscar trabajo",
    "Post a job or project": "Publicar empleo o proyecto",
    "Find a professional": "Buscar un profesional",
    "Offer your services": "Ofrecer tus servicios",
    "Explore communities": "Explorar comunidades",
    "Learn practical skills": "Aprender habilidades prácticas",
    "Create a business page": "Crear página de negocio",
    "Analytics": "Analíticas",
    "Saved posts": "Publicaciones guardadas",
    "Settings & Privacy": "Ajustes y privacidad",
    "Help": "Ayuda",
    "Language": "Idioma",
    "Sign out": "Cerrar sesión",
    "Manage My Network": "Gestionar mi red",
    "My Connections": "Mis conexiones",
    "Followers": "Seguidores",
    "Following": "Siguiendo",
    "Invitations Received": "Invitaciones recibidas",
    "Invitations Sent": "Invitaciones enviadas",
    "Who Viewed My Profile": "Quién vio mi perfil",
    "People You May Know": "Personas que quizá conozcas",
    "View Workspace": "Ver espacio",
    "Message": "Mensaje",
    "Connect": "Conectar",
    "Mark All as Read": "Marcar todo como leído",
    "🔔 Set Up Job Alerts": "🔔 Configurar alertas de empleo",
    "Set Up Alerts for Jobs You Want": "Configura alertas para los empleos que deseas",
    "LOOKING FOR A JOB": "BUSCANDO EMPLEO",
    "Looking for a Job": "Buscando empleo",
  },
  fr: {
    "Home": "Accueil",
    "Network": "Réseau",
    "Jobs": "Emplois",
    "Msgs": "Msgs",
    "Messaging": "Messagerie",
    "Alerts": "Alertes",
    "Notifications": "Notifications",
    "Market": "Marché",
    "Marketplace": "Marché",
    "Learn": "Apprendre",
    "Learning": "Formation",
    "Media": "Médias",
    "Pulse": "Pulse",
    "Ask Noctis": "Demander à Noctis",
    "Me": "Moi",
    "More": "Plus",
    "Gate": "Accès",
    "Tailor Resume": "Adapter le CV",
    "CareerTwin™ Prep (25+ Qs)": "Prép. CareerTwin™ (25+ Qs)",
    "Easy Apply": "Candidature simplifiée",
    "Apply on Site": "Postuler sur le site",
    "Applied": "Postulé",
    "Live Feed": "En direct",
    "Direct Hire": "Embauche directe",
    "Senior Level": "Niveau Senior",
    "Entry Level": "Niveau débutant",
    "Credential & Skill Connection:": "Connexion compétences et certifications :",
    "✓ Top 5% Applicant Fit": "✓ Top 5% de compatibilité",
    "✓ Early Career & Fellowship Fit": "✓ Idéal début de carrière",
    "✓ Commercial & Operations Fit": "✓ Idéal opérations et commerce",
    "Take Masterclass →": "Suivre la Masterclass →",
    "Explore Tools in Marketplace →": "Explorer les outils du Marché →",
    "ConnectLn Job Alert Request": "Demande d'alerte emploi ConnectLn",
    "Instant Job & Project Match Radar": "Radar instantané d'emplois et projets",
    "ConnectLn Opportunity Radar": "Radar d'opportunités ConnectLn",
    "Get started": "Commencer",
    "✓ Alert ON": "✓ Alerte ACTIVE",
    "Alert ON": "Alerte ACTIVE",
    "Alert OFF": "Alerte DÉSACTIVÉE",
    "Search": "Rechercher",
    "Work & Business": "Travail et Entreprise",
    "My workspace": "Mon espace de travail",
    "Grow with ConnectLn": "Grandir avec ConnectLn",
    "Find work": "Trouver du travail",
    "Post a job or project": "Publier un emploi ou projet",
    "Find a professional": "Trouver un professionnel",
    "Offer your services": "Proposer vos services",
    "Explore communities": "Explorer les communautés",
    "Learn practical skills": "Apprendre des compétences pratiques",
    "Create a business page": "Créer une page entreprise",
    "Analytics": "Statistiques",
    "Saved posts": "Publications enregistrées",
    "Settings & Privacy": "Paramètres et confidentialité",
    "Help": "Aide",
    "Language": "Langue",
    "Sign out": "Déconnexion",
    "Manage My Network": "Gérer mon réseau",
    "My Connections": "Mes relations",
    "Who Viewed My Profile": "Qui a consulté mon profil",
    "View Workspace": "Voir l'espace",
    "Message": "Message",
    "Connect": "Se connecter",
    "🔔 Set Up Job Alerts": "🔔 Configurer les alertes emploi",
    "LOOKING FOR A JOB": "À LA RECHERCHE D'UN EMPLOI",
  },
  de: {
    "Home": "Start",
    "Network": "Netzwerk",
    "Jobs": "Jobs",
    "Msgs": "Nachr.",
    "Messaging": "Nachrichten",
    "Alerts": "Meldungen",
    "Notifications": "Mitteilungen",
    "Market": "Markt",
    "Marketplace": "Marktplatz",
    "Learn": "Lernen",
    "Learning": "Lernen",
    "Media": "Medien",
    "Pulse": "Puls",
    "Ask Noctis": "Noctis fragen",
    "Me": "Ich",
    "More": "Mehr",
    "Gate": "Zugang",
    "Tailor Resume": "Lebenslauf anpassen",
    "CareerTwin™ Prep (25+ Qs)": "CareerTwin™ Vorb. (25+ Fr.)",
    "Easy Apply": "Einfach bewerben",
    "Apply on Site": "Auf Website bewerben",
    "Applied": "Beworben",
    "Live Feed": "Live-Feed",
    "Direct Hire": "Direkteinstellung",
    "Senior Level": "Senior-Level",
    "Entry Level": "Einstiegslevel",
    "Credential & Skill Connection:": "Qualifikations- & Kompetenz-Verbindung:",
    "Take Masterclass →": "Masterclass starten →",
    "Explore Tools in Marketplace →": "Tools im Marktplatz entdecken →",
    "ConnectLn Job Alert Request": "ConnectLn Job-Alarm-Anfrage",
    "Get started": "Jetzt starten",
    "Search": "Suchen",
    "Work & Business": "Arbeit & Geschäft",
    "My workspace": "Mein Arbeitsbereich",
    "Grow with ConnectLn": "Mit ConnectLn wachsen",
    "Find work": "Arbeit finden",
    "Post a job or project": "Job oder Projekt veröffentlichen",
    "Find a professional": "Fachkraft finden",
    "Offer your services": "Dienste anbieten",
    "Settings & Privacy": "Einstellungen & Datenschutz",
    "Sign out": "Abmelden",
    "My Connections": "Meine Kontakte",
    "🔔 Set Up Job Alerts": "🔔 Job-Alarme einrichten",
  },
  pt: {
    "Home": "Início",
    "Network": "Rede",
    "Jobs": "Vagas",
    "Msgs": "Msgs",
    "Messaging": "Mensagens",
    "Alerts": "Alertas",
    "Notifications": "Notificações",
    "Market": "Mercado",
    "Marketplace": "Mercado",
    "Learn": "Aprender",
    "Learning": "Aprendizagem",
    "Media": "Mídia",
    "Pulse": "Pulso",
    "Ask Noctis": "Perguntar ao Noctis",
    "Me": "Eu",
    "More": "Mais",
    "Gate": "Acesso",
    "Tailor Resume": "Adaptar Currículo",
    "CareerTwin™ Prep (25+ Qs)": "Prep. CareerTwin™ (25+ Perg.)",
    "Easy Apply": "Candidatura simplificada",
    "Apply on Site": "Candidatar-se no site",
    "Applied": "Candidatado",
    "Live Feed": "Ao vivo",
    "Direct Hire": "Contratação direta",
    "Senior Level": "Nível Sênior",
    "Entry Level": "Nível Inicial",
    "Credential & Skill Connection:": "Conexão de Credenciais e Competências:",
    "Take Masterclass →": "Fazer Masterclass →",
    "Explore Tools in Marketplace →": "Explorar ferramentas no Mercado →",
    "ConnectLn Job Alert Request": "Solicitação de Alerta de Vagas ConnectLn",
    "Get started": "Começar",
    "Search": "Pesquisar",
    "Work & Business": "Trabalho e Negócios",
    "My workspace": "Meu espaço de trabalho",
    "Grow with ConnectLn": "Cresça com o ConnectLn",
    "Find work": "Encontrar trabalho",
    "Post a job or project": "Publicar vaga ou projeto",
    "Settings & Privacy": "Configurações e Privacidade",
    "Sign out": "Sair",
    "My Connections": "Minhas conexões",
    "🔔 Set Up Job Alerts": "🔔 Configurar alertas de vagas",
  },
  zh: {
    "Home": "首页",
    "Network": "人脉",
    "Jobs": "职位",
    "Msgs": "消息",
    "Messaging": "消息",
    "Alerts": "提醒",
    "Notifications": "通知",
    "Market": "市场",
    "Marketplace": "市场",
    "Learn": "学习",
    "Learning": "学习",
    "Media": "媒体",
    "Pulse": "脉搏",
    "Ask Noctis": "询问 Noctis",
    "Me": "我",
    "More": "更多",
    "Gate": "入口",
    "Tailor Resume": "定制简历",
    "CareerTwin™ Prep (25+ Qs)": "CareerTwin™ 面试准备 (25+ 题)",
    "Easy Apply": "轻松申请",
    "Apply on Site": "在网站上申请",
    "Applied": "已申请",
    "Live Feed": "实时职位",
    "Direct Hire": "直接录用",
    "Senior Level": "高级职位",
    "Entry Level": "初级职位",
    "Credential & Skill Connection:": "证书与技能匹配：",
    "Take Masterclass →": "参加大师课 →",
    "Explore Tools in Marketplace →": "在市场中探索工具 →",
    "ConnectLn Job Alert Request": "ConnectLn 职位提醒请求",
    "Get started": "立即开始",
    "Search": "搜索",
    "Work & Business": "工作与商务",
    "My workspace": "我的工作区",
    "Grow with ConnectLn": "与 ConnectLn 共同成长",
    "Find work": "寻找工作",
    "Post a job or project": "发布职位或项目",
    "Settings & Privacy": "设置与隐私",
    "Sign out": "退出登录",
    "My Connections": "我的人脉",
    "🔔 Set Up Job Alerts": "🔔 设置职位提醒",
  },
  ja: {
    "Home": "ホーム",
    "Network": "ネットワーク",
    "Jobs": "求人",
    "Msgs": "メッセージ",
    "Messaging": "メッセージ",
    "Alerts": "通知",
    "Notifications": "通知",
    "Market": "マーケット",
    "Marketplace": "マーケット",
    "Learn": "学習",
    "Learning": "学習",
    "Media": "メディア",
    "Pulse": "パルス",
    "Ask Noctis": "Noctisに質問",
    "Me": "自分",
    "More": "その他",
    "Gate": "ゲート",
    "Tailor Resume": "履歴書を最適化",
    "CareerTwin™ Prep (25+ Qs)": "CareerTwin™ 面接対策 (25問+)",
    "Easy Apply": "簡単応募",
    "Apply on Site": "サイトで応募",
    "Applied": "応募済み",
    "Live Feed": "ライブ求人",
    "Direct Hire": "直接採用",
    "Senior Level": "シニアレベル",
    "Entry Level": "エントリーレベル",
    "Credential & Skill Connection:": "資格とスキルの関連性：",
    "Take Masterclass →": "マスタークラスを受講 →",
    "Explore Tools in Marketplace →": "マーケットでツールを探す →",
    "ConnectLn Job Alert Request": "ConnectLn 求人アラート設定",
    "Get started": "始める",
    "Search": "検索",
    "Work & Business": "仕事とビジネス",
    "My workspace": "マイワークスペース",
    "Grow with ConnectLn": "ConnectLnで成長する",
    "Settings & Privacy": "設定とプライバシー",
    "Sign out": "サインアウト",
    "My Connections": "つながり",
    "🔔 Set Up Job Alerts": "🔔 求人アラートを設定",
  },
  ar: {
    "Home": "الرئيسية",
    "Network": "شبكتي",
    "Jobs": "الوظائف",
    "Msgs": "الرسائل",
    "Messaging": "المراسلة",
    "Alerts": "التنبيهات",
    "Notifications": "الإشعارات",
    "Market": "السوق",
    "Marketplace": "السوق",
    "Learn": "تعلّم",
    "Learning": "التعلّم",
    "Media": "الوسائط",
    "Pulse": "النبض",
    "Ask Noctis": "اسأل Noctis",
    "Me": "أنا",
    "More": "المزيد",
    "Gate": "البوابة",
    "Tailor Resume": "تخصيص السيرة الذاتية",
    "CareerTwin™ Prep (25+ Qs)": "تحضير المقابلة (25+ سؤال)",
    "Easy Apply": "تقديم سهل",
    "Apply on Site": "التقديم على الموقع",
    "Applied": "تم التقديم",
    "Live Feed": "بث مباشر",
    "Direct Hire": "توظيف مباشر",
    "Senior Level": "مستوى خبير",
    "Entry Level": "مستوى مبتدئ",
    "Credential & Skill Connection:": "ترابط الشهادات والمهارات:",
    "Take Masterclass →": "ابدأ الدورة المتقدمة →",
    "Explore Tools in Marketplace →": "استكشف الأدوات في السوق →",
    "ConnectLn Job Alert Request": "طلب تنبيهات الوظائف من ConnectLn",
    "Get started": "ابدأ الآن",
    "Search": "بحث",
    "Work & Business": "العمل والأعمال",
    "My workspace": "مساحة عملي",
    "Grow with ConnectLn": "انمُ مع ConnectLn",
    "Settings & Privacy": "الإعدادات والخصوصية",
    "Sign out": "تسجيل الخروج",
    "My Connections": "جهات اتصالي",
    "🔔 Set Up Job Alerts": "🔔 إعداد تنبيهات الوظائف",
  },
  hi: {
    "Home": "होम",
    "Network": "नेटवर्क",
    "Jobs": "नौकरियां",
    "Msgs": "संदेश",
    "Messaging": "मैसेजिंग",
    "Alerts": "अलर्ट",
    "Notifications": "सूचनाएं",
    "Market": "मार्केट",
    "Marketplace": "मार्केटप्लेस",
    "Learn": "सीखें",
    "Learning": "लर्निंग",
    "Media": "मीडिया",
    "Pulse": "पल्स",
    "Ask Noctis": "Noctis से पूछें",
    "Me": "मैं",
    "More": "अधिक",
    "Gate": "गेट",
    "Tailor Resume": "रिज्यूमे अनुकूलित करें",
    "CareerTwin™ Prep (25+ Qs)": "CareerTwin™ तैयारी (25+ प्रश्न)",
    "Easy Apply": "आसान आवेदन",
    "Apply on Site": "साइट पर आवेदन करें",
    "Applied": "आवेदन किया",
    "Live Feed": "लाइव फ़ीड",
    "Direct Hire": "सीधी भर्ती",
    "Senior Level": "सीनियर स्तर",
    "Entry Level": "प्रारंभिक स्तर",
    "Credential & Skill Connection:": "क्रेडेंशियल और कौशल कनेक्शन:",
    "Take Masterclass →": "मास्टरक्लास लें →",
    "Explore Tools in Marketplace →": "मार्केटप्लेस में टूल्स देखें →",
    "ConnectLn Job Alert Request": "ConnectLn जॉब अलर्ट अनुरोध",
    "Get started": "शुरू करें",
    "Search": "खोजें",
    "Work & Business": "कार्य और व्यवसाय",
    "My workspace": "मेरा कार्यक्षेत्र",
    "Grow with ConnectLn": "ConnectLn के साथ आगे बढ़ें",
    "Settings & Privacy": "सेटिंग्स और गोपनीयता",
    "Sign out": "साइन आउट",
    "My Connections": "मेरे कनेक्शन",
    "🔔 Set Up Job Alerts": "🔔 जॉब अलर्ट सेट करें",
  },
  sw: {
    "Home": "Nyumbani",
    "Network": "Mtandao",
    "Jobs": "Ajira",
    "Msgs": "Ujumbe",
    "Messaging": "Ujumbe",
    "Alerts": "Arifa",
    "Notifications": "Arifa",
    "Market": "Soko",
    "Marketplace": "Soko",
    "Learn": "Jifunze",
    "Learning": "Mafunzo",
    "Media": "Vyombo",
    "Pulse": "Mapigo",
    "Ask Noctis": "Uliza Noctis",
    "Me": "Mimi",
    "More": "Zaidi",
    "Gate": "Lango",
    "Tailor Resume": "Rekebisha Wasifu (CV)",
    "CareerTwin™ Prep (25+ Qs)": "Maandalizi ya CareerTwin™ (Maswali 25+)",
    "Easy Apply": "Omba kwa Urahisi",
    "Apply on Site": "Omba Kwenye Tovuti",
    "Applied": "Umeomba",
    "Live Feed": "Moja kwa Moja",
    "Direct Hire": "Ajira ya Moja kwa Moja",
    "Senior Level": "Ngazi ya Juu",
    "Entry Level": "Ngazi ya Mwanzo",
    "Credential & Skill Connection:": "Uhusiano wa Vyeti na Ujuzi:",
    "Take Masterclass →": "Chukua Darasa Kuu →",
    "Explore Tools in Marketplace →": "Chunguza Zana Sokoni →",
    "ConnectLn Job Alert Request": "Ombi la Arifa za Ajira ConnectLn",
    "Get started": "Anza Sasa",
    "Search": "Tafuta",
    "Work & Business": "Kazi na Biashara",
    "My workspace": "Eneo langu la kazi",
    "Grow with ConnectLn": "Kua na ConnectLn",
    "Settings & Privacy": "Mipangilio na Faragha",
    "Sign out": "Ondoka",
    "My Connections": "jamaa na Mtandao Wangu",
    "🔔 Set Up Job Alerts": "🔔 Weka Arifa za Ajira",
  },
  ru: {
    "Home": "Главная",
    "Network": "Сеть",
    "Jobs": "Вакансии",
    "Msgs": "Сообщ.",
    "Messaging": "Сообщения",
    "Alerts": "Уведомл.",
    "Notifications": "Уведомления",
    "Market": "Маркет",
    "Marketplace": "Маркетплейс",
    "Learn": "Обучение",
    "Learning": "Обучение",
    "Media": "Медиа",
    "Pulse": "Пульс",
    "Ask Noctis": "Спросить Noctis",
    "Me": "Я",
    "More": "Ещё",
    "Gate": "Вход",
    "Tailor Resume": "Адаптировать резюме",
    "CareerTwin™ Prep (25+ Qs)": "Подготовка CareerTwin™ (25+ вопр.)",
    "Easy Apply": "Быстрый отклик",
    "Apply on Site": "Откликнуться на сайте",
    "Applied": "Отклик отправлен",
    "Live Feed": "Прямой эфир",
    "Direct Hire": "Прямой найм",
    "Senior Level": "Сеньор",
    "Entry Level": "Начальный уровень",
    "Credential & Skill Connection:": "Связь сертификатов и навыков:",
    "Take Masterclass →": "Пройти мастер-класс →",
    "Explore Tools in Marketplace →": "Открыть инструменты в Маркете →",
    "ConnectLn Job Alert Request": "Запрос оповещений о вакансиях ConnectLn",
    "Get started": "Начать",
    "Search": "Поиск",
    "Work & Business": "Работа и Бизнес",
    "My workspace": "Моё рабочее пространство",
    "Grow with ConnectLn": "Растите с ConnectLn",
    "Settings & Privacy": "Настройки и конфиденциальность",
    "Sign out": "Выйти",
    "My Connections": "Мои контакты",
    "🔔 Set Up Job Alerts": "🔔 Настроить уведомления о вакансиях",
  },
}

// Build reverse map from English TRANSLATIONS values to keys so any matching string in the DOM gets translated
const englishValueToKeyMap: Record<string, string> = {}
if (TRANSLATIONS?.en) {
  for (const [k, v] of Object.entries(TRANSLATIONS.en)) {
    if (v && typeof v === "string") {
      englishValueToKeyMap[v.trim()] = k
    }
  }
}

function loadPersistentCache(lang: LanguageCode): Record<string, string> {
  if (memoryTranslationCache[lang]) return memoryTranslationCache[lang]
  const initial: Record<string, string> = {}
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`connectln_i18n_cache_${lang}_v1`)
      if (raw) {
        Object.assign(initial, JSON.parse(raw))
      }
    } catch {}
  }
  memoryTranslationCache[lang] = initial
  return initial
}

function savePersistentCache(lang: LanguageCode) {
  if (typeof window === "undefined" || !memoryTranslationCache[lang]) return
  try {
    localStorage.setItem(
      `connectln_i18n_cache_${lang}_v1`,
      JSON.stringify(memoryTranslationCache[lang])
    )
  } catch {}
}

export function lookupInstantTranslation(text: string, lang: LanguageCode): string | null {
  if (lang === "en") return text
  const trimmed = text.trim()
  if (!trimmed) return null

  const phraseDict = INSTANT_UI_PHRASES[lang as Exclude<LanguageCode, "en">]
  if (phraseDict && phraseDict[trimmed]) {
    return text.replace(trimmed, phraseDict[trimmed])
  }

  const key = englishValueToKeyMap[trimmed]
  if (key && TRANSLATIONS[lang]?.[key]) {
    return text.replace(trimmed, TRANSLATIONS[lang][key])
  }

  const cache = loadPersistentCache(lang)
  if (cache[trimmed]) {
    return text.replace(trimmed, cache[trimmed])
  }

  return null
}

let pendingQueue: Map<string, Set<Text>> = new Map()
let flushTimer: ReturnType<typeof setTimeout> | null = null
let activeTargetLang: LanguageCode = "en"

async function flushTranslationQueue(lang: LanguageCode) {
  if (lang === "en" || pendingQueue.size === 0) return
  const entries = Array.from(pendingQueue.entries())
  pendingQueue = new Map()

  const cache = loadPersistentCache(lang)
  const batchSize = 18

  for (let i = 0; i < entries.length; i += batchSize) {
    if (activeTargetLang !== lang) return
    const slice = entries.slice(i, i + batchSize)
    const joined = slice.map(([str]) => str.replace(/\n/g, " ")).join("\n ||| \n")

    try {
      let splitParts: string[] = []
      const apiRes = await fetch("/api/connectin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: slice.map(([str]) => str.replace(/\n/g, " ")),
          targetLang: lang,
        }),
      })
      if (apiRes.ok) {
        const apiData = await apiRes.json()
        if (Array.isArray(apiData?.translations)) {
          splitParts = apiData.translations
        }
      }

      if (!splitParts.length) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
          lang
        )}&dt=t&q=${encodeURIComponent(joined)}`
        const res = await fetch(url)
        if (!res.ok) continue
        const data = await res.json()
        if (!Array.isArray(data) || !Array.isArray(data[0])) continue
        const fullTranslated = data[0].map((part: any) => part?.[0] || "").join("")
        splitParts = fullTranslated.split(/\s*\|\|\|\s*/)
      }

      slice.forEach(([origTrimmed, textNodes], idx) => {
        const translatedPiece = (splitParts[idx] || "").trim()
        if (translatedPiece && translatedPiece !== origTrimmed) {
          cache[origTrimmed] = translatedPiece
          textNodes.forEach((node) => {
            if (activeTargetLang === lang && node.isConnected) {
              const origFull = originalTextMap.get(node) || origTrimmed
              node.nodeValue = origFull.replace(origTrimmed, translatedPiece)
            }
          })
        }
      })
      savePersistentCache(lang)
    } catch {
      // Network or CORS fallback: leave static dictionary translations intact
    }
  }
}

function shouldSkipElement(el: Element | null): boolean {
  if (!el) return true
  const tag = el.tagName
  if (
    tag === "SCRIPT" ||
    tag === "STYLE" ||
    tag === "NOSCRIPT" ||
    tag === "CODE" ||
    tag === "PRE" ||
    tag === "TEXTAREA" ||
    tag === "SVG"
  ) {
    return true
  }
  if (el.closest('[data-no-translate="true"], [translate="no"], .notranslate')) {
    return true
  }
  return false
}

export function applyLivePageTranslation(lang: LanguageCode) {
  if (typeof document === "undefined" || !document.body) return
  activeTargetLang = lang

  // 1. Translate input placeholders
  const inputs = document.body.querySelectorAll("input[placeholder], textarea[placeholder]")
  inputs.forEach((el) => {
    const currentPlaceholder = el.getAttribute("placeholder") || ""
    if (!originalPlaceholderMap.has(el)) {
      originalPlaceholderMap.set(el, currentPlaceholder)
    }
    const orig = originalPlaceholderMap.get(el) || currentPlaceholder
    if (lang === "en") {
      if (currentPlaceholder !== orig) el.setAttribute("placeholder", orig)
      return
    }
    const instant = lookupInstantTranslation(orig, lang)
    if (instant) {
      el.setAttribute("placeholder", instant)
    }
  })

  // 2. Walk all text nodes in document.body
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT
      const val = node.nodeValue?.trim()
      if (!val || val.length < 2) return NodeFilter.FILTER_REJECT
      // Skip pure numbers, symbols, emails, URLs
      if (/^[\d\s$€£¥%+,./:·•\-–—→←✓✕@#&()[\]|]+$/.test(val)) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  let currentNode = walker.nextNode() as Text | null
  while (currentNode) {
    const currentVal = currentNode.nodeValue || ""
    if (!originalTextMap.has(currentNode)) {
      originalTextMap.set(currentNode, currentVal)
    }
    const origVal = originalTextMap.get(currentNode) || currentVal
    const origTrimmed = origVal.trim()

    if (lang === "en") {
      if (currentNode.nodeValue !== origVal) {
        currentNode.nodeValue = origVal
      }
    } else {
      const instant = lookupInstantTranslation(origVal, lang)
      if (instant) {
        if (currentNode.nodeValue !== instant) {
          currentNode.nodeValue = instant
        }
      } else if (origTrimmed.length >= 2 && origTrimmed.length <= 420) {
        if (!pendingQueue.has(origTrimmed)) {
          pendingQueue.set(origTrimmed, new Set())
        }
        pendingQueue.get(origTrimmed)!.add(currentNode)
      }
    }

    currentNode = walker.nextNode() as Text | null
  }

  if (lang !== "en" && pendingQueue.size > 0) {
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = setTimeout(() => {
      flushTranslationQueue(lang)
    }, 80)
  }
}

export async function translateLinesLive(lines: string[], lang: LanguageCode): Promise<string[]> {
  if (!lines.length || lang === "en") return lines
  const cache = loadPersistentCache(lang)

  // Check if all lines are already cached
  const results: string[] = new Array(lines.length)
  const missingIndices: number[] = []
  const missingTexts: string[] = []

  lines.forEach((line, idx) => {
    const trimmed = (line || "").trim()
    if (!trimmed) {
      results[idx] = line
      return
    }
    const instant = lookupInstantTranslation(trimmed, lang)
    if (instant && instant !== trimmed) {
      results[idx] = instant
      return
    }
    if (cache[trimmed]) {
      results[idx] = cache[trimmed]
      return
    }
    missingIndices.push(idx)
    missingTexts.push(trimmed)
  })

  if (missingTexts.length === 0) return results

  try {
    const apiRes = await fetch("/api/connectin/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: missingTexts, targetLang: lang }),
    })
    if (apiRes.ok) {
      const apiData = await apiRes.json()
      if (Array.isArray(apiData?.translations) && apiData.translations.length === missingTexts.length) {
        missingIndices.forEach((origIdx, mIdx) => {
          const t = (apiData.translations[mIdx] || missingTexts[mIdx]).trim()
          results[origIdx] = t
          cache[missingTexts[mIdx]] = t
        })
        savePersistentCache(lang)
        return results
      }
    }
  } catch {
    // Fallback to direct client translation
  }

  const fallbackTranslated = await Promise.all(missingTexts.map((t) => translateTextLive(t, lang)))
  missingIndices.forEach((origIdx, mIdx) => {
    results[origIdx] = fallbackTranslated[mIdx]
  })
  return results
}

export async function translateTextLive(text: string, lang: LanguageCode): Promise<string> {
  const trimmed = (text || "").trim()
  if (!trimmed || lang === "en") return text
  const instant = lookupInstantTranslation(trimmed, lang)
  if (instant && instant !== trimmed) return instant

  try {
    const apiRes = await fetch("/api/connectin/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [trimmed], targetLang: lang }),
    })
    if (apiRes.ok) {
      const apiData = await apiRes.json()
      const first = apiData?.translations?.[0]
      if (first) {
        const cache = getLangCache(lang)
        cache[trimmed] = first.trim()
        savePersistentCache(lang)
        return first.trim()
      }
    }
  } catch {
    // fallback below
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      lang
    )}&dt=t&q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url)
    if (!res.ok) return text
    const data = await res.json()
    const translated = Array.isArray(data?.[0])
      ? data[0].map((seg: any) => seg?.[0] || "").join("")
      : ""
    if (translated) {
      const cache = getLangCache(lang)
      cache[trimmed] = translated.trim()
      savePersistentCache(lang)
      return translated.trim()
    }
  } catch {
    // fallback
  }
  return text
}

