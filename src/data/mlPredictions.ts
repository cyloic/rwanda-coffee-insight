// REAL ML PREDICTIONS from trained LSTM model
import mlData from './website_ml_data.json';
import next7Days from '../../deployment/next_7_days.json';

// Type for 7-day predictions
interface PricePrediction {
  date: string;
  priceUSD: number;
  priceRWF: number;
  confidence: number;
}

// Real price history from your model (90 days)
export const ML_PRICE_HISTORY = mlData.priceHistory;

// Real forecast from your model (30 days)
export const ML_PRICE_FORECAST = mlData.priceForecast;

// Next 7 days from LSTM (most accurate)
export const LSTM_7_DAY_PREDICTIONS: PricePrediction[] = next7Days;

// Model performance metrics
export const MODEL_INFO = mlData.modelInfo;

// Replace the fake generatePriceHistory with REAL data
export function generatePriceHistory() {
  return ML_PRICE_HISTORY.map(item => ({
    date: item.date,
    price: item.price
  }));
}

// Replace the fake generateForecast with REAL data
export function generateForecast(lastPrice: number) {
  return ML_PRICE_FORECAST.map(item => ({
    date: item.date,
    price: item.price,
    upperBand: item.price * 1.1,
    lowerBand: item.price * 0.9
  }));
}

// Export LSTM next-day prediction
export function getNextDayPrediction() {
  return LSTM_7_DAY_PREDICTIONS[0];
}

// Export 7-day LSTM predictions
export function get7DayPredictions() {
  return LSTM_7_DAY_PREDICTIONS;
}