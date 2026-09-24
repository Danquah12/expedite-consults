// ============================================================================
// TruePlace Housing Credit & Readiness Intelligence Engine
// Institutional-grade deterministic scoring, affordability matching,
// credit scenario simulation, and FCRA compliance infrastructure.
// ============================================================================

import { Property } from './mockData';

export interface CreditTradeline {
  id: string;
  creditor: string;
  type: 'revolving' | 'installment' | 'mortgage' | 'auto' | 'student';
  balance: number;
  creditLimit?: number;
  monthlyPayment: number;
  status: 'current' | '30_late' | '60_late' | '90_late' | 'collection';
  openedDate: string;
  verifiedSource: 'Equifax' | 'Experian' | 'TransUnion';
}

export interface RentalLedgerRecord {
  monthYear: string;
  amountDue: number;
  amountPaid: number;
  paidOnTime: boolean;
  daysLate: number;
  propertyAddress: string;
  landlordOrManagement: string;
  verifiedVia: 'Plaid Bank Cash Flow' | 'Esusu Positive Rent' | 'Landlord Verification Portal';
}

export interface HousingProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  identityVerified: boolean;
  identityVerificationDate: string;
  identityProvider: string;
  
  // Employment & Income
  grossAnnualIncome: number;
  grossMonthlyIncome: number;
  netMonthlyIncome: number;
  employmentStatus: 'W2_FullTime' | 'SelfEmployed' | '1099_Contractor' | 'Retired';
  employerName: string;
  jobTitle: string;
  yearsAtCurrentJob: number;
  incomeVerificationStatus: 'Verified_TheWorkNumber' | 'Verified_BankCashFlow' | 'SelfReported';
  
  // Banking & Liquid Assets
  checkingBalance: number;
  savingsBalance: number;
  liquidCashReserves: number;
  downPaymentAvailable: number;
  averageMonthlyDeposits: number;
  overdraftCount12Mo: number;
  bankingDataSource: 'Plaid Connected' | 'Finicity Certified' | 'SelfReported';
  
  // Credit File Snapshot
  traditionalCreditScore: number;
  totalRevolvingBalance: number;
  totalRevolvingLimit: number;
  revolvingUtilizationPct: number;
  monthlyDebtObligations: number;
  tradelines: CreditTradeline[];
  creditInquiriesLast12Mo: number;
  oldestTradelineYears: number;
  collectionsCount: number;
  bankruptcyRecorded: boolean;
  creditBureauSource: 'TransUnion Core' | 'Experian File' | 'Equifax Record';
  
  // Housing Payment History
  rentalLedger: RentalLedgerRecord[];
  currentRentPayment: number;
  evictionRecordsCount: number;
  landlordReferenceStatus: 'Exemplary' | 'Good' | 'Not_Verified';
  
  // Consent & Purpose Management
  consentRecords: {
    purpose: 'PersonalPlanning' | 'PropertyMatching' | 'LandlordScreening';
    grantedDate: string;
    expiresDate: string;
    isActive: boolean;
    ipAddressRecorded: string;
  }[];
}

export interface HousingScores {
  housingCreditScore: number; // 300 - 850
  scoreBand: 'Elite' | 'Prime' | 'Near-Prime' | 'Building';
  rentalReadinessScore: number; // 0 - 100
  homebuyerReadinessScore: number; // 0 - 100
  paymentReliabilityIndex: number; // 0 - 100
  affordabilityIndex: number; // 0 - 100
  
  // Key Ratios
  backEndDTI: number; // percentage
  emergencyReservesMonths: number;
  maxAffordableMonthlyPayment: number;
  maxAffordableHomePrice: number;
  maxAffordableRent: number;
  
  // Factor Deductions & Drivers
  positiveFactors: string[];
  improvementRoadmap: string[];
  scoreFactors: {
    name: string;
    weight: string;
    impact: 'strong_positive' | 'positive' | 'neutral' | 'attention_needed';
    summary: string;
  }[];
}

