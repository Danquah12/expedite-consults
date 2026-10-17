import { LanguageCode } from "./index";

// Pre-computed translations for seed feed posts across supported languages
const POST_TRANSLATIONS: Record<string, Partial<Record<LanguageCode, string>>> = {
  // Post 1: Kwesi's Zero-Trust announcement
  "Proud to announce our Authorization to Operate (ATO) for the enterprise Zero-Trust telemetry platform across AWS GovCloud.": {
    es: "Orgulloso de anunciar nuestra Autorización para Operar (ATO) para la plataforma corporativa de telemetría Zero-Trust en AWS GovCloud. Desarrollar controles conformes con NIST SP 800-53 Rev. 5 y automatizar la remediación POA&M con Python y Splunk redujo el tiempo de auditoría en un 40%.",
    fr: "Fier d'annoncer notre autorisation d'opérer (ATO) pour la plateforme de télémétrie Zero-Trust d'entreprise sur AWS GovCloud. L'alignement sur les contrôles NIST SP 800-53 Rev. 5 et l'automatisation POA&M ont réduit le cycle d'audit de 40 %.",
    de: "Mit Stolz geben wir unsere Betriebsgenehmigung (ATO) für die unternehmensweite Zero-Trust-Telemetrieplattform in AWS GovCloud bekannt. Die Einhaltung von NIST SP 800-53 Rev. 5 und automatisierte POA&M-Workflows reduzierten die Auditzeit um 40 %.",
    pt: "Com orgulho anunciamos nossa Autorização para Operar (ATO) para a plataforma corporativa de telemetria Zero-Trust na AWS GovCloud. O alinhamento com o NIST SP 800-53 Rev. 5 reduziu o tempo de auditoria em 40%.",
    zh: "荣幸宣布我们已在 AWS GovCloud 上获得企业级零信任遥测平台的运营授权（ATO）。严格落实 NIST SP 800-53 Rev. 5 控制项并通过 Python 和 Splunk 自动化 POA&M 追踪，使审计周期缩短了 40%。",
    ja: "AWS GovCloud におけるエンタープライズ Zero-Trust テレメトリプラットフォームの運用承認（ATO）取得を発表できることを誇りに思います。NIST SP 800-53 Rev. 5 への準拠と自動化により、監査期間が 40% 短縮されました。",
    ar: "فخور بالإعلان عن حصولنا على ترخيص التشغيل (ATO) لمنصة القياس عن بعد لنموذج الثقة الصفرية Zero-Trust عبر AWS GovCloud. إن مواءمة ضوابط NIST SP 800-53 Rev. 5 وأتمتة خطط POA&M قلّصت زمن التدقيق بنسبة 40%.",
    hi: "AWS GovCloud पर एंटरप्राइज ज़ीरो-ट्रस्ट टेलीमेट्री प्लेटफ़ॉर्म के लिए हमारे संचालन प्राधिकरण (ATO) की घोषणा करते हुए गर्व हो रहा है। NIST SP 800-53 Rev. 5 के अनुपालन से ऑडिट समय में 40% की कमी आई।",
    sw: "Ninajivunia kutangaza Idhini yetu ya Kufanya Kazi (ATO) kwa jukwaa la mawasiliano ya simu ya Zero-Trust katika AWS GovCloud. Kufuata viwango vya NIST SP 800-53 Rev. 5 kulipunguza muda wa ukaguzi kwa 40%.",
    ru: "С гордостью сообщаю о получении разрешения на эксплуатацию (ATO) корпоративной платформы телеметрии Zero-Trust в AWS GovCloud. Соответствие NIST SP 800-53 Rev. 5 сократило время аудита на 40%."
  },
  // Post 2: Rhoda's FedRAMP post
  "Just published our Comprehensive FedRAMP High Baseline Gap Analysis checklist for SaaS vendors entering the federal marketplace.": {
    es: "Acabamos de publicar nuestra lista de verificación integral de análisis de brechas de FedRAMP High para proveedores de SaaS en el mercado federal. Incluye mapeo de controles NIST SP 800-53 Rev. 5 y plantillas SSP.",
    fr: "Nous venons de publier notre liste de vérification d'analyse des écarts FedRAMP High pour les fournisseurs SaaS du secteur public. Comprend la cartographie des contrôles NIST SP 800-53 Rev. 5.",
    de: "Soeben veröffentlicht: Unsere umfassende FedRAMP High Gap-Analyse-Checkliste für SaaS-Anbieter auf dem Bundesmarkt. Beinhaltet NIST SP 800-53 Rev. 5 Kontrollzuordnungen und SSP-Vorlagen.",
    pt: "Acabamos de publicar nossa lista de verificação de análise de lacunas FedRAMP High para fornecedores de SaaS no mercado governamental.",
    zh: "刚刚发布了面向进入联邦市场的 SaaS 供应商的《FedRAMP High 基线差距分析综合清单》。涵盖 NIST SP 800-53 Rev. 5 控制项映射及 SSP 模板。",
    ja: "連邦市場に参入するSaaSベンダー向けに「FedRAMP High ベースラインギャップ分析チェックリスト」を公開しました。NIST SP 800-53 Rev. 5 コントロールマッピングを含みます。",
    ar: "نشرنا للتو قائمة التحقق الشاملة لتحليل فجوات خط الأساس العالي FedRAMP High لموردي SaaS في السوق الحكومي.",
    hi: "संघीय बाज़ार में प्रवेश करने वाले SaaS विक्रेताओं के लिए हमारी व्यापक FedRAMP High चेकलिस्ट अभी प्रकाशित की गई है।",
    sw: "Tumechapisha orodha ya kina ya uchanganuzi wa mapengo ya FedRAMP High kwa watoa huduma wa SaaS.",
    ru: "Только что опубликовали чек-лист анализа пробелов для соответствия уровню FedRAMP High для поставщиков SaaS."
  },
  // Post 3: Trade craftsmanship / timber framing
  "Finished the timber frame assembly on the Aspen lodge project today. 8x8 white oak bents with traditional mortise-and-tenon joinery, secured with 1-inch red oak trunnels.": {
    es: "Hoy terminamos el ensamblaje de la estructura de madera en el proyecto del refugio de Aspen. Vigas de roble blanco de 8x8 con ensambles tradicionales de caja y espiga, aseguradas con clavijas de roble rojo de 1 pulgada. Cero tornillos de acero en la estructura principal.",
    fr: "Fin de l'assemblage de l'ossature bois sur le projet d'Aspen aujourd'hui. Poutres en chêne blanc 8x8 avec mortaises et tenons traditionnels, fixées par chevilles en chêne rouge d'un pouce. Zéro boulon en acier.",
    de: "Heute wurde der Holzrahmenbau für das Aspen-Projekt fertiggestellt. 8x8 Weißeichen-Binder mit traditionellen Zapfenverbindungen, gesichert mit 1-Zoll-Holznägeln aus Roteiche. Keine Stahlschrauben im Haupttragwerk.",
    pt: "Finalizamos hoje a montagem da estrutura de madeira no projeto Aspen. Vigas de carvalho branco 8x8 com encaixes tradicionais de espiga e fenda.",
    zh: "今天完成了阿斯彭木屋项目的木结构组装。8x8白橡木构架，采用传统榫卯连接，并以1英寸红橡木木销紧固。主体结构零钢螺栓。",
    ja: "アスペンのロッジプロジェクトで木造軸組の組み立てを完了しました。伝統的なほぞ継ぎ加工を施した8x8インチのホワイトオーク材と1インチの木製ダボを採用。",
    ar: "أكملنا اليوم تجميع الهيكل الخشبي في مشروع أسبن. عوارض من البلوط الأبيض مقاس 8×8 مع تعشيق تقليدي مثبت بأوتاد البلوط الأحمر. خالٍ تمامًا من المسامير الفولاذية.",
    hi: "एस्पेन लॉज प्रोजेक्ट पर लकड़ी के फ्रेम की असेंबली पूरी हो गई है। पारंपरिक जोड़ों के साथ 8x8 सफेद ओक बीम का उपयोग किया गया है।",
    sw: "Tulikamilisha uunganishaji wa fremu ya mbao kwenye mradi wa Aspen leo. Miti ya mwaloni 8x8 yenye viungo vya kitamaduni.",
    ru: "Сегодня завершили сборку деревянного каркаса на проекте шале в Аспене. Балки из белого дуба 8х8 с традиционными соединениями шип-паз без использования стальных болтов."
  }
};

/**
 * Translates post text into the specified language.
 * Falls back to original text if language is English or no translation is available.
 */
export function translatePostText(content: string, targetLang: LanguageCode): { text: string; isTranslated: boolean } {
  if (targetLang === "en" || !content) {
    return { text: content, isTranslated: false };
  }

  // Exact match in dictionary
  for (const [enKey, translations] of Object.entries(POST_TRANSLATIONS)) {
    if (content.includes(enKey.slice(0, 40))) {
      const translated = translations[targetLang];
      if (translated) {
        return { text: translated, isTranslated: true };
      }
    }
  }

  return { text: content, isTranslated: false };
}
