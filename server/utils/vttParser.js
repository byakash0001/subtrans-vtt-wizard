/**
 * Parse VTT file content into structured subtitle blocks
 * Each block contains: number, startTime, endTime, englishText, referenceText
 */
function parseVTT(vttContent) {
  const lines = vttContent.split('\n').map(line => line.trim());
  const blocks = [];
  
  let i = 0;
  
  // Skip WEBVTT header and empty lines
  while (i < lines.length && (lines[i] === '' || lines[i].startsWith('WEBVTT'))) {
    i++;
  }
  
  while (i < lines.length) {
    // Skip empty lines
    if (lines[i] === '') {
      i++;
      continue;
    }
    
    // Parse block number
    const blockNumber = parseInt(lines[i]);
    if (isNaN(blockNumber)) {
      i++;
      continue;
    }
    i++;
    
    // Parse timestamp
    const timestampLine = lines[i];
    if (!timestampLine || !timestampLine.includes('-->')) {
      i++;
      continue;
    }
    
    const [startTime, endTime] = timestampLine.split('-->').map(t => t.trim());
    i++;
    
    // Parse subtitle lines (English + Reference language)
    const subtitleLines = [];
    while (i < lines.length && lines[i] !== '') {
      subtitleLines.push(lines[i]);
      i++;
    }
    
    if (subtitleLines.length >= 2) {
      blocks.push({
        number: blockNumber,
        startTime,
        endTime,
        englishText: subtitleLines[0],
        referenceText: subtitleLines[1],
        originalTimestamp: timestampLine
      });
    }
  }
  
  return blocks;
}

/**
 * Format subtitle blocks back into VTT format
 */
function formatVTT(blocks) {
  let vtt = 'WEBVTT\n\n';
  
  blocks.forEach(block => {
    vtt += `${block.number}\n`;
    vtt += `${block.originalTimestamp}\n`;
    vtt += `${block.translatedText}\n\n`;
  });
  
  return vtt;
}

/**
 * Split subtitle blocks into batches for API processing
 */
function createBatches(blocks, batchSize = 20) {
  const batches = [];
  for (let i = 0; i < blocks.length; i += batchSize) {
    batches.push(blocks.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Format a batch of subtitle blocks for OpenAI API
 */
function formatBatchForAPI(batch) {
  let formatted = 'WEBVTT\n\n';
  
  batch.forEach(block => {
    formatted += `${block.number}\n`;
    formatted += `${block.originalTimestamp}\n`;
    formatted += `${block.englishText}\n`;
    formatted += `${block.referenceText}\n\n`;
  });
  
  return formatted;
}

/**
 * Parse OpenAI response back into subtitle blocks
 */
function parseAPIResponse(response, originalBatch) {
  const lines = response.split('\n').map(line => line.trim());
  const translatedBlocks = [];
  
  let i = 0;
  
  // Skip WEBVTT header
  while (i < lines.length && (lines[i] === '' || lines[i].startsWith('WEBVTT'))) {
    i++;
  }
  
  let batchIndex = 0;
  
  while (i < lines.length && batchIndex < originalBatch.length) {
    // Skip empty lines
    if (lines[i] === '') {
      i++;
      continue;
    }
    
    // Parse block number
    const blockNumber = parseInt(lines[i]);
    if (isNaN(blockNumber)) {
      i++;
      continue;
    }
    i++;
    
    // Skip timestamp line (should match original)
    i++;
    
    // Get translated text
    const translatedText = lines[i] || '';
    i++;
    
    // Create translated block
    const originalBlock = originalBatch[batchIndex];
    if (originalBlock) {
      translatedBlocks.push({
        ...originalBlock,
        translatedText: translatedText
      });
    }
    
    batchIndex++;
  }
  
  return translatedBlocks;
}

module.exports = {
  parseVTT,
  formatVTT,
  createBatches,
  formatBatchForAPI,
  parseAPIResponse
};