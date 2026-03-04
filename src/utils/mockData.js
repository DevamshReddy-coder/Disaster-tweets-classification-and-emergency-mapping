import realData from '../data/tweets.json';

let globalIndex = 0;

export const generateMockTweet = () => {
  // Cycle through the real dataset instead of faking text
  if (globalIndex >= realData.length) {
    globalIndex = 0;
  }
  
  const original = realData[globalIndex];
  globalIndex++;

  return {
    ...original,
    id: Math.random().toString(36).substring(2, 10), // Ensure unique IDs for React keys
    timestamp: Date.now() - Math.floor(Math.random() * 5000), // make it look like it just came in
  };
};
