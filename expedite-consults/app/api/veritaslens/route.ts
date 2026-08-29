import { NextRequest, NextResponse } from 'next/server';
import { 
  INITIAL_MEDIA_OUTLETS, 
  INITIAL_NEWS_CLUSTERS, 
  INITIAL_CLAIMS, 
  INITIAL_KAFKA_STREAM, 
  INITIAL_DLQ_RECORDS, 
  INITIAL_TV_SCORECARDS, 
  INITIAL_SPIN_CASES, 
  INITIAL_MODEL_METRICS, 
  INITIAL_GRAPH_NODES, 
  INITIAL_GRAPH_EDGES 
} from '@/lib/veritaslens/data';
import { 
  classifyClaimText, 
  calculateLexicalLoad, 
  calculateSentimentPolarity, 
  exportBrandSafetyBlocklist 
} from '@/lib/veritaslens/pipeline-engine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');

  if (resource === 'outlets') {
    return NextResponse.json({ outlets: INITIAL_MEDIA_OUTLETS });
  }
  if (resource === 'clusters') {
    return NextResponse.json({ clusters: INITIAL_NEWS_CLUSTERS });
  }
  if (resource === 'claims') {
    return NextResponse.json({ claims: INITIAL_CLAIMS });
  }
  if (resource === 'kafka') {
    return NextResponse.json({ stream: INITIAL_KAFKA_STREAM, dlq: INITIAL_DLQ_RECORDS });
  }
  if (resource === 'tv') {
    return NextResponse.json({ scorecards: INITIAL_TV_SCORECARDS, spinCases: INITIAL_SPIN_CASES });
  }
  if (resource === 'graph') {
    return NextResponse.json({ nodes: INITIAL_GRAPH_NODES, edges: INITIAL_GRAPH_EDGES });
  }

  // Default: Return full platform state bundle
  return NextResponse.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    polarizationIndex: 71.4,
    outlets: INITIAL_MEDIA_OUTLETS,
    clusters: INITIAL_NEWS_CLUSTERS,
    claims: INITIAL_CLAIMS,
    kafkaStream: INITIAL_KAFKA_STREAM,
    dlqRecords: INITIAL_DLQ_RECORDS,
    tvScorecards: INITIAL_TV_SCORECARDS,
    spinCases: INITIAL_SPIN_CASES,
    modelMetrics: INITIAL_MODEL_METRICS,
    graphNodes: INITIAL_GRAPH_NODES,
    graphEdges: INITIAL_GRAPH_EDGES
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'classify') {
      const text = payload?.text || '';
      const classification = classifyClaimText(text);
      const lexical = calculateLexicalLoad(text);
      const sentiment = calculateSentimentPolarity(text);

      return NextResponse.json({
        success: true,
        text,
        classification,
        lexical,
        sentiment,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'export_blocklist') {
      const minReliability = payload?.minReliability ?? 35;
      const excludeExtremeBias = payload?.excludeExtremeBias ?? true;
      const format = payload?.format === 'csv' ? 'csv' : 'json';

      const blocklistContent = exportBrandSafetyBlocklist(
        INITIAL_MEDIA_OUTLETS,
        minReliability,
        excludeExtremeBias,
        format
      );

      return new NextResponse(blocklistContent, {
        headers: {
          'Content-Type': format === 'json' ? 'application/json' : 'text/csv',
          'Content-Disposition': `attachment; filename="Veritas_Ad_Blocklist.${format}"`
        }
      });
    }

    return NextResponse.json({ error: 'Unknown action parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
