// This API endpoint is for Vercel deployment only
// It requires @vercel/node and @tensorflow/tfjs-node which are not installed locally
// The frontend uses pre-computed predictions from /src/data/mlPredictions.ts instead

export default async function handler(req: any, res: any) {
  try {
    res.status(400).json({
      error: 'This endpoint is for Vercel deployment only.',
      message: 'Use the frontend prediction data instead.'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request'
    });
  }
}