export interface PropertyAffordabilityAnalysis {
  propertyId: string;
  propertyAddress: string;
  propertyPrice: number;
  estimatedMonthlyHousingCost: {
    principalAndInterest: number;
    propertyTax: number;
    hazardInsurance: number;
    hoaFee: number;
    maintenanceReserve: number;
    pmi: number;
    totalMonthly: number;
  };
  frontEndDTI: number;
  backEndDTI: number;
  paymentShockPct: number;
  cashRequiredAtClosing: number;
  cashReservesPostClosing: number;
  reserveRunwayMonths: number;
  affordabilityStatus: 'Comfortable' | 'Modeled Stretch' | 'Incompatible';
  summaryExplanation: string;
}

export interface DisputeRecord {
  id: string;
  dateFiled: string;
  consumerName: string;
  category: 'Tradeline Balance' | 'Rental Payment History' | 'Identity Match' | 'Income Verification';
  itemDisputed: string;
  reasonExplanation: string;
  investigationStatus: 'Open - Under Investigation' | 'Data Furnisher Contacted' | 'Resolved - File Updated' | 'Verified - Accurate';
  statutoryDaysRemaining: number;
  dataFurnisherName: string;
  auditLogId: string;
}

export interface AdverseActionNotice {
  noticeId: string;
  dateGenerated: string;
  applicantName: string;
  propertyAddress: string;
  decisionMaker: string;
  adverseActionTaken: 'Denial of Tenancy' | 'Higher Security Deposit Required' | 'Co-Signer Required';
  craIdentity: {
    name: string;
    address: string;
    tollFreePhone: string;
    website: string;
  };
  keyPrincipalFactors: string[];
  fcraDisclosureText: string;
}

// ----------------------------------------------------------------------------
// Deterministic Scoring Engine Formulas
// ----------------------------------------------------------------------------

