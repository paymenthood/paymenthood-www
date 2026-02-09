/**
 * PurgeCSS Configuration
 * 
 * This configuration helps remove unused CSS to reduce file size.
 * 
 * To use:
 * 1. Install PurgeCSS: npm install -g purgecss
 * 2. Run: purgecss --config purgecss.config.js
 * 
 * This will analyze your HTML files and remove unused CSS classes,
 * potentially reducing CSS file size by 80-90%.
 */

module.exports = {
  content: [
    './**/*.html',
    './**/*.md',
    './assets/js/**/*.js',
    './_includes/**/*.html',
  ],
  css: [
    './assets/css/vendor.bundle.css',
    './assets/css/style.css'
  ],
  output: './assets/css/',
  
  // Safelist classes that are added dynamically via JavaScript
  safelist: {
    standard: [
      'animated',
      'fadeInUp',
      'fadeInDown',
      'fadeInLeft',
      'fadeInRight',
      'is-sticky',
      'is-shrink',
      'has-fixed',
      'menu-mobile',
      'active',
      'show',
      'open'
    ],
    deep: [
      /^data-/,
      /^animate/,
      /^fade/,
      /^slide/,
      /^owl-/,
      /^flex-/,
      /^menu-/,
      /^nav-/
    ],
    greedy: [
      /modal/,
      /dropdown/,
      /tooltip/,
      /popover/,
      /carousel/
    ]
  },
  
  // Keep these selectors even if not found in content
  keyframes: true,
  fontFace: true,
  variables: true,
  
  // Rejected selectors will be removed
  rejected: true,
  rejectedCss: './assets/css/rejected.css'
};
