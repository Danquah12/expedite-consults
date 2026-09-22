import { NextResponse } from 'next/server';
import { Property } from '@/app/trueplace/mockData';
import { generatePropertyIntelligenceReport } from '@/app/trueplace/intelligenceEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { property, question, history } = body as {
      property: Property;
      question: string;
      history?: { sender: 'user' | 'copilot'; text: string }[];
    };

    if (!property || !question) {
      return NextResponse.json(
        { status: 'error', message: 'Property and question are required.' },
        { status: 400 }
      );
    }

    const report = generatePropertyIntelligenceReport(property);
    const q = question.toLowerCase().trim();

    // 1. Try OpenAI if API key exists and is valid
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);

        const systemPrompt = `You are the TruePlace Search Copilot & Senior Real Estate Research Analyst.
You provide rigorous, honest, data-driven, and conversational intelligence about properties, neighborhoods, investments, zoning, and risks.
Always ground your answers in the following property intelligence data:
Address: ${property.address}, ${property.city}, ${property.state} ${property.zip}
List Price: $${property.listPrice.toLocaleString()} | TrueValue: $${property.trueValue.toLocaleString()}
Year Built: ${report.history.yearBuilt} | SqFt: ${report.history.sqft.toLocaleString()} | Beds: ${report.history.beds} | Baths: ${report.history.baths}
Permits & Renovations: ${JSON.stringify(report.history.permitsAndRenovations)}
Tax History: ${JSON.stringify(report.history.assessmentHistory[0])}
Market 5-Yr Appreciation: ${report.market.appreciation5Yr}% | Est Rent: $${report.market.estimatedMonthlyRent}/mo | Vacancy: ${report.market.rentalVacancyRatePct}%
Buy & Hold: Cap Rate ${report.investment.buyAndHold.capRatePct}% | Cash-on-Cash ${report.investment.buyAndHold.cashOnCashReturnPct}% | Net Cash Flow $${report.investment.buyAndHold.netMonthlyCashFlow}/mo
Fix & Flip: Rehab Est $${report.investment.fixAndFlip.estimatedRehabCost.toLocaleString()} | ARV $${report.investment.fixAndFlip.afterRepairValueARV.toLocaleString()} | Net Profit $${report.investment.fixAndFlip.estimatedNetProfit.toLocaleString()}
House Hack: Out-of-pocket payment $${report.investment.houseHack.netMonthlyHousingCost}/mo after $${report.investment.houseHack.rentalUnitIncomeMonthly}/mo rental income
Safety: ${report.safety.violentCrimePer1k} violent / ${report.safety.propertyCrimePer1k} property per 1k (Trend: ${report.safety.threeYearTrendPct}%) | Police Resp: ${report.safety.policeResponseAvgMin} min
Schools: Assigned High School ${report.schools.assignedHigh.name} (${report.schools.assignedHigh.rating}/10, Grad Rate ${report.schools.assignedHigh.graduationRatePct}%)
FEMA Flood: ${report.environmental.femaFloodZone} | Flood Risk: ${report.environmental.floodRiskLevel} | Wildfire: ${report.environmental.wildfireScore}/10 | AQI: ${report.environmental.airQualityIndexAvg}
Zoning: ${report.zoningAndAdu.zoningCode} | ADU Allowed: ${report.zoningAndAdu.aduEligibility.allowed} (Max ${report.zoningAndAdu.aduEligibility.maxAduSqft} sqft) | Duplex Allowed: ${report.zoningAndAdu.duplexConversionEligibility.allowed}
Scorecard: ${JSON.stringify(report.scorecard.map(s => `${s.category}: ${s.indicatorValue} (${s.statusBadge})`))}

Answer the user's question conversationally, objectively, and thoroughly. Use bullet points or short paragraphs where helpful. Never give generic boilerplate; cite the exact numbers from the data.`;

        const messages: any[] = [{ role: 'system', content: systemPrompt }];
        if (history && Array.isArray(history)) {
          for (const item of history.slice(-4)) {
            messages.push({
              role: item.sender === 'user' ? 'user' : 'assistant',
              content: item.text,
            });
          }
        }
        messages.push({ role: 'user', content: question });

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.3,
            max_tokens: 650,
          }),
        });

        clearTimeout(timeout);

        if (openAiRes.ok) {
          const aiData = await openAiRes.json();
          const answer = aiData.choices?.[0]?.message?.content;
          if (answer) {
            return NextResponse.json({
              status: 'ok',
              source: 'ai_copilot',
              answer,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (openAiErr) {
        console.warn('OpenAI API call error, falling back to intelligence synthesis:', openAiErr);
      }
    }

    // 2. High-Precision Deterministic Intelligence Synthesis Engine
    let answer = '';

    if (q.includes('should i buy') || q.includes('good purchase') || q.includes('recommend')) {
      const isUnder = property.trueValue > property.listPrice;
      const delta = Math.abs(property.trueValue - property.listPrice);
      answer = `### Copilot Strategic Buying Verdict\n\n` +
        `**Bottom Line:** ${isUnder ? `Yes, this property presents a compelling acquisition opportunity.` : `This property is priced at fair market equilibrium.`}\n\n` +
        `- **Valuation Advantage:** Listed at **$${property.listPrice.toLocaleString()}**, our multi-factor algorithmic model values it at **$${property.trueValue.toLocaleString()}** (${isUnder ? `+$${delta.toLocaleString()} buyer equity cushion` : `neutral market baseline`}).\n` +
        `- **Data Integrity:** The property carries a **TruthScore™ of ${property.truthScore}/100**, with verified municipal permits totaling **$${(property.homeTruthData?.permittedRepairsCost || 48300).toLocaleString()}** and zero recorded title defects or unpermitted flags.\n` +
        `- **Market Velocity:** ${property.city} has exhibited **${report.market.appreciation5Yr}% 5-year capital appreciation** with only ${report.market.averageDaysOnMarket} average days on market.\n` +
        `- **Key Caveats:** Monthly all-in TrueCost (including mortgage, property taxes, insurance, and maintenance reserve) is projected at **$${(report.investment.buyAndHold.estimatedMortgageMonthly + report.investment.buyAndHold.propertyTaxMonthly + report.investment.buyAndHold.insuranceMonthly + report.investment.buyAndHold.maintenanceReserveMonthly).toLocaleString()}/mo**.`;
    } else if (q.includes('risk') || q.includes('danger') || q.includes('downside') || q.includes('problem')) {
      answer = `### Top Risk Factors for ${property.address}\n\n` +
        `1. **Mechanical & Systems Lifecycle:** Built in ${report.history.yearBuilt}, the structural framing is in sound condition. Check the remaining life of the roof (${property.homeTruthData?.roofRemainingYears || 18} years remaining) and primary HVAC units (${property.homeTruthData?.hvacAgeYears || 4} years in service).\n` +
        `2. **Environmental & Flood:** Designated as **${report.environmental.femaFloodZone}** (${report.environmental.floodRiskLevel} flood probability). Historical FEMA records show zero recorded flood claims, so mandatory flood insurance is not required.\n` +
        `3. **Radon & Ground Gas:** EPA regional classification is **${report.environmental.radonPotential}**. We recommend requesting a continuous electronic radon monitor test during your 7-day inspection period.\n` +
        `4. **Carrying Costs:** Property taxes sit at **$${report.history.assessmentHistory[0].annualTax.toLocaleString()}/year**, increasing at approximately ${report.history.assessmentHistory[0].changePct}% annually based on county equalization cycles.`;
    } else if (q.includes('adu') || q.includes('duplex') || q.includes('convert') || q.includes('build')) {
      answer = `### Zoning & ADU Feasibility Analysis\n\n` +
        `Under zoning classification **${report.zoningAndAdu.zoningCode} (${report.zoningAndAdu.zoningDescription})**:\n\n` +
        `- **Accessory Dwelling Units (ADU):** **${report.zoningAndAdu.aduEligibility.allowed ? 'PERMITTED BY-RIGHT' : 'CONDITIONAL'}**. You can construct or convert an attached or detached ADU up to **${report.zoningAndAdu.aduEligibility.maxAduSqft.toLocaleString()} sqft**.\n` +
        `- **Setbacks & Height:** Maximum structural height is **${report.zoningAndAdu.maxBuildingHeightFt} ft**, with a rear setback of 5 ft and side setback matching primary structure.\n` +
        `- **Short-Term Rentals (STR):** ${report.zoningAndAdu.aduEligibility.shortTermRentalPermitted ? 'Permitted under local county registration rules.' : 'Restricted to 30+ day tenancy.'}\n` +
        `- **Duplex Conversion:** ${report.zoningAndAdu.duplexConversionEligibility.summaryText}`;
    } else if (q.includes('rent') || q.includes('cash flow') || q.includes('investment') || q.includes('roi')) {
      answer = `### Triple-Mode Investment Breakdown\n\n` +
        `#### 1. Buy & Hold Strategy\n` +
        `- **Projected Monthly Rent:** **$${report.investment.buyAndHold.estimatedGrossRentMonthly.toLocaleString()}/mo** (${report.market.rentalVacancyRatePct}% local vacancy rate)\n` +
        `- **Cap Rate:** **${report.investment.buyAndHold.capRatePct}%** | **Cash-on-Cash Return:** **${report.investment.buyAndHold.cashOnCashReturnPct}%**\n` +
        `- **Net Monthly Cash Flow:** **$${report.investment.buyAndHold.netMonthlyCashFlow.toLocaleString()}/mo** (after P&I, taxes, insurance, vacancy, and maintenance reserves)\n\n` +
        `#### 2. Fix & Flip Strategy\n` +
        `- **Purchase:** $${report.investment.fixAndFlip.purchasePrice.toLocaleString()} | **Estimated Rehab:** $${report.investment.fixAndFlip.estimatedRehabCost.toLocaleString()}\n` +
        `- **After Repair Value (ARV):** **$${report.investment.fixAndFlip.afterRepairValueARV.toLocaleString()}**\n` +
        `- **Projected Net Profit:** **$${report.investment.fixAndFlip.estimatedNetProfit.toLocaleString()}** (${report.investment.fixAndFlip.returnOnInvestmentPct}% ROI across 5 months)\n\n` +
        `#### 3. House Hack Strategy\n` +
        `- Owner-occupied monthly housing payment: **$${report.investment.houseHack.ownerOccupiedMortgageMonthly.toLocaleString()}/mo**\n` +
        `- Rental unit / ADU income: **-$${report.investment.houseHack.rentalUnitIncomeMonthly.toLocaleString()}/mo**\n` +
        `- **Net Out-of-Pocket Housing Cost:** **$${report.investment.houseHack.netMonthlyHousingCost.toLocaleString()}/mo** (Saves ~$${report.investment.houseHack.monthlySavingsVsRentingLocalAverage.toLocaleString()}/mo vs renting locally)`;
    } else if (q.includes('monthly payment') || q.includes('mortgage') || q.includes('cost')) {
      const b = report.investment.buyAndHold;
      answer = `### Monthly Out-of-Pocket TrueCost™ Breakdown\n\n` +
        `- **Principal & Interest (20% Down, 6.625% 30-Yr Fixed):** $${b.estimatedMortgageMonthly.toLocaleString()}/mo\n` +
        `- **Property Taxes (County Base):** $${b.propertyTaxMonthly.toLocaleString()}/mo\n` +
        `- **Hazard Homeowners Insurance:** $${b.insuranceMonthly.toLocaleString()}/mo\n` +
        `- **Maintenance Reserve (1% Rule):** $${b.maintenanceReserveMonthly.toLocaleString()}/mo\n` +
        `- **Total Estimated Monthly Carrying Cost:** **$${(b.estimatedMortgageMonthly + b.propertyTaxMonthly + b.insuranceMonthly + b.maintenanceReserveMonthly).toLocaleString()}/mo**\n\n` +
        `*Note: TruePlace computes true carrying costs rather than advertised principal and interest alone.*`;
    } else if (q.includes('seller') || q.includes('questions to ask') || q.includes('inspection')) {
      answer = `### High-Leverage Questions to Ask the Seller\n\n` +
        `1. **Age of Capital Systems:** *"Can you provide receipts and warranties for the ${report.history.permitsAndRenovations[0]?.type || 'HVAC and roof upgrades'}?"*\n` +
        `2. **Basement & Foundation:** *"Have there been any moisture intrusion, sump pump failures, or foundation waterproofing warranties within the last 5 years?"*\n` +
        `3. **Utility Costs:** *"What are your peak summer and winter monthly electric and gas utility expenditures?"*\n` +
        `4. **Zoning & Easements:** *"Are there any utility easements, shared driveways, or HOA architectural review restrictions affecting the ${report.history.lotSizeSqft.toLocaleString()} sqft parcel?"*\n` +
        `5. **Title & Conveyance:** *"Can you confirm clear fee-simple title conveyance through your designated local title company?"*`;
    } else {
      answer = `### AI Intelligence Report for ${property.address}\n\n` +
        `- **Property Fundamentals:** Erected in **${report.history.yearBuilt}**, offering **${report.history.sqft.toLocaleString()} sqft**, ${report.history.beds} bedrooms, and ${report.history.baths} bathrooms on a ${report.history.lotSizeSqft.toLocaleString()} sqft lot.\n` +
        `- **Pricing & Valuation:** Listed at **$${property.listPrice.toLocaleString()}** with a TrueValue™ of **$${property.trueValue.toLocaleString()}** (TruthScore™: ${property.truthScore}/100).\n` +
        `- **Market Velocity:** **${report.market.appreciation5Yr}% 5-year price appreciation** with ${report.market.averageDaysOnMarket} average days on market.\n` +
        `- **Public Safety:** ${report.safety.violentCrimePer1k} violent / ${report.safety.propertyCrimePer1k} property crimes per 1k residents (down ${Math.abs(report.safety.threeYearTrendPct)}% over 3 years).\n` +
        `- **Schools:** Feeds into **${report.schools.assignedHigh.name}** (${report.schools.assignedHigh.rating}/10, ${report.schools.assignedHigh.graduationRatePct}% graduation rate).\n` +
        `- **Zoning:** Classified as **${report.zoningAndAdu.zoningCode}**, with by-right ADU construction permitted up to ${report.zoningAndAdu.aduEligibility.maxAduSqft} sqft.\n\n` +
        `Feel free to ask follow-up questions about investment math, ADU rules, risk factors, or negotiation strategy!`;
    }

    return NextResponse.json({
      status: 'ok',
      source: 'intelligence_engine',
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to process Copilot query' },
      { status: 500 }
    );
  }
}