export function calculateHousingScores(profile: HousingProfile): HousingScores {
  // 1. Payment History (Base 300 + max 192.5 pts)
  let paymentPoints = 175;
  const delinquencies = profile.tradelines.filter((t) => t.status !== 'current').length;
  if (delinquencies === 0) paymentPoints = 192.5;
  else if (delinquencies === 1) paymentPoints = 145;
  else if (delinquencies === 2) paymentPoints = 110;
  else paymentPoints = 70;
  if (profile.collectionsCount > 0) paymentPoints -= 35;
  if (profile.bankruptcyRecorded) paymentPoints -= 80;

  // 2. Revolving Debt Utilization (max 110 pts)
  let utilPoints = 110;
  const util = profile.revolvingUtilizationPct;
  if (util <= 9) utilPoints = 110;
  else if (util <= 25) utilPoints = 98;
  else if (util <= 40) utilPoints = 78;
  else if (util <= 60) utilPoints = 55;
  else if (util <= 80) utilPoints = 30;
  else utilPoints = 10;

  // 3. Housing Payment Reliability (max 82.5 pts)
  const totalRentMonths = profile.rentalLedger.length;
  const onTimeRentMonths = profile.rentalLedger.filter((r) => r.paidOnTime).length;
  const rentReliabilityRatio = totalRentMonths > 0 ? onTimeRentMonths / totalRentMonths : 0.95;
  let housingHistoryPoints = Math.round(rentReliabilityRatio * 82.5);
  if (profile.evictionRecordsCount > 0) housingHistoryPoints -= 60;

  // 4. Income Stability & Cash Reserves (max 55 pts)
  let incomePoints = 38;
  if (profile.yearsAtCurrentJob >= 4) incomePoints += 12;
  else if (profile.yearsAtCurrentJob >= 2) incomePoints += 8;
  if (profile.liquidCashReserves > profile.grossMonthlyIncome * 5) incomePoints += 5;

  // 5. Debt-to-Income Burden (max 55 pts)
  const dti = profile.grossMonthlyIncome > 0 ? (profile.monthlyDebtObligations / profile.grossMonthlyIncome) * 100 : 35;
  let dtiPoints = 55;
  if (dti <= 15) dtiPoints = 55;
  else if (dti <= 25) dtiPoints = 48;
  else if (dti <= 36) dtiPoints = 38;
  else if (dti <= 45) dtiPoints = 22;
  else dtiPoints = 10;

  // 6. Credit Age & Depth (max 27.5 pts)
  let agePoints = 20;
  if (profile.oldestTradelineYears >= 12) agePoints = 27.5;
  else if (profile.oldestTradelineYears >= 7) agePoints = 24;
  else if (profile.oldestTradelineYears >= 4) agePoints = 18;
  else agePoints = 10;

  // 7. Recent Inquiries (max 27.5 pts)
  let inquiryPoints = 27.5;
  if (profile.creditInquiriesLast12Mo === 0) inquiryPoints = 27.5;
  else if (profile.creditInquiriesLast12Mo <= 2) inquiryPoints = 24;
  else if (profile.creditInquiriesLast12Mo <= 4) inquiryPoints = 16;
  else inquiryPoints = 8;

  // Raw score sum (300 base + 550 variable = 300 to 850)
  const totalScore = Math.min(850, Math.max(300, Math.round(300 + paymentPoints + utilPoints + housingHistoryPoints + incomePoints + dtiPoints + agePoints + inquiryPoints)));

  // Score Band
  let scoreBand: 'Elite' | 'Prime' | 'Near-Prime' | 'Building' = 'Prime';
  if (totalScore >= 760) scoreBand = 'Elite';
  else if (totalScore >= 700) scoreBand = 'Prime';
  else if (totalScore >= 640) scoreBand = 'Near-Prime';
  else scoreBand = 'Building';

  // Sub-scores (0 - 100)
  const paymentReliabilityIndex = Math.min(100, Math.max(0, Math.round(rentReliabilityRatio * 100)));
  
  const rentalReadinessScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (paymentReliabilityIndex * 0.35) +
        ((100 - Math.min(100, (profile.currentRentPayment / profile.grossMonthlyIncome) * 200)) * 0.3) +
        ((totalScore / 850) * 100 * 0.25) +
        (Math.min(100, (profile.liquidCashReserves / (profile.currentRentPayment || 2500)) * 15) * 0.1)
      )
    )
  );

  const homebuyerReadinessScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((totalScore / 850) * 100 * 0.35) +
        ((100 - Math.min(100, dti * 2)) * 0.25) +
        (Math.min(100, (profile.downPaymentAvailable / 75000) * 100) * 0.25) +
        (Math.min(100, (profile.liquidCashReserves / 30000) * 100) * 0.15)
      )
    )
  );

  const affordabilityIndex = Math.min(100, Math.max(0, Math.round(100 - (dti * 1.4))));

  // Maximum Modeled Capacities
  const maxAffordableMonthlyPayment = Math.round(profile.grossMonthlyIncome * 0.31);
  const maxAffordableHomePrice = Math.round((maxAffordableMonthlyPayment * 145) + profile.downPaymentAvailable);
  const maxAffordableRent = Math.round(profile.grossMonthlyIncome * 0.30);
  const emergencyReservesMonths = profile.currentRentPayment > 0 ? Math.round((profile.liquidCashReserves / profile.currentRentPayment) * 10) / 10 : 6.4;

  // Positive Factors & Improvement Roadmap
  const positiveFactors: string[] = [];
  const improvementRoadmap: string[] = [];

  if (paymentReliabilityIndex >= 90) positiveFactors.push('Impeccable documented on-time housing payment track record');
  if (util <= 15) positiveFactors.push(`Low revolving credit utilization at ${util}% (under recommended 30% ceiling)`);
  if (profile.yearsAtCurrentJob >= 3) positiveFactors.push(`Strong employment stability (${profile.yearsAtCurrentJob} years in current career discipline)`);
  if (emergencyReservesMonths >= 5) positiveFactors.push(`Solid emergency cash runway (${emergencyReservesMonths} months of housing reserves liquid)`);
  if (profile.collectionsCount === 0) positiveFactors.push('Clean public records with zero open collections, charge-offs, or judgments');

  if (util > 25) improvementRoadmap.push(`Pay down revolving balances to lower utilization below 20% (+15 to +28 points)`);
  if (dti > 35) improvementRoadmap.push('Retire high-interest installment debts to reduce back-end DTI below 36%');
  if (profile.creditInquiriesLast12Mo > 1) improvementRoadmap.push('Refrain from submitting new retail or card inquiries for 6 months');
  if (profile.downPaymentAvailable < 60000) improvementRoadmap.push('Ramp high-yield automated savings by $500/mo to strengthen purchase cash reserves');

  const scoreFactors = [
    {
      name: 'Housing Payment History',
      weight: '15%',
      impact: paymentReliabilityIndex >= 90 ? ('strong_positive' as const) : ('positive' as const),
      summary: `${onTimeRentMonths} of ${totalRentMonths} verified rental transfers delivered on or before due date.`
    },
    {
      name: 'Revolving Credit Utilization',
      weight: '20%',
      impact: util <= 20 ? ('strong_positive' as const) : util <= 35 ? ('neutral' as const) : ('attention_needed' as const),
      summary: `Current revolving balance represents ${util}% of aggregate verified credit lines.`
    },
    {
      name: 'Debt-to-Income Ratio (DTI)',
      weight: '10%',
      impact: dti <= 30 ? ('positive' as const) : ('attention_needed' as const),
      summary: `Monthly debt obligations of $${profile.monthlyDebtObligations.toLocaleString()} equal ${Math.round(dti)}% of gross income.`
    },
    {
      name: 'Cash Reserves Runway',
      weight: '10%',
      impact: emergencyReservesMonths >= 4 ? ('strong_positive' as const) : ('attention_needed' as const),
      summary: `$${profile.liquidCashReserves.toLocaleString()} in liquid reserves offers ${emergencyReservesMonths} months of payment insulation.`
    },
    {
      name: 'Bureau Payment Record',
      weight: '35%',
      impact: delinquencies === 0 ? ('strong_positive' as const) : ('attention_needed' as const),
      summary: `Zero 30+ day delinquencies recorded across active open accounts.`
    }
  ];

  return {
    housingCreditScore: totalScore,
    scoreBand,
    rentalReadinessScore,
    homebuyerReadinessScore,
    paymentReliabilityIndex,
    affordabilityIndex,
    backEndDTI: Math.round(dti * 10) / 10,
    emergencyReservesMonths,
    maxAffordableMonthlyPayment,
    maxAffordableHomePrice,
    maxAffordableRent,
    positiveFactors,
    improvementRoadmap,
    scoreFactors
  };
}

