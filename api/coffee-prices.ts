import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Fetch from FRED
    const response = await fetch(
      'https://fred.stlouisfed.org/graph/fredgraph.csv?id=PCOFFOTMUSDM'
    );
    
    if (!response.ok) {
      throw new Error(`FRED API failed: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    // Parse CSV (simple approach)
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const lastLine = lines[lines.length - 1];
    const lastData = lastLine.split(',');
    
    const date = lastData[0];
    const priceCents = parseFloat(lastData[1]);
    const priceUSD = priceCents / 100;
    const priceRWF = Math.round(priceUSD * 1350);
    
    // Calculate Rwanda premium
    const rwandaExportUSD = 6.20;
    const rwandaExportRWF = rwandaExportUSD * 1350;
    const premium = ((rwandaExportUSD / priceUSD - 1) * 100).toFixed(1);
    
    // Return JSON
    res.status(200).json({
      success: true,
      data: {
        globalBenchmark: {
          date,
          usd: priceUSD,
          rwf: priceRWF,
          source: 'FRED (Other Mild Arabica)'
        },
        rwandaExport: {
          usd: rwandaExportUSD,
          rwf: rwandaExportRWF,
          source: 'NAEB (Rwanda Official)'
        },
        premium: `${premium}%`,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('FRED API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coffee prices'
    });
  }
}