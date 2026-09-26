// ================= SAFETY CHECK =================
//
// MindCare AI
//
// Rule-based first-pass safety detection.
//
// IMPORTANT:
// This is NOT a medical diagnosis or clinical risk assessment system.
// It is only a first-pass safety signal for the AI companion.
// It cannot guarantee detection of every crisis situation.
//
// For high-risk situations, the application should encourage
// immediate human/crisis/emergency support rather than relying
// on this detector alone.


// ================= HIGH-RISK PATTERNS =================

const highRiskPatterns = [

  // ---------- English ----------

  /\bkill myself\b/i,
  /\bkilling myself\b/i,
  /\bkill me\b/i,

  /\bend my life\b/i,
  /\bend it all\b/i,

  /\bsuicide\b/i,
  /\bsuicidal\b/i,

  /\bself[- ]?harm\b/i,
  /\bhurt myself\b/i,
  /\bharming myself\b/i,

  /\btake my own life\b/i,
  /\btook my own life\b/i,

  /\bwant to die\b/i,
  /\bi want to die\b/i,
  /\bi wanna die\b/i,

  /\bgoing to kill myself\b/i,
  /\bgoing to hurt myself\b/i,

  /\bplanning to (die|kill myself|hurt myself)\b/i,
  /\bplan to (die|kill myself|hurt myself)\b/i,

  /\bi have a plan to\b/i,

  // ---------- Hinglish / Hindi transliteration ----------

  /\bkhud ko maar\b/i,
  /\bkhudko maar\b/i,
  /\bkhud ko mar\b/i,
  /\bkhudko mar\b/i,

  /\bkhudkushi\b/i,
  /\bkhud khushi\b/i,

  /\bjaan dena\b/i,
  /\bjaan de du\b/i,
  /\bjaan de doon\b/i,

  /\bmarna chahta\b/i,
  /\bmarna chahti\b/i,

  /\bmar jaana chahta\b/i,
  /\bmar jaana chahti\b/i,

  /\bmarna hai\b/i,
  /\bmar jaana hai\b/i,

  /\bjeena nahi chahta\b/i,
  /\bjeena nahi chahti\b/i,

  /\bjeene ka mann nahi\b/i,
  /\bjeene ka man nahi\b/i,
];


// ================= MEDIUM-RISK PATTERNS =================

const mediumRiskPatterns = [

  // ---------- English ----------

  /\bfeel hopeless\b/i,
  /\bfeeling hopeless\b/i,
  /\bso hopeless\b/i,

  /\bno reason to live\b/i,
  /\bnothing to live for\b/i,

  /\bi feel worthless\b/i,
  /\bi am worthless\b/i,

  /\bi feel helpless\b/i,
  /\bi am helpless\b/i,

  /\bi can't cope\b/i,
  /\bi cannot cope\b/i,

  /\bcan't handle this\b/i,
  /\bcannot handle this\b/i,

  /\bwant everything to stop\b/i,

  /\bi wish i could disappear\b/i,

  /\bi don't know how to continue\b/i,

  /\bi can't go on\b/i,
  /\bi cannot go on\b/i,

  /\bi feel broken\b/i,
  /\bi feel empty\b/i,

  // ---------- Hinglish / Hindi transliteration ----------

  /\bbahut hopeless\b/i,
  /\bbohot hopeless\b/i,

  /\bmujhe koi umeed nahi\b/i,
  /\bmujhe koi ummeed nahi\b/i,

  /\bjeene ki wajah nahi\b/i,

  /\bmain bekaar hoon\b/i,
  /\bmain bekar hoon\b/i,

  /\bmain helpless hoon\b/i,

  /\bmujhse nahi ho raha\b/i,
  /\bmujhse nahi ho rha\b/i,

  /\bmain handle nahi kar pa raha\b/i,
  /\bmain handle nahi kar rahi\b/i,
  /\bmain handle nahi kar pa rahi\b/i,

  /\bsab kuch khatam karna\b/i,
  /\bsab kuch khatam ho jaye\b/i,

  /\bmain bahut thak gaya hoon\b/i,
  /\bmain bahut thak gayi hoon\b/i,

  /\bmain toot gaya hoon\b/i,
  /\bmain toot gayi hoon\b/i,
];


// ================= PROTECTIVE / NEGATION PATTERNS =================

const protectivePatterns = [

  // ---------- English ----------

  /\bi don't want to die\b/i,
  /\bi do not want to die\b/i,

  /\bi don't want to hurt myself\b/i,
  /\bi do not want to hurt myself\b/i,

  /\bi don't want to kill myself\b/i,
  /\bi do not want to kill myself\b/i,

  /\bi don't want suicide\b/i,

  /\bi am not suicidal\b/i,
  /\bi'm not suicidal\b/i,

  /\bi am not going to hurt myself\b/i,
  /\bi am not going to kill myself\b/i,

  // ---------- Hinglish / Hindi transliteration ----------

  /\bmain marna nahi chahta\b/i,
  /\bmain marna nahi chahti\b/i,

  /\bmain khud ko hurt nahi karna\b/i,
  /\bmain khud ko hurt nahi karna chahta\b/i,
  /\bmain khud ko hurt nahi karna chahti\b/i,

  /\bmain khud ko nahi maarna chahta\b/i,
  /\bmain khud ko nahi maarna chahti\b/i,

  /\bmain suicide nahi karna chahta\b/i,
  /\bmain suicide nahi karna chahti\b/i,
];


// ================= NORMALIZATION =================

const normalizeMessage = (message) => {

  return message
    .toLowerCase()

    // Normalize curly quotes
    .replace(/[“”‘’]/g, "'")

    // Normalize common separators
    .replace(/[-_/]+/g, " ")

    // Normalize repeated whitespace
    .replace(/\s+/g, " ")

    .trim();
};


// ================= PATTERN HELPER =================

const matchesAny = (patterns, message) => {
  return patterns.some((pattern) => pattern.test(message));
};


// ================= SAFETY CHECK =================

const checkSafety = (message) => {

  // Invalid input
  if (!message || typeof message !== "string") {

    return {
      level: "low",
      isHighRisk: false,
      isMediumRisk: false,
    };
  }


  const normalizedMessage = normalizeMessage(message);


  // Empty after normalization
  if (!normalizedMessage) {

    return {
      level: "low",
      isHighRisk: false,
      isMediumRisk: false,
    };
  }


  // ================= CONTEXT CHECKS =================

  const hasProtectiveContext =
    matchesAny(
      protectivePatterns,
      normalizedMessage
    );


  const hasHighRisk =
    matchesAny(
      highRiskPatterns,
      normalizedMessage
    );


  const hasMediumRisk =
    matchesAny(
      mediumRiskPatterns,
      normalizedMessage
    );


  // ================= DECISION LOGIC =================

  // Protective statements without an explicit
  // high-risk statement should not automatically
  // become high-risk.

  if (hasProtectiveContext && !hasHighRisk) {

    return {
      level: hasMediumRisk ? "medium" : "low",
      isHighRisk: false,
      isMediumRisk: hasMediumRisk,
    };
  }


  // Explicit high-risk signal gets priority.

  if (hasHighRisk) {

    return {
      level: "high",
      isHighRisk: true,
      isMediumRisk: false,
    };
  }


  // Medium-risk signal.

  if (hasMediumRisk) {

    return {
      level: "medium",
      isHighRisk: false,
      isMediumRisk: true,
    };
  }


  // Normal / low-risk message.

  return {
    level: "low",
    isHighRisk: false,
    isMediumRisk: false,
  };
};


module.exports = checkSafety;