// ----------------------------------------------------------------------------
// Property-to-Applicant Affordability Engine
// ----------------------------------------------------------------------------

export function evaluatePropertyAffordability(profile: HousingProfile, property: Property): PropertyAffordabilityAnalysis {
  const price = property.listPrice;
  const closingCosts = Math.round(price * 0.028); // 2.8% estimated title, transfer tax & prepaids
  
  // Prudent underwriting down payment: Put up to 20% down, capped by available down payment and ensuring at least 2 months of post-close reserves
  const maxDownFromReserves = Math.max(price * 0.05, profile.liquidCashReserves - closingCosts - (profile.grossMonthlyIncome * 0.30 * 2));
  const downPayment = Math.min(price * 0.20, Math.min(profile.downPaymentAvailable, maxDownFromReserves));
  const loanAmount = Math.max(0, price - downPayment);
  
  // Benchmark 30-year fixed conforming mortgage rate (approx 6.625%)
  const monthlyRate = 0.06625 / 12;
  const numPayments = 360;
  const principalAndInterest = Math.round((loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1));

  // Regional property tax (MD ~1.05%, VA ~1.05%, DC ~0.85%)
  const taxRate = property.state === 'DC' ? 0.0085 : 0.0105;
  const propertyTax = Math.round((price * taxRate) / 12);
  const hazardInsurance = Math.round((price * 0.0028) / 12);
  const hoaFee = property.propertyType === 'townhouse' ? 185 : property.propertyType === 'condo' ? 420 : 0;
  const maintenanceReserve = Math.round((price * 0.0075) / 12);
  const pmi = downPayment < price * 0.20 ? Math.round((loanAmount * 0.005) / 12) : 0;

  const totalMonthly = principalAndInterest + propertyTax + hazardInsurance + hoaFee + maintenanceReserve + pmi;
  
  const frontEndDTI = Math.round((totalMonthly / profile.grossMonthlyIncome) * 1000) / 10;
  const backEndDTI = Math.round(((totalMonthly + profile.monthlyDebtObligations) / profile.grossMonthlyIncome) * 1000) / 10;
  const paymentShockPct = Math.round(((totalMonthly - (profile.currentRentPayment || 2400)) / (profile.currentRentPayment || 2400)) * 100);

  const cashRequiredAtClosing = downPayment + closingCosts;
  const cashReservesPostClosing = Math.max(0, profile.liquidCashReserves - cashRequiredAtClosing);
  const reserveRunwayMonths = totalMonthly > 0 ? Math.round((cashReservesPostClosing / totalMonthly) * 10) / 10 : 0;

  let affordabilityStatus: 'Comfortable' | 'Modeled Stretch' | 'Incompatible' = 'Comfortable';
  let summaryExplanation = '';

  if (frontEndDTI <= 30 && backEndDTI <= 38 && cashReservesPostClosing >= totalMonthly * 2) {
    affordabilityStatus = 'Comfortable';
    summaryExplanation = `Front-end DTI (${frontEndDTI}%) and Back-end DTI (${backEndDTI}%) sit securely below standard 30/38 underwriting guidelines with ${reserveRunwayMonths} months of post-close reserves remaining.`;
  } else if (frontEndDTI <= 43 && backEndDTI <= 48 && cashReservesPostClosing >= totalMonthly * 1) {
    affordabilityStatus = 'Modeled Stretch';
    summaryExplanation = `Monthly housing commitment reaches ${frontEndDTI}% of gross income. Within FHA/conforming expanded qualification limits with ${reserveRunwayMonths} months reserves.`;
  } else {
    affordabilityStatus = 'Incompatible';
    summaryExplanation = `Back-end DTI (${backEndDTI}%) exceeds 48% qualification ceiling, or cash needed for closing ($${cashRequiredAtClosing.toLocaleString()}) exceeds liquid reserves.`;
  }

  return {
    propertyId: property.id,
    propertyAddress: property.address,
    propertyPrice: price,
    estimatedMonthlyHousingCost: {
      principalAndInterest,
      propertyTax,
      hazardInsurance,
      hoaFee,
      maintenanceReserve,
      pmi,
      totalMonthly
    },
    frontEndDTI,
    backEndDTI,
    paymentShockPct,
    cashRequiredAtClosing,
    cashReservesPostClosing,
    reserveRunwayMonths,
    affordabilityStatus,
    summaryExplanation
  };
}

