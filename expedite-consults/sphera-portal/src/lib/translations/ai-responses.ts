import { LanguageCode } from "./index";
import { UserProfile } from "@/lib/linkedin-data";

export interface AIChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  suggestedCards?: {
    title: string;
    category: string;
    actionText: string;
    targetTab: string;
    matchPercent?: string;
  }[];
  comparisonTable?: {
    headers: string[];
    rows: { feature: string; val1: string; val2: string; val3: string }[];
  };
}

export function getLocalizedInitialMessage(user: UserProfile, lang: LanguageCode): AIChatMessage {
  const firstName = user.name.split(" ")[0];

  if (lang === "es") {
    return {
      id: "msg_welcome",
      sender: "assistant",
      text: `¡Hola ${firstName}! Soy **ConnectIn AI**, tu copiloto de inteligencia profesional. Puedo responder preguntas sobre ciberseguridad, arquitectura Zero Trust, RMF ATO, optimización de currículum, herramientas, certificaciones y contratos gubernamentales.`,
      suggestedCards: [
        {
          title: "🛡️ Explicar arquitectura DoD Zero Trust",
          category: "Seguridad Federal",
          actionText: "Ver Guía Zero Trust",
          targetTab: "learning",
          matchPercent: "NIST 800-207"
        },
        {
          title: "📄 Optimizar currículum para liderazgo y contratos",
          category: "Estrategia Profesional",
          actionText: "Optimizar Perfil",
          targetTab: "profile",
          matchPercent: "Revisión 100%"
        },
        {
          title: "💼 Explorar empleos verificados >$180K",
          category: "Mercado Laboral",
          actionText: "Ver Empleos",
          targetTab: "jobs",
          matchPercent: "Top Matches"
        }
      ]
    };
  }

  if (lang === "fr") {
    return {
      id: "msg_welcome",
      sender: "assistant",
      text: `Bonjour ${firstName} ! Je suis **ConnectIn AI**, votre copilote d'intelligence professionnelle. Je peux répondre à vos questions sur la cybersécurité Zero Trust, les accréditations RMF ATO, l'optimisation de CV, les outils et les opportunités de carrière.`,
      suggestedCards: [
        {
          title: "🛡️ Architecture DoD Zero Trust",
          category: "Cybersécurité",
          actionText: "Ouvrir le guide",
          targetTab: "learning",
          matchPercent: "NIST 800-207"
        },
        {
          title: "📄 Optimisation de CV pour postes de direction",
          category: "Carrière",
          actionText: "Ouvrir le profil",
          targetTab: "profile",
          matchPercent: "Revue 100%"
        }
      ]
    };
  }

  if (lang === "de") {
    return {
      id: "msg_welcome",
      sender: "assistant",
      text: `Hallo ${firstName}! Ich bin **ConnectIn AI**, Ihr Copilot für berufliche Intelligenz. Ich unterstütze Sie bei Fragen zu Zero Trust-Architektur, RMF ATO-Compliance, Lebenslaufoptimierung, Tools und Führungspositionen.`,
      suggestedCards: [
        {
          title: "🛡️ DoD Zero Trust-Architektur verstehen",
          category: "Sicherheit",
          actionText: "Leitfaden öffnen",
          targetTab: "learning",
          matchPercent: "NIST 800-207"
        },
        {
          title: "📄 Lebenslauf für Führungspositionen optimieren",
          category: "Karrierestrategie",
          actionText: "Profil prüfen",
          targetTab: "profile",
          matchPercent: "100% Match"
        }
      ]
    };
  }

  if (lang === "ar") {
    return {
      id: "msg_welcome",
      sender: "assistant",
      text: `مرحباً ${firstName}! أنا **ConnectIn AI**، مساعدك الذكي للتطوير المهني. يمكنني الإجابة على أسئلتك حول أمن نموذج الثقة الصفرية Zero Trust، وتراخيص RMF ATO، وتحسين السيرة الذاتية، والأدوات، والفرص القيادية.`,
      suggestedCards: [
        {
          title: "🛡️ شرح هندسة نموذج الثقة الصفرية DoD Zero Trust",
          category: "الأمن السيبراني",
          actionText: "فتح الدليل",
          targetTab: "learning",
          matchPercent: "NIST 800-207"
        },
        {
          title: "📄 تحسين السيرة الذاتية للمناصب القيادية",
          category: "استراتيجية المهنة",
          actionText: "فحص الملف الشخصي",
          targetTab: "profile",
          matchPercent: "مطابقة 100%"
        }
      ]
    };
  }

  // Default English welcome
  return {
    id: "msg_welcome",
    sender: "assistant",
    text: `Hello ${firstName}! I am **ConnectIn AI**, your professional intelligence copilot. I can answer questions about DoD Zero Trust, RMF ATO compliance, federal resume optimization, tooling comparisons, certifications, or code.`,
    suggestedCards: [
      {
        title: "🛡️ Explain DoD Zero Trust Architecture",
        category: "Federal Security",
        actionText: "Open Zero Trust Guide",
        targetTab: "learning",
        matchPercent: "NIST 800-207"
      },
      {
        title: "📄 Optimize Resume for Senior Federal Contracts",
        category: "Career Strategy",
        actionText: "Review Profile",
        targetTab: "profile",
        matchPercent: "100% Review"
      },
      {
        title: "💼 Explore Verified High-Compensation Roles >$180K",
        category: "Job Market",
        actionText: "View Jobs",
        targetTab: "jobs",
        matchPercent: "Top Matches"
      }
    ]
  };
}

