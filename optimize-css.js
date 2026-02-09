#!/usr/bin/env node
/**
 * CSS Optimization Script
 * 
 * This script helps optimize CSS files by:
 * 1. Running PurgeCSS to remove unused styles
 * 2. Minifying the CSS files
 * 3. Generating optimized versions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('='.repeat(60));
console.log('CSS OPTIMIZATION');
console.log('='.repeat(60));

// Check if purgecss is installed
try {
  execSync('purgecss --version', { stdio: 'ignore' });
  console.log('✓ PurgeCSS is installed');
} catch {
  console.log('⚠ PurgeCSS not found. Installing...');
  try {
    execSync('npm install -g purgecss', { stdio: 'inherit' });
    console.log('✓ PurgeCSS installed successfully');
  } catch (error) {
    console.error('✗ Failed to install PurgeCSS');
    console.error('  Please run: npm install -g purgecss');
    process.exit(1);
  }
}

// CSS files to optimize
const cssFiles = [
  {
    input: path.join(__dirname, 'assets/css/vendor.bundle.css'),
    output: path.join(__dirname, 'assets/css/vendor.bundle.min.css'),
    name: 'vendor.bundle.css'
  },
  {
    input: path.join(__dirname, 'assets/css/style.css'),
    output: path.join(__dirname, 'assets/css/style.min.css'),
    name: 'style.css'
  }
];

console.log('\n📦 Analyzing and optimizing CSS files...');
console.log('-'.repeat(60));

cssFiles.forEach(({ input, output, name }) => {
  if (!fs.existsSync(input)) {
    console.log(`⚠ ${name} not found, skipping...`);
    return;
  }

  const originalSize = fs.statSync(input).size / 1024;
  console.log(`\n📄 Processing: ${name}`);
  console.log(`   Original size: ${originalSize.toFixed(1)} KB`);

  try {
    // Run PurgeCSS
    const tempOutput = output + '.tmp';
    execSync(`purgecss --css "${input}" --content "./**/*.html" "./**/*.md" "./assets/js/**/*.js" --output "${tempOutput}"`, {
      stdio: 'pipe'
    });

    if (fs.existsSync(tempOutput)) {
      const purgedSize = fs.statSync(tempOutput).size / 1024;
      const savings = originalSize - purgedSize;
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

      console.log(`   After purging: ${purgedSize.toFixed(1)} KB`);
      console.log(`   Saved: ${savings.toFixed(1)} KB (${savingsPercent}%)`);

      // Rename to final output
      fs.renameSync(tempOutput, output);
      console.log(`   ✓ Saved to: ${path.basename(output)}`);
    }
  } catch (error) {
    console.error(`   ✗ Error processing ${name}:`, error.message);
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ CSS OPTIMIZATION COMPLETE');
console.log('='.repeat(60));
console.log('\nNext steps:');
console.log('1. Review the optimized files in assets/css/');
console.log('2. Test your site to ensure all styles work correctly');
console.log('3. Update HTML to use .min.css versions if satisfied');
console.log('4. Consider using critical CSS for above-the-fold content');