// ----------------------------------------------------------------------------
// Credit & Down Payment What-If Scenario Simulator
// ----------------------------------------------------------------------------

export interface WhatIfSimulationResult {
  originalScore: number;
  projectedScore: number;
  scoreDifference: number;
  originalDTI: number;
  projectedDTI: number;
  originalUtilization: number;
  projectedUtilization: number;
  originalMaxPrice: number;
  projectedMaxPrice: number;
  projectedCashRemaining: number;
  newlyUnlockedHomesCount: number;
  simulationNarrative: string;
}

export function simulateHousingWhatIf(
  profile: HousingProfile,
  scenarios: {
    debtPayoffAmount: number;
    downPaymentIncrease: number;
    monthlySavingsBoost: number;
  },
  availableInventory: Property[]
): WhatIfSimulationResult {
  const currentScores = calculateHousingScores(profile);

  // Clone profile for simulation
  const simulated: HousingProfile = JSON.parse(JSON.stringify(profile));

  // 1. Apply Debt Payoff
  const payoff = Math.min(scenarios.debtPayoffAmount, simulated.totalRevolvingBalance);
  simulated.totalRevolvingBalance = Math.max(0, simulated.totalRevolvingBalance - payoff);
  simulated.revolvingUtilizationPct = Math.round((simulated.totalRevolvingBalance / simulated.totalRevolvingLimit) * 100);
  
  // Lower monthly debt payment assuming ~2.5% minimum revolving payment
  const monthlyDebtReduction = Math.round(payoff * 0.025);
  simulated.monthlyDebtObligations = Math.max(0, simulated.monthlyDebtObligations - monthlyDebtReduction);

  // 2. Adjust liquid cash
  simulated.downPaymentAvailable += scenarios.downPaymentIncrease;
  simulated.liquidCashReserves = Math.max(0, simulated.liquidCashReserves - payoff + (scenarios.monthlySavingsBoost * 6));

  const projectedScores = calculateHousingScores(simulated);
  const scoreDiff = projectedScores.housingCreditScore - currentScores.housingCreditScore;

  // Check how many homes become newly affordable
  let newlyUnlocked = 0;
  availableInventory.forEach((prop) => {
    const origFit = evaluatePropertyAffordability(profile, prop);
    const projFit = evaluatePropertyAffordability(simulated, prop);
    if (origFit.affordabilityStatus === 'Incompatible' && (projFit.affordabilityStatus === 'Comfortable' || projFit.affordabilityStatus === 'Modeled Stretch')) {
      newlyUnlocked++;
    }
  });

  return {
    originalScore: currentScores.housingCreditScore,
    projectedScore: projectedScores.housingCreditScore,
    scoreDifference: scoreDiff,
    originalDTI: currentScores.backEndDTI,
    projectedDTI: projectedScores.backEndDTI,
    originalUtilization: profile.revolvingUtilizationPct,
    projectedUtilization: simulated.revolvingUtilizationPct,
    originalMaxPrice: currentScores.maxAffordableHomePrice,
    projectedMaxPrice: projectedScores.maxAffordableHomePrice,
    projectedCashRemaining: simulated.liquidCashReserves,
    newlyUnlockedHomesCount: newlyUnlocked,
    simulationNarrative: `Paying down $${scenarios.debtPayoffAmount.toLocaleString()} in credit card obligations reduces your revolving utilization from ${profile.revolvingUtilizationPct}% to ${simulated.revolvingUtilizationPct}%, lifting your Housing Credit Score by +${scoreDiff} points to ${projectedScores.housingCreditScore} and unlocking ${newlyUnlocked} additional DMV properties.`
  };
}

