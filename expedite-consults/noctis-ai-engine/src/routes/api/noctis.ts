import { createFileRoute } from "@tanstack/react-router";

type Turn = { role?: unknown; content?: unknown; images?: unknown };

function cleanImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  const images: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(item)) {
      if (item.length > 1_400_000) continue;
    } else if (!(/^https:\/\/\S+$/i.test(item) && item.length < 800 && !/\.(mp4|webm|mov)(\?|$)/i.test(item))) continue;
    images.push(item);
    if (images.length >= 2) break;
  }
  return images;
}

export const Route = createFileRoute("/api/noctis")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("pde") === "health") {
          const { noctisPde } = await import("@/lib/noctis-pde");
          return Response.json(noctisPde.getHealth(), { headers: { "cache-control": "no-store" } });
        }
        if (url.searchParams.get("pde") === "test-suite") {
          const { runZeroTrustPolicyTestSuite } = await import("@/lib/noctis-pde");
          return Response.json(runZeroTrustPolicyTestSuite(), { headers: { "cache-control": "no-store" } });
        }
        if (url.searchParams.get("pde") === "policy") {
          const { noctisPde } = await import("@/lib/noctis-pde");
          const id = url.searchParams.get("id") || "finance-read-policy";
          const version = url.searchParams.get("version") || "12";
          const bundle = noctisPde.getPolicyVersion(id, version);
          return Response.json(bundle || { error: "POLICY_VERSION_NOT_FOUND" }, {
            status: bundle ? 200 : 404,
            headers: { "cache-control": "no-store" },
          });
        }
        if (url.searchParams.get("research") === "plan") {
          const { noctisDeepResearch } = await import("@/lib/noctis-deep-research");
          const jobId = url.searchParams.get("job_id") || "res-job-national-grid-01";
          const plan = noctisDeepResearch.getJobPlan(jobId);
          return Response.json(plan || { error: "RESEARCH_JOB_NOT_FOUND" }, {
            status: plan ? 200 : 404,
            headers: { "cache-control": "no-store" },
          });
        }
        if (url.searchParams.get("research") === "job") {
          const { noctisDeepResearch } = await import("@/lib/noctis-deep-research");
          const jobId = url.searchParams.get("job_id") || "res-job-national-grid-01";
          const job = noctisDeepResearch.getJob(jobId);
          return Response.json(job || { error: "RESEARCH_JOB_NOT_FOUND" }, {
            status: job ? 200 : 404,
            headers: { "cache-control": "no-store" },
          });
        }
        if (url.searchParams.get("research") === "evidence") {
          const { noctisDeepResearch } = await import("@/lib/noctis-deep-research");
          const jobId = url.searchParams.get("job_id") || "res-job-national-grid-01";
          const tenantId = url.searchParams.get("tenant_id") || "tenant-vibe-prod";
          const evidence = noctisDeepResearch.getJobEvidence(jobId, tenantId);
          return Response.json(evidence || { error: "RESEARCH_JOB_NOT_FOUND" }, {
            status: evidence && !("error" in evidence) ? 200 : evidence ? 403 : 404,
            headers: { "cache-control": "no-store" },
          });
        }
        if (url.searchParams.get("research") === "benchmark") {
          const { runDeepResearchBenchmarkSuite } = await import("@/lib/noctis-deep-research");
          return Response.json(runDeepResearchBenchmarkSuite(), { headers: { "cache-control": "no-store" } });
        }
        if (url.searchParams.get("research") === "ric") {
          const { noctisRic } = await import("@/lib/noctis-ric");
          const jobId = url.searchParams.get("job_id") || "res-job-national-grid-01";
          return Response.json(noctisRic.evaluateProject(jobId), { headers: { "cache-control": "no-store" } });
        }
        if (url.searchParams.get("research") === "ric-benchmark") {
          const { runRicDisputedClaimBenchmark } = await import("@/lib/noctis-ric");
          return Response.json(runRicDisputedClaimBenchmark(), { headers: { "cache-control": "no-store" } });
        }
        if (url.searchParams.get("frontier") === "suite") {
          const { runFrontierPillarsTestSuite } = await import("@/lib/noctis-frontier-pillars");
          return Response.json(runFrontierPillarsTestSuite(), { headers: { "cache-control": "no-store" } });
        }
        if (url.searchParams.get("health") === "suite") {
          const {
            runHealthIntelligenceTestSuite,
            runBlueprintAcceptanceSuiteH001ToH012,
            runNhArch001VerificationSuite,
          } = await import("@/lib/noctis-health-engine");
          const clinicalSuite = runHealthIntelligenceTestSuite();
          const blueprintSuite = runBlueprintAcceptanceSuiteH001ToH012();
          const nhArch001Suite = runNhArch001VerificationSuite();
          return Response.json(
            {
              ...clinicalSuite,
              blueprintAcceptanceSuiteH001ToH012: blueprintSuite,
              nhArch001VerificationSuite: nhArch001Suite,
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("health") === "nh-arch-001") {
          const {
            NH_ARCH_001_DEPLOYMENT_ZONES,
            NH_ARCH_001_COMPONENT_INVENTORY,
            NH_ARCH_001_ALLOWED_WORKFLOW_STATES,
            NH_ARCH_001_MILESTONES_A_TO_G,
            NH_ARCH_001_CONFIRMED_DECISIONS,
            buildNhArch001SampleContracts,
            runNhArch001VerificationSuite,
          } = await import("@/lib/noctis-health-engine");
          return Response.json(
            {
              specId: "NH-ARCH-001",
              title: "Noctis Health: Component Architecture & Deployment Design",
              version: "1.0",
              deploymentZones: NH_ARCH_001_DEPLOYMENT_ZONES,
              componentInventory15: NH_ARCH_001_COMPONENT_INVENTORY,
              allowedWorkflowStates10: NH_ARCH_001_ALLOWED_WORKFLOW_STATES,
              serviceContracts5: buildNhArch001SampleContracts(),
              milestonesAToG: NH_ARCH_001_MILESTONES_A_TO_G,
              confirmedDecisions5: NH_ARCH_001_CONFIRMED_DECISIONS,
              verificationSuite: runNhArch001VerificationSuite(),
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("health") === "blueprint") {
          const {
            NOCTIS_5_OPERATING_ENVIRONMENTS,
            NOCTIS_11_CORE_HEALTH_SERVICES,
            NOCTIS_8_CROSS_CUTTING_ENGINES,
            NOCTIS_18_HEALTH_ENGINES,
            NOCTIS_HEALTH_ROLLOUT_PHASES,
            runBlueprintAcceptanceSuiteH001ToH012,
          } = await import("@/lib/noctis-health-engine");
          return Response.json(
            {
              version: "1.0",
              initialMarket: "United States",
              usCoreVersion: "HL7 US Core v9.0.0",
              initialAudience: "All audiences, with separate permission levels",
              patientDataAccess: "Uploads plus authorized EHR/device integrations",
              operatingEnvironments5: NOCTIS_5_OPERATING_ENVIRONMENTS,
              coreServices11: NOCTIS_11_CORE_HEALTH_SERVICES,
              crossCuttingEngines8: NOCTIS_8_CROSS_CUTTING_ENGINES,
              medicalEngines18: NOCTIS_18_HEALTH_ENGINES,
              rolloutPhases: NOCTIS_HEALTH_ROLLOUT_PHASES,
              acceptanceSuiteH001ToH012: runBlueprintAcceptanceSuiteH001ToH012(),
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("health") === "engines") {
          const { NOCTIS_18_HEALTH_ENGINES, NOCTIS_8_CROSS_CUTTING_ENGINES } = await import("@/lib/noctis-health-engine");
          return Response.json(
            {
              totalMedicalEngines: NOCTIS_18_HEALTH_ENGINES.length,
              totalCrossCuttingEngines: NOCTIS_8_CROSS_CUTTING_ENGINES.length,
              medicalEngines: NOCTIS_18_HEALTH_ENGINES,
              crossCuttingEngines: NOCTIS_8_CROSS_CUTTING_ENGINES,
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("health") === "repository") {
          const { NOCTIS_MEDICAL_REPOSITORY, SAMPLE_PATIENT_FHIR_OBSERVATIONS } = await import(
            "@/lib/noctis-health-engine"
          );
          return Response.json(
            {
              fhirVersion: "HL7 FHIR v5.0.0 / HL7 US Core v9.0.0",
              totalVerifiedSources: NOCTIS_MEDICAL_REPOSITORY.filter((s) => s.actionableForClinicalSupport).length,
              quarantinedSources: NOCTIS_MEDICAL_REPOSITORY.filter((s) => !s.actionableForClinicalSupport).length,
              sources: NOCTIS_MEDICAL_REPOSITORY,
              sampleFhirObservations: SAMPLE_PATIENT_FHIR_OBSERVATIONS,
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("professional") === "suite") {
          const {
            runProfessionalIntelligenceTestSuite,
            runMultiDomainEngineeringCalculations,
            runConstructionBoqEstimate,
            runDieselCranksNoStartDiagnostics,
            buildSamplePumpDigitalThread,
          } = await import("@/lib/noctis-professional-engine");
          return Response.json(
            {
              acceptanceSuite: runProfessionalIntelligenceTestSuite(),
              multiDomainCalculations: runMultiDomainEngineeringCalculations(),
              sampleConstructionBoq: runConstructionBoqEstimate({}),
              sampleDieselDiagnostics: runDieselCranksNoStartDiagnostics({
                measuredBatteryVoltageV: 11.4,
                measuredCrankingRpm: 245,
                measuredRailPressureBar: 85,
                activeDtcs: ["P0087"],
                immobilizerLightFlashing: false,
              }),
              sampleEngineeringDigitalThread: buildSamplePumpDigitalThread(),
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("professional") === "directory") {
          const {
            NOCTIS_42_PROFESSION_CATEGORIES,
            NOCTIS_22_SPECIALIST_PROFESSIONAL_ENGINES,
            NOCTIS_20_ADVANCED_EXECUTION_ENGINES,
            NOCTIS_6_SHARED_TECHNICAL_ENGINES,
            NOCTIS_11_PROFESSIONAL_DEVELOPER_SERVICES,
          } = await import("@/lib/noctis-professional-engine");
          return Response.json(
            {
              taxonomyHierarchy: "Industry -> Profession -> Specialization -> Skill -> Certification",
              totalProfessionCategoriesCovered: 42,
              sharedTechnicalEngines6: NOCTIS_6_SHARED_TECHNICAL_ENGINES,
              developerServices11: NOCTIS_11_PROFESSIONAL_DEVELOPER_SERVICES,
              specialistEngines22: NOCTIS_22_SPECIALIST_PROFESSIONAL_ENGINES,
              advancedExecutionEngines20: NOCTIS_20_ADVANCED_EXECUTION_ENGINES,
              professionDirectory: NOCTIS_42_PROFESSION_CATEGORIES,
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("execution") === "suite") {
          const { runVerifiedExecutionAndAdversarialSuite } = await import("@/lib/noctis-verified-execution");
          return Response.json(runVerifiedExecutionAndAdversarialSuite(), {
            headers: { "cache-control": "no-store" },
          });
        }
        if (url.searchParams.get("execution") === "registry") {
          const {
            NOCTIS_CAPABILITY_REGISTRY,
            NOCTIS_MATURITY_MODEL_L1_TO_L5,
            NOCTIS_SYSTEMS_11_TO_20,
            buildUnifiedWorkbenchState,
          } = await import("@/lib/noctis-verified-execution");
          return Response.json(
            {
              maturityModelL1ToL5: NOCTIS_MATURITY_MODEL_L1_TO_L5,
              capabilityRegistry: NOCTIS_CAPABILITY_REGISTRY,
              organizationalSystems11To20: NOCTIS_SYSTEMS_11_TO_20,
              workbenchStateTask1042: buildUnifiedWorkbenchState("TASK-1042"),
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("prediction") === "suite") {
          const { runNoctisPred001AcceptanceSuite } = await import("@/lib/noctis-predictive-intelligence");
          return Response.json(runNoctisPred001AcceptanceSuite(), {
            headers: { "cache-control": "no-store" },
          });
        }
        if (url.searchParams.get("prediction") === "dashboard") {
          const {
            getPredictionEvaluationDashboard,
            NOCTIS_15_PREDICTION_ENGINES,
            NOCTIS_10_SHARED_PREDICTION_COMPONENTS,
            NOCTIS_PREDICTION_MODEL_REGISTRY,
          } = await import("@/lib/noctis-predictive-intelligence");
          return Response.json(
            {
              dashboard: getPredictionEvaluationDashboard(),
              engines15: NOCTIS_15_PREDICTION_ENGINES,
              sharedPlatformComponents10: NOCTIS_10_SHARED_PREDICTION_COMPONENTS,
              modelRegistry: NOCTIS_PREDICTION_MODEL_REGISTRY,
            },
            { headers: { "cache-control": "no-store" } }
          );
        }
        if (url.searchParams.get("bridge") === "status") {
          const {
            getNoctisStandaloneBridgeStatus,
            getNoctisCorsAndBridgeHeaders,
            isStandaloneNoctisEngineHost,
          } = await import("@/lib/noctis-standalone-bridge");
          const bridgeStatus = await getNoctisStandaloneBridgeStatus(request);
          return Response.json(bridgeStatus, {
            headers: getNoctisCorsAndBridgeHeaders(
              isStandaloneNoctisEngineHost(url.hostname)
                ? "standalone-engine-direct"
                : "social-gateway-forwarded"
            ),
          });
        }
        const { trainingStatus, exportTrainingJsonl } = await import("@/lib/noctis-train.server");
        if (url.searchParams.get("export") === "jsonl") {
          const jsonl = await exportTrainingJsonl();
          return new Response(jsonl, {
            headers: {
              "content-type": "application/x-ndjson; charset=utf-8",
              "content-disposition": 'attachment; filename="noctis-training-dataset.jsonl"',
              "cache-control": "no-store",
            },
          });
        }
        const status = await trainingStatus();
        return Response.json(status, { headers: { "cache-control": "no-store" } });
      },
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          turns?: Turn[];
          train?: { question?: unknown; answer?: unknown } | { question?: unknown; answer?: unknown }[];
          rules?: unknown[];
          skill?: unknown;
          depth?: unknown;
          language?: unknown;
          think?: unknown;
          code?: unknown;
          context?: unknown;
          authorization_request?: unknown;
          authorization_batch?: unknown;
          revoke_session?: { session_id?: string; actor?: string; reason?: string };
          pip_signals?: Record<string, unknown>;
          research_job?: { objective?: string; scope?: string; tenantId?: string };
          research_revision?: {
            job_id?: string;
            newScopeOrConstraint?: string;
            updatedPopulation?: number;
            updatedInverterMw?: number;
            updatedBatteryMwh?: number;
          };
          ric_trace?: {
            changedId?: string;
            newConditionDescription?: string;
            population?: number;
            peakSunHoursWinter?: number;
          };
          health_document?: {
            document_type?: "laboratory_report" | "pathology_report" | "radiology_report" | "discharge_summary" | "encounter_note" | "medication_list" | "problem_list" | "specialist_consultation_report";
            patient_id?: string;
            requester_id?: string;
            requester_role?: "public_user" | "patient" | "caregiver_proxy" | "clinician" | "researcher" | "organization_admin" | "security_auditor";
            source_type?: "user_upload" | "ehr_us_core_v9" | "device_sync";
            purpose?: "patient_education" | "clinician_review" | "caregiver_coordination" | "research_deidentified";
            requested_outputs?: ("plain_language_summary" | "extracted_findings" | "questions_for_clinician" | "source_provenance")[];
            language?: string;
            raw_text_override?: string;
            has_unreadable_section?: boolean;
            contradictory_value_present?: boolean;
            ehr_connection_revoked?: boolean;
          };
          health_safety_check?: {
            query?: string;
            patientId?: string;
            requesterTenantOrPatientId?: string;
            rawRecordText?: string;
          };
          clinical_calculator?: {
            calculator?: "CKD-EPI-2021-EGFR" | "CHA2DS2-VASC";
            ageYears?: number;
            sexAtBirth?: "female" | "male";
            serumCreatinineMgDl?: number;
            congestiveHeartFailure?: boolean;
            hypertension?: boolean;
            diabetesMellitus?: boolean;
            priorStrokeOrTia?: boolean;
            vascularDisease?: boolean;
          };
          medication_safety?: {
            activeMedications?: string[];
            patientAllergies?: string[];
            eGfrMlMin173m2?: number;
            potassiumMmolL?: number;
          };
          auto_ingest_spec?: {
            title?: string;
            raw_text?: string;
            domain?: string;
          };
          construction_boq?: Record<string, unknown>;
          diesel_diagnostics?: Record<string, unknown>;
        } | null;
        if (body?.auto_ingest_spec && typeof body.auto_ingest_spec === "object") {
          const { trainNoctisFromRawDocument } = await import("@/lib/noctis-train.server");
          const res = await trainNoctisFromRawDocument({
            title: String(body.auto_ingest_spec.title || "Uploaded Noctis Specification"),
            rawText: String(body.auto_ingest_spec.raw_text || ""),
            domain: body.auto_ingest_spec.domain ? String(body.auto_ingest_spec.domain) : "engineering",
          });
          return Response.json(res, { headers: { "cache-control": "no-store" } });
        }
        if (body?.construction_boq && typeof body.construction_boq === "object") {
          const { runConstructionBoqEstimate } = await import("@/lib/noctis-professional-engine");
          return Response.json(runConstructionBoqEstimate(body.construction_boq), {
            headers: { "cache-control": "no-store" },
          });
        }
        if (body?.diesel_diagnostics && typeof body.diesel_diagnostics === "object") {
          const { runDieselCranksNoStartDiagnostics } = await import("@/lib/noctis-professional-engine");
          return Response.json(runDieselCranksNoStartDiagnostics(body.diesel_diagnostics), {
            headers: { "cache-control": "no-store" },
          });
        }
        if (body?.health_document && typeof body.health_document === "object") {
          const { processHealthDocumentUpload } = await import("@/lib/noctis-health-engine");
          const docRes = processHealthDocumentUpload({
            document_type: body.health_document.document_type || "pathology_report",
            patient_id: body.health_document.patient_id || "patient-1042",
            requester_id: body.health_document.requester_id,
            requester_role: body.health_document.requester_role,
            source_type: body.health_document.source_type || "user_upload",
            purpose: body.health_document.purpose || "patient_education",
            requested_outputs: body.health_document.requested_outputs || [
              "plain_language_summary",
              "extracted_findings",
              "questions_for_clinician",
              "source_provenance",
            ],
            language: body.health_document.language || "en-US",
            raw_text_override: body.health_document.raw_text_override,
            has_unreadable_section: body.health_document.has_unreadable_section,
            contradictory_value_present: body.health_document.contradictory_value_present,
            ehr_connection_revoked: body.health_document.ehr_connection_revoked,
          });
          return Response.json(docRes, { status: docRes.http_status, headers: { "cache-control": "no-store" } });
        }
        if (body?.health_safety_check && typeof body.health_safety_check === "object") {
          const { evaluateHealthSafetyGateway } = await import("@/lib/noctis-health-engine");
          const result = evaluateHealthSafetyGateway({
            question: body.health_safety_check.query || "",
            patientId: body.health_safety_check.patientId,
            requesterTenantOrPatientId: body.health_safety_check.requesterTenantOrPatientId,
            rawRecordText: body.health_safety_check.rawRecordText,
          });
          return Response.json(result, { headers: { "cache-control": "no-store" } });
        }
        if (body?.clinical_calculator && typeof body.clinical_calculator === "object") {
          const { runClinicalCalculator } = await import("@/lib/noctis-health-engine");
          const result = runClinicalCalculator(body.clinical_calculator.calculator || "CKD-EPI-2021-EGFR", {
            ageYears: body.clinical_calculator.ageYears,
            sex: body.clinical_calculator.sexAtBirth,
            serumCreatinineMgDl: body.clinical_calculator.serumCreatinineMgDl,
            congestiveHeartFailure: body.clinical_calculator.congestiveHeartFailure,
            hypertension: body.clinical_calculator.hypertension,
            diabetes: body.clinical_calculator.diabetesMellitus,
            priorStrokeOrTia: body.clinical_calculator.priorStrokeOrTia,
            vascularDisease: body.clinical_calculator.vascularDisease,
          });
          return Response.json(result, { headers: { "cache-control": "no-store" } });
        }
        if (body?.medication_safety && typeof body.medication_safety === "object") {
          const { evaluateMedicationSafety } = await import("@/lib/noctis-health-engine");
          const result = evaluateMedicationSafety({
            medications: Array.isArray(body.medication_safety.activeMedications)
              ? body.medication_safety.activeMedications
              : [],
            documentedAllergies: Array.isArray(body.medication_safety.patientAllergies)
              ? body.medication_safety.patientAllergies
              : [],
            egfrMlMin: body.medication_safety.eGfrMlMin173m2,
            potassiumMmolL: body.medication_safety.potassiumMmolL,
          });
          return Response.json(result, { headers: { "cache-control": "no-store" } });
        }
        if (body?.ric_trace && typeof body.ric_trace === "object") {
          const { noctisRic } = await import("@/lib/noctis-ric");
          const traced = noctisRic.traceDependencyInvalidation(
            body.ric_trace.changedId || "ASM-PSH-5.0",
            body.ric_trace.newConditionDescription || "Updated assumption via RIC Dependency Graph API",
            {
              population: body.ric_trace.population ?? 50000,
              peakSunHoursWinter: body.ric_trace.peakSunHoursWinter ?? 2.5,
            }
          );
          return Response.json(traced, { headers: { "cache-control": "no-store" } });
        }
        if (body?.research_job && typeof body.research_job === "object") {
          const { noctisDeepResearch } = await import("@/lib/noctis-deep-research");
          const created = noctisDeepResearch.createJob({
            objective: body.research_job.objective || "Independent Deep Research Audit",
            scope: body.research_job.scope || "Enterprise & Infrastructure Scope",
            tenantId: body.research_job.tenantId,
          });
          return Response.json(created, { headers: { "cache-control": "no-store" } });
        }
        if (body?.research_revision && typeof body.research_revision === "object") {
          const { noctisDeepResearch } = await import("@/lib/noctis-deep-research");
          const jobId = body.research_revision.job_id || "res-job-national-grid-01";
          const revised = noctisDeepResearch.reviseJob(jobId, {
            newScopeOrConstraint:
              body.research_revision.newScopeOrConstraint ||
              "Scale population and recalculate all dependent figures",
            updatedPopulation: body.research_revision.updatedPopulation,
            updatedInverterMw: body.research_revision.updatedInverterMw,
            updatedBatteryMwh: body.research_revision.updatedBatteryMwh,
          });
          return Response.json(revised || { error: "RESEARCH_JOB_NOT_FOUND" }, {
            status: revised ? 200 : 404,
            headers: { "cache-control": "no-store" },
          });
        }
        if (body?.authorization_request && typeof body.authorization_request === "object") {
          const { noctisPde } = await import("@/lib/noctis-pde");
          const decision = noctisPde.evaluateDecision(
            body.authorization_request as Parameters<typeof noctisPde.evaluateDecision>[0],
            body.pip_signals as Parameters<typeof noctisPde.evaluateDecision>[1]
          );
          return Response.json(decision, { headers: { "cache-control": "no-store" } });
        }
        if (Array.isArray(body?.authorization_batch)) {
          const { noctisPde } = await import("@/lib/noctis-pde");
          const decisions = noctisPde.evaluateBatch(
            body.authorization_batch as Parameters<typeof noctisPde.evaluateBatch>[0],
            body.pip_signals as Parameters<typeof noctisPde.evaluateBatch>[1]
          );
          return Response.json({ decisions }, { headers: { "cache-control": "no-store" } });
        }
        if (body?.revoke_session?.session_id) {
          const { noctisPde } = await import("@/lib/noctis-pde");
          const revoked = noctisPde.revokeSession(
            body.revoke_session.session_id,
            body.revoke_session.actor,
            body.revoke_session.reason
          );
          return Response.json(revoked, { headers: { "cache-control": "no-store" } });
        }
        if (body?.train || Array.isArray(body?.rules)) {
          const { trainPair, rememberRule, trainingStatus } = await import("@/lib/noctis-train.server");
          const list = Array.isArray(body.train) ? body.train : body.train ? [body.train] : [];
          let savedPairs = 0;
          for (const item of list.slice(0, 200)) {
            if (!item || typeof item.question !== "string" || typeof item.answer !== "string") continue;
            const res = await trainPair(item.question, item.answer, "api-trained");
            if (res.ok) savedPairs += 1;
          }
          let savedRules = 0;
          if (Array.isArray(body.rules)) {
            for (const rule of body.rules.slice(0, 50)) {
              if (typeof rule !== "string") continue;
              const res = await rememberRule(rule);
              if (res.ok) savedRules += 1;
            }
          }
          const status = await trainingStatus();
          return Response.json({ ok: true, savedPairs, savedRules, status }, { headers: { "cache-control": "no-store" } });
        }
        const {
          forwardPostToStandaloneNoctisEngine,
          getNoctisCorsAndBridgeHeaders,
          isStandaloneNoctisEngineHost,
          NOCTIS_STANDALONE_ENGINE_ORIGIN,
        } = await import("@/lib/noctis-standalone-bridge");
        const forwardedResponse = await forwardPostToStandaloneNoctisEngine(request, body);
        if (forwardedResponse) {
          return forwardedResponse;
        }
        const reqUrl = new URL(request.url);
        const isEngineHost = isStandaloneNoctisEngineHost(reqUrl.hostname);

        const { clipTurn, retainSources } = await import("@/lib/noctis-hard");
        const turns: { role: "user" | "assistant"; content: string; images?: string[] }[] = [];
        if (Array.isArray(body?.turns)) {
          for (const turn of body.turns) {
            if (!turn || (turn.role !== "user" && turn.role !== "assistant") || typeof turn.content !== "string") continue;
            const images = turn.role === "user" ? cleanImages(turn.images) : [];
            const content = clipTurn(turn.role, turn.content);
            if (!content.trim() && !images.length) continue;
            turns.push({ role: turn.role, content: content || "Look at the uploaded image.", ...(images.length ? { images } : {}) });
          }
        }
        if (!turns.some((turn) => turn.role === "user" && (turn.content.trim() || turn.images?.length))) {
          return Response.json(
            { error: "Write a question first." },
            {
              headers: getNoctisCorsAndBridgeHeaders(
                isEngineHost ? "standalone-engine-direct" : "social-local-fallback"
              ),
            }
          );
        }
        try {
          const { vibeReply } = await import("@/lib/noctis-desk.server");
          let baked = "";
          try {
            const keyMod = await import("virtual:openai-key");
            baked = typeof keyMod.OPENAI_API_KEY === "string" ? keyMod.OPENAI_API_KEY : "";
          } catch {
            baked = "";
          }
          const reply = await vibeReply(retainSources(turns), baked, {
            skill: typeof body?.skill === "string" ? body.skill : "talk",
            depth: body?.depth === "deep" ? "deep" : "plain",
            think: body?.think === true,
            code: body?.code === true,
            language: typeof body?.language === "string" ? body.language : "English",
            context: typeof body?.context === "string" ? body.context : "",
          });
          return Response.json(
            {
              ...reply,
              engine_origin: isEngineHost ? NOCTIS_STANDALONE_ENGINE_ORIGIN : reqUrl.origin,
              answered_via: isEngineHost ? "noctis-ai-standalone-engine" : "noctis-local-fallback",
            },
            {
              headers: getNoctisCorsAndBridgeHeaders(
                isEngineHost ? "standalone-engine-direct" : "social-local-fallback"
              ),
            }
          );
        } catch {
          return Response.json(
            { error: "Noctis could not finish that answer." },
            {
              headers: getNoctisCorsAndBridgeHeaders(
                isEngineHost ? "standalone-engine-direct" : "social-local-fallback"
              ),
            }
          );
        }
      },
    },
  },
});