/**
 * Returns localized answers when users ask questions in non-English languages.
 */
export function getLocalizedAIAnswer(prompt: string, lang: LanguageCode, user: UserProfile): AIChatMessage | null {
  if (lang === "en") return null;

  const lower = prompt.toLowerCase();

  // Zero Trust prompt
  if (lower.includes("zero trust") || lower.includes("dod") || lower.includes("confianza cero") || lower.includes("ثقة صفرية")) {
    if (lang === "es") {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        text: `🛡️ **Arquitectura Zero Trust del DoD (Departamento de Defensa):**

El principio fundamental es: **"Nunca confiar, siempre verificar"** (*Never Trust, Always Verify*).

**Los 7 Pilares de Zero Trust del DoD:**
1. **Usuario / Identidad:** Autenticación continua multifactorial resistente al phishing (FIDO2 / CAC / PIV), evaluación dinámica de riesgos y principio de mínimo privilegio.
2. **Dispositivo:** Validación continua del estado de cumplimiento, aplicación de STIGs en tiempo real y detección EDR antes de permitir el acceso.
3. **Aplicaciones y Cargas de Trabajo:** Microsegmentación de contenedores, políticas RBAC/ABAC y sandboxing determinista.
4. **Datos:** Cifrado integral en reposo y en tránsito (FIPS 140-3), clasificación automática y etiquetado de datos clasificados.
5. **Red y Entorno:** Perímetros definidos por software (SD-WAN), segmentación granular y eliminación de redes perimetrales planas.
6. **Automatización y Orquestación:** Flujos de trabajo SOAR automatizados para remediación inmediata de amenazas y despliegues DevSecOps.
7. **Visibilidad y Análisis:** Telemetría unificada en SIEM (Splunk/QRadar), correlación de eventos en tiempo real y registro forense.

🎯 **Impacto en Autorización RMF ATO:**
La adopción de estos pilares acelera la obtención de ATO continua (cATO) y reduce los hallazgos en POA&M en más del 40%.`,
        suggestedCards: [
          {
            title: "Guía de implementación DoD Zero Trust",
            category: "NIST SP 800-207",
            actionText: "Abrir módulo",
            targetTab: "learning",
            matchPercent: "100% Alineado"
          },
          {
            title: "Ver controles de seguridad en consola",
            category: "Auditoría ATO",
            actionText: "Ir a Seguridad",
            targetTab: "accountsecurity",
            matchPercent: "FIDO2 Activo"
          }
        ]
      };
    }

    if (lang === "fr") {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        text: `🛡️ **Architecture Zero Trust du DoD (Department of Defense) :**

Le principe directeur est : **« Ne jamais faire confiance, toujours vérifier »** (*Never Trust, Always Verify*).

**Les 7 Piliers Essentiels :**
1. **Identité (User) :** Authentification forte continue, cartes CAC/PIV, FIDO2 et moindres privilèges stricts.
2. **Appareils (Device) :** Contrôle continu de la conformité STIG, intégrité du système et surveillance EDR.
3. **Applications :** Micro-segmentation, autorisations granulaires et conteneurs immuables.
4. **Données :** Chiffrement de bout en bout (FIPS 140-3) et marquage automatique des métadonnées.
5. **Réseau :** Segmentation définie par logiciel et isolation réseau étanche.
6. **Automatisation & Orchestration :** Remédiation automatisée via SOAR et audits continus.
7. **Visibilité & Analytique :** Corrélation des logs en temps réel avec Splunk/QRadar.`,
        suggestedCards: [
          {
            title: "Ouvrir le guide Zero Trust",
            category: "NIST SP 800-207",
            actionText: "Consulter",
            targetTab: "learning",
            matchPercent: "Conforme"
          }
        ]
      };
    }

    if (lang === "de") {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        text: `🛡️ **DoD Zero Trust-Architektur (Verteidigungsministerium):**

Grundprinzip: **„Niemals vertrauen, immer verifizieren“** (*Never Trust, Always Verify*).

**Die 7 Kernsäulen:**
1. **Benutzer / Identität:** Kontinuierliche Authentifizierung, Phishing-resistente MFA (FIDO2), Least-Privilege.
2. **Geräte:** Kontinuierliche Compliance-Prüfung, STIG-Konfigurationen und EDR-Endpunktsicherheit.
3. **Anwendungen & Workloads:** Mikrosegmentierung und strikte Richtliniendurchsetzung.
4. **Daten:** Durchgängige Verschlüsselung (FIPS 140-3) und automatische Klassifizierung.
5. **Netzwerk:** Softwaredefinierte Peripherie und isolierte Enklaven.
6. **Automatisierung:** SOAR-gestützte Reaktionsprozesse und CI/CD-Sicherheitsprüfungen.
7. **Sichtbarkeit:** Echtzeit-Telemetrie und SIEM-Überwachung (Splunk / QRadar).`,
        suggestedCards: [
          {
            title: "Zero Trust Architekturleitfaden",
            category: "NIST 800-207",
            actionText: "Öffnen",
            targetTab: "learning",
            matchPercent: "Zertifiziert"
          }
        ]
      };
    }

    if (lang === "ar") {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        text: `🛡️ **هندسة نموذج الثقة الصفرية Zero Trust لوزارة الدفاع (DoD):**

المبدأ الأساسي هو: **"لا تثق أبدًا، وتحقق دائمًا"** (*Never Trust, Always Verify*).

**الركائز السبع الرئيسية لنموذج الثقة الصفرية:**
1. **المستخدم / الهوية:** المصادقة المستمرة، التحقق متعدد العوامل المقاوم للتصيد (FIDO2)، وسياسة الامتيازات الأقل.
2. **الأجهزة:** الفحص المستمر لمستوى الامتثال وتطبيق أدلة التكوين الأمني STIGs في الوقت الفعلي.
3. **التطبيقات وأحمال العمل:** التقسيم الدقيق للشبكات والتحكم في الوصول القائم على السياسات (RBAC/ABAC).
4. **البيانات:** التشفير الكامل أثناء التخزين والنقل (FIPS 140-3) والتصنيف الآلي للبيانات.
5. **الشبكة والبيئة:** الشبكات المعرفة بالبرمجيات (SD-WAN) وعزل البيئات الحساسة.
6. **الأتمتة والتنسيق:** المعالجة الآلية للحوادث الأمنية عبر منصات SOAR.
7. **الرؤية والتحليلات:** جمع القياسات عن بعد وربط السجلات عبر أنظمة SIEM (Splunk / QRadar).`,
        suggestedCards: [
          {
            title: "دليل تنفيذ Zero Trust",
            category: "NIST SP 800-207",
            actionText: "عرض الدليل",
            targetTab: "learning",
            matchPercent: "معتمد"
          }
        ]
      };
    }
  }

  // Resume Optimization prompt
  if (lower.includes("resume") || lower.includes("cv") || lower.includes("currículum") || lower.includes("سيرة")) {
    if (lang === "es") {
      return {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        text: `📄 **Estrategia de Optimización de Currículum para Contratos y Liderazgo:**

1. **Destacar Autorizaciones Clave:** Resalta certificaciones como CISSP, CISM, CEH y autorizaciones de seguridad activas (TS/SCI) en la primera sección.
2. **Métricas de Impacto:** En lugar de solo listar tareas, cuantifica los resultados: *"Reducción del 40% en vulnerabilidades críticas de POA&M en 60 días"*.
3. **Alineación con Marcos Federales:** Haz referencia explícita a NIST SP 800-53 Rev. 5, FedRAMP High, Zero Trust y XACTA / eMASS.
4. **Herramientas Clave:** Menciona ACAS Nessus, Splunk, QRadar, AWS GovCloud, Azure Government y Burp Suite.
5. **Integración ConnectIn:** Conecta tu perfil verificado para que los reclutadores federales puedan validar tus credenciales en tiempo real.`,
        suggestedCards: [
          {
            title: "Subir currículum para actualizar perfil",
            category: "Extractor de CV",
            actionText: "Subir Currículum",
            targetTab: "profile",
            matchPercent: "IA Activa"
          },
          {
            title: "Ver empleos federales recomendados",
            category: "Oportunidades",
            actionText: "Ver Empleos",
            targetTab: "jobs",
            matchPercent: "98% Match"
          }
        ]
      };
    }
  }

  // Generic fallback translation for any other prompt
  const langPrefixes: Record<LanguageCode, string> = {
    es: `He procesado tu consulta sobre "${prompt}". ConnectIn AI ha indexado expertos verificados, cursos técnicos y soluciones recomendadas:`,
    fr: `J'ai traité votre demande concernant « ${prompt} ». ConnectIn AI a répertorié les experts vérifiés, formations et solutions correspondantes :`,
    de: `Ich habe Ihre Anfrage zu „${prompt}“ verarbeitet. ConnectIn AI hat passende verifizierte Experten und Fachkurse indiziert:`,
    pt: `Processei sua solicitação sobre "${prompt}". O ConnectIn AI indexou especialistas verificados, cursos e soluções:`,
    zh: `我已处理您关于“${prompt}”的咨询。ConnectIn AI 已为您索引相关的经过验证的专家、技术课程和企业解决方案：`,
    ja: `「${prompt}」に関するリクエストを処理しました。ConnectIn AI は関連する認証エキスパート、技術コース、ソリューションをインデックス化しました：`,
    ar: `تمت معالجة استفسارك بشأن "${prompt}". قام ConnectIn AI بفهرسة الخبراء المعتمدين والدورات الفنية والحلول ذات الصلة:`,
    hi: `मैंने "${prompt}" के बारे में आपके अनुरोध को संसाधित किया है। ConnectIn AI ने प्रासंगिक सत्यापित विशेषज्ञों और तकनीकी पाठ्यक्रमों को अनुक्रमित किया है:`,
    sw: `Nimeshughulikia ombi lako kuhusu "${prompt}". ConnectIn AI imeorodhesha wataalamu waliothibitishwa na mafunzo husika:`,
    ru: `Я обработал ваш запрос по теме «${prompt}». ConnectIn AI проиндексировал проверенных специалистов, технические курсы и решения:`,
    en: `I processed your request for "${prompt}". ConnectIn AI has indexed relevant verified experts, technical courses, and enterprise solutions.`
  };

  return {
    id: `ai_${Date.now()}`,
    sender: "assistant",
    text: langPrefixes[lang] || langPrefixes.es,
    suggestedCards: [
      {
        title: lang === "es" ? "Explorar catálogo de soluciones" : "Explore Solutions Hub",
        category: lang === "es" ? "Plataforma" : "Business Outcomes",
        actionText: lang === "es" ? "Ver Soluciones" : "View Solutions",
        targetTab: "marketplace",
        matchPercent: "96% Match"
      },
      {
        title: lang === "es" ? "Ver laboratorios prácticos interactivos" : "Explore Interactive Hands-On Labs",
        category: lang === "es" ? "Cursos" : "Technical Masterclasses",
        actionText: lang === "es" ? "Ver Formación" : "View Learning",
        targetTab: "learning",
        matchPercent: "XP Bonus"
      }
    ]
  };
}