// ----------------------------------------------------------------------------
// FCRA Adverse Action & Consumer Dispute Infrastructure
// ----------------------------------------------------------------------------

export function generateFCRAAdverseActionNotice(
  profile: HousingProfile,
  landlordName: string,
  propertyAddress: string,
  actionType: AdverseActionNotice['adverseActionTaken'] = 'Denial of Tenancy'
): AdverseActionNotice {
  const scores = calculateHousingScores(profile);

  return {
    noticeId: `FCRA-ADV-${Date.now().toString(36).toUpperCase()}`,
    dateGenerated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    applicantName: profile.fullName,
    propertyAddress,
    decisionMaker: landlordName,
    adverseActionTaken: actionType,
    craIdentity: {
      name: 'TruePlace Intelligence CRA Inc. (Consumer Reporting Division)',
      address: '8280 Greensboro Dr, Suite 600, McLean, VA 22102',
      tollFreePhone: '(888) 555-TRUE (8783)',
      website: 'https://expedite-consults.vercel.app/trueplace/disputes'
    },
    keyPrincipalFactors: [
      `Housing Credit Score of ${scores.housingCreditScore} was utilized in whole or in part to inform this decision.`,
      `Debt-to-Income (DTI) ratio exceeded modeled underwriting parameter for requested rental commitment.`,
      `Revolving credit utilization at ${profile.revolvingUtilizationPct}% of aggregate credit limits.`
    ],
    fcraDisclosureText: `Pursuant to Section 615(a) of the Fair Credit Reporting Act (15 U.S.C. § 1681m), you are hereby notified that adverse action has been taken with respect to your housing application based in whole or in part on information contained in a consumer report provided by the consumer reporting agency identified above. The consumer reporting agency did not make the decision to take adverse action and is unable to supply specific reasons why the adverse action was taken. You have the right under federal law to obtain a free copy of your consumer report from the agency within 60 days of receiving this notice, and the right to dispute the accuracy or completeness of any information contained in the report.`
  };
}

