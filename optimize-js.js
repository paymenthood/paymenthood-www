#!/usr/bin/env node
/**
 * JavaScript Bundle Optimization Script
 * 
 * This script extracts only the essential JavaScript libraries needed
 * for above-the-fold functionality and creates an optimized bundle.
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('JAVASCRIPT BUNDLE OPTIMIZATION');
console.log('='.repeat(60));

const bundlePath = path.join(__dirname, 'assets/js/jquery.bundle.js');
const bundleContent = fs.readFileSync(bundlePath, 'utf8');

// Extract individual libraries by their header comments
const libraries = {
    jquery: {
        start: '/*! jQuery v',
        end: '/*! Bootstrap',
        essential: true,
        description: 'jQuery Core'
    },
    bootstrap: {
        start: '/*! Bootstrap',
        end: '/*! Owl Carousel',
        essential: true,
        description: 'Bootstrap JS'
    },
    waypoint: {
        start: '/*! Waypoint',
        end: '/*! jquery easing',
        essential: true,
        description: 'Waypoint (scroll animations)'
    },
    owlCarousel: {
        start: '/*! Owl Carousel',
        end: '/*! Final Countdown',
        essential: false,
        description: 'Owl Carousel (testimonials/carousel)'
    },
    flexslider: {
        start: '/*! jQuery FlexSlider',
        end: '//# sourceMappingURL',
        essential: false,
        description: 'FlexSlider (image sliders)'
    }
};

console.log('\n📦 Analyzing jquery.bundle.js...\n');

// Create essential bundle
let essentialBundle = '';
let deferredBundle = '';

Object.entries(libraries).forEach(([name, config]) => {
    const startIdx = bundleContent.indexOf(config.start);
    const endIdx = bundleContent.indexOf(config.end, startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
        const code = bundleContent.substring(startIdx, endIdx);
        const size = (Buffer.byteLength(code, 'utf8') / 1024).toFixed(1);
        
        console.log(`${config.essential ? '✓' : '○'} ${name.padEnd(15)} ${size.padStart(6)} KB - ${config.description}`);
        
        if (config.essential) {
            essentialBundle += code + '\n';
        } else {
            deferredBundle += code + '\n';
        }
    }
});

// Write essential bundle (loads immediately)
const essentialPath = path.join(__dirname, 'assets/js/jquery.essential.js');
fs.writeFileSync(essentialPath, essentialBundle);
const essentialSize = (fs.statSync(essentialPath).size / 1024).toFixed(1);

// Write deferred bundle (loads on interaction or idle)
const deferredPath = path.join(__dirname, 'assets/js/jquery.deferred.js');
fs.writeFileSync(deferredPath, deferredBundle);
const deferredSize = (fs.statSync(deferredPath).size / 1024).toFixed(1);

const originalSize = (fs.statSync(bundlePath).size / 1024).toFixed(1);

console.log('\n' + '='.repeat(60));
console.log('✅ OPTIMIZATION COMPLETE');
console.log('='.repeat(60));
console.log(`\nOriginal Bundle:     ${originalSize} KB`);
console.log(`Essential (loads now):  ${essentialSize} KB`);
console.log(`Deferred (loads later): ${deferredSize} KB`);
console.log(`\nInitial savings: ${(originalSize - essentialSize).toFixed(1)} KB (${((1 - essentialSize/originalSize) * 100).toFixed(1)}%)`);

console.log('\n📝 Next Steps:');
console.log('1. Update footer.html to use jquery.essential.js');
console.log('2. Add lazy loading script for jquery.deferred.js');
console.log('3. Test all interactive features');
