/**
 * Parse VTT file content into structured subtitle blocks
 * For single-language files: Each block contains: number, start, end, text
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
    
    const [start, end] = timestampLine.split('-->').map(t => t.trim());
    i++;
    
    // Parse subtitle text (single line for each language file)
    const text = lines[i] || '';
    i++;
    
    blocks.push({
      number: blockNumber,
      start,
      end,
      text,
      originalTimestamp: timestampLine
    });
    
    // Skip any remaining lines until next block or end
    while (i < lines.length && lines[i] !== '' && isNaN(parseInt(lines[i]))) {
      i++;
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
    vtt += `${block.start} --> ${block.end}\n`;
    vtt += `${block.text}\n\n`;
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
 * Format a batch of subtitle blocks for OpenAI API with dual-language support
 */
function formatBatchForAPI(batch) {
  let formatted = 'WEBVTT\n\n';
  
  batch.forEach(block => {
    formatted += `${block.number}\n`;
    formatted += `${block.start} --> ${block.end}\n`;
    formatted += `${block.text}\n`;
    if (block.referenceText) {
      formatted += `${block.referenceText}\n`;
    }
    formatted += '\n';
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
        text: translatedText
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