// ----------------------------------------------------------------------------
// Seed Verified Consumer Housing Profile (Interactive Demo Persona)
// ----------------------------------------------------------------------------

export const SEED_HOUSING_PROFILE: HousingProfile = {
  id: 'usr-dmv-784102',
  fullName: 'Jordan & Taylor Miller',
  email: 'jordan.miller@dmv-resident.org',
  phone: '(703) 555-0144',
  identityVerified: true,
  identityVerificationDate: '2026-03-12',
  identityProvider: 'ID.me Federal Assurance Level 2 (IAL2)',
  
  grossAnnualIncome: 275000,
  grossMonthlyIncome: 22916,
  netMonthlyIncome: 16500,
  employmentStatus: 'W2_FullTime',
  employerName: 'Mid-Atlantic Systems & Booz Allen',
  jobTitle: 'Senior Cloud Security Architect & Strategy Director',
  yearsAtCurrentJob: 4.8,
  incomeVerificationStatus: 'Verified_TheWorkNumber',
  
  checkingBalance: 28500,
  savingsBalance: 215000,
  liquidCashReserves: 243500,
  downPaymentAvailable: 195000,
  averageMonthlyDeposits: 20500,
  overdraftCount12Mo: 0,
  bankingDataSource: 'Plaid Connected',
  
  traditionalCreditScore: 782,
  totalRevolvingBalance: 3200,
  totalRevolvingLimit: 45000,
  revolvingUtilizationPct: 7,
  monthlyDebtObligations: 1380, // Auto ($480) + Student ($360) + Min Cards ($540)
  tradelines: [
    { id: 'TL-01', creditor: 'Chase Sapphire Reserve', type: 'revolving', balance: 1800, creditLimit: 25000, monthlyPayment: 60, status: 'current', openedDate: '2017-04-12', verifiedSource: 'TransUnion' },
    { id: 'TL-02', creditor: 'Navy Federal Credit Union', type: 'revolving', balance: 1400, creditLimit: 20000, monthlyPayment: 50, status: 'current', openedDate: '2016-09-20', verifiedSource: 'Experian' },
    { id: 'TL-03', creditor: 'Toyota Motor Credit', type: 'auto', balance: 12500, monthlyPayment: 480, status: 'current', openedDate: '2022-08-15', verifiedSource: 'TransUnion' },
    { id: 'TL-04', creditor: 'FedLoan Servicing / MOHELA', type: 'student', balance: 22400, monthlyPayment: 360, status: 'current', openedDate: '2017-06-01', verifiedSource: 'Equifax' },
  ],
  creditInquiriesLast12Mo: 1,
  oldestTradelineYears: 9.5,
  collectionsCount: 0,
  bankruptcyRecorded: false,
  creditBureauSource: 'TransUnion Core',
  
  currentRentPayment: 3200,
  evictionRecordsCount: 0,
  landlordReferenceStatus: 'Exemplary',
  rentalLedger: [
    { monthYear: '2026-03', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2026-02', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2026-01', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-12', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-11', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-10', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-09', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-08', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-07', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-06', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-05', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-04', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Dittmar Company Property Mgmt', verifiedVia: 'Plaid Bank Cash Flow' },
  ],
  
  consentRecords: [
    { purpose: 'PersonalPlanning', grantedDate: '2026-01-10T14:32:00Z', expiresDate: '2027-01-10T14:32:00Z', isActive: true, ipAddressRecorded: '68.100.144.12 (Fairfax, VA)' },
    { purpose: 'PropertyMatching', grantedDate: '2026-01-10T14:32:00Z', expiresDate: '2027-01-10T14:32:00Z', isActive: true, ipAddressRecorded: '68.100.144.12 (Fairfax, VA)' },
    { purpose: 'LandlordScreening', grantedDate: '2026-03-01T10:15:00Z', expiresDate: '2026-06-01T10:15:00Z', isActive: false, ipAddressRecorded: '68.100.144.12 (Fairfax, VA)' },
  ]
};

