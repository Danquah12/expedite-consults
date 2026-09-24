import { calculateHousingScores, HousingProfile, PropertyAffordabilityAnalysis } from './housingCreditEngine';
import { REAL_DMV_INVENTORY } from './realDataService';
import { Property } from './mockData';

const TEST_PROFILE: HousingProfile = {
  id: 'usr-dmv-784102',
  fullName: 'Jordan S. Miller & Taylor Miller',
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
  jobTitle: 'Senior Cloud Security Architect',
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
  monthlyDebtObligations: 1380,
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
  
  rentalLedger: [
    { monthYear: '2026-02', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2026-01', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-12', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-11', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-10', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
    { monthYear: '2025-09', amountDue: 3200, amountPaid: 3200, paidOnTime: true, daysLate: 0, propertyAddress: '1800 Wilson Blvd #402, Arlington, VA', landlordOrManagement: 'Bozzuto Management', verifiedVia: 'Plaid Bank Cash Flow' },
  ],
  currentRentPayment: 3200,
  evictionRecordsCount: 0,
  landlordReferenceStatus: 'Exemplary',
  consentRecords: [
    { purpose: 'PersonalPlanning', grantedDate: '2026-01-10', expiresDate: '2027-01-10', isActive: true, ipAddressRecorded: '198.51.100.44' },
    { purpose: 'PropertyMatching', grantedDate: '2026-02-15', expiresDate: '2027-02-15', isActive: true, ipAddressRecorded: '198.51.100.44' },
    { purpose: 'LandlordScreening', grantedDate: '2026-03-01', expiresDate: '2026-09-01', isActive: true, ipAddressRecorded: '198.51.100.44' },
  ]
};

function testEvaluate(profile: HousingProfile, property: Property): PropertyAffordabilityAnalysis {
  const price = property.listPrice;
  const closingCosts = Math.round(price * 0.028);
  // Sensible down payment planning: up to 20% down or budget cap, maintaining at least $25k reserves
  const maxDown = Math.max(price * 0.05, Math.min(profile.downPaymentAvailable, price * 0.20, profile.liquidCashReserves - closingCosts - 25000));
  const downPayment = Math.min(price * 0.20, maxDown);
  const loanAmount = Math.max(0, price - downPayment);
  
  const monthlyRate = 0.06625 / 12;
  const numPayments = 360;
  const principalAndInterest = Math.round((loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1));

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

const statusCounts: Record<string, number> = {
  Comfortable: 0,
  'Modeled Stretch': 0,
  Incompatible: 0
};

REAL_DMV_INVENTORY.forEach((prop, i) => {
  const analysis = testEvaluate(TEST_PROFILE, prop);
  statusCounts[analysis.affordabilityStatus] = (statusCounts[analysis.affordabilityStatus] || 0) + 1;
  console.log(`${i + 1}. [${analysis.affordabilityStatus}] ${prop.address}, ${prop.city} ($${prop.listPrice.toLocaleString()}) - Mo: $${analysis.estimatedMonthlyHousingCost.totalMonthly.toLocaleString()} (Front DTI: ${analysis.frontEndDTI}%, Reserves: ${analysis.reserveRunwayMonths} mos)`);
});

console.log('\nDistribution across 25 DMV homes:', statusCounts);