export const DEMO_PERSONAS: Record<string, { label: string; description: string; profile: HousingProfile }> = {
  dualIncome: {
    label: 'Jordan & Taylor Miller (Dual-Income Tech/Gov Household)',
    description: '$275k/yr W2 • $195k Down • 782 Traditional / 842 Housing Score',
    profile: SEED_HOUSING_PROFILE
  },
  soloBuyer: {
    label: 'Jordan S. Miller (Solo Emerging Buyer)',
    description: '$138k/yr W2 • $75k Down • 742 Traditional / 832 Housing Score',
    profile: {
      ...SEED_HOUSING_PROFILE,
      id: 'usr-dmv-solo',
      fullName: 'Jordan S. Miller (Solo Buyer)',
      grossAnnualIncome: 138000,
      grossMonthlyIncome: 11500,
      netMonthlyIncome: 8600,
      jobTitle: 'Senior Cloud Security Architect',
      checkingBalance: 14500,
      savingsBalance: 73500,
      liquidCashReserves: 88000,
      downPaymentAvailable: 75000,
      averageMonthlyDeposits: 10200,
      traditionalCreditScore: 742,
      totalRevolvingBalance: 4200,
      revolvingUtilizationPct: 12,
      monthlyDebtObligations: 1150,
      currentRentPayment: 2650,
    }
  },
  executive: {
    label: 'Marcus & Elena Vance (Executive / Private Wealth)',
    description: '$540k/yr W2 • $650k Down • 810 Traditional / 848 Housing Score',
    profile: {
      ...SEED_HOUSING_PROFILE,
      id: 'usr-dmv-exec',
      fullName: 'Marcus & Elena Vance',
      grossAnnualIncome: 540000,
      grossMonthlyIncome: 45000,
      netMonthlyIncome: 31000,
      jobTitle: 'Managing Director & Enterprise Partner',
      checkingBalance: 65000,
      savingsBalance: 715000,
      liquidCashReserves: 780000,
      downPaymentAvailable: 650000,
      averageMonthlyDeposits: 44000,
      traditionalCreditScore: 810,
      totalRevolvingBalance: 2100,
      totalRevolvingLimit: 75000,
      revolvingUtilizationPct: 3,
      monthlyDebtObligations: 2400,
      currentRentPayment: 5500,
    }
  }
};
