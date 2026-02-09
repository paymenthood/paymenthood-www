#!/usr/bin/env python3
"""
Image optimization script to convert PNG to WebP and optimize existing WebP images
"""
from PIL import Image
import os

def convert_png_to_webp(png_path, quality=85):
    """Convert PNG image to WebP format with specified quality"""
    webp_path = png_path.rsplit('.', 1)[0] + '.webp'
    
    if not os.path.exists(png_path):
        print(f"❌ File not found: {png_path}")
        return None
    
    try:
        with Image.open(png_path) as img:
            # Convert RGBA to RGB if necessary (for better compression)
            if img.mode == 'RGBA':
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
                img = background
            
            # Save as WebP
            img.save(webp_path, 'WebP', quality=quality, method=6)
            
            original_size = os.path.getsize(png_path) / 1024
            new_size = os.path.getsize(webp_path) / 1024
            savings = original_size - new_size
            savings_percent = (savings / original_size) * 100
            
            print(f"✓ Converted: {os.path.basename(png_path)}")
            print(f"  Original: {original_size:.1f} KiB → WebP: {new_size:.1f} KiB")
            print(f"  Saved: {savings:.1f} KiB ({savings_percent:.1f}%)")
            
            return webp_path
    except Exception as e:
        print(f"❌ Error converting {png_path}: {e}")
        return None

def optimize_webp(webp_path, quality=80):
    """Re-compress WebP image with higher compression"""
    if not os.path.exists(webp_path):
        print(f"❌ File not found: {webp_path}")
        return None
    
    try:
        original_size = os.path.getsize(webp_path) / 1024
        temp_path = webp_path + '.tmp'
        
        with Image.open(webp_path) as img:
            img.save(temp_path, 'WebP', quality=quality, method=6)
        
        new_size = os.path.getsize(temp_path) / 1024
        
        # Only replace if we achieved significant savings
        if new_size < original_size * 0.95:
            os.replace(temp_path, webp_path)
            savings = original_size - new_size
            savings_percent = (savings / original_size) * 100
            
            print(f"✓ Optimized: {os.path.basename(webp_path)}")
            print(f"  Before: {original_size:.1f} KiB → After: {new_size:.1f} KiB")
            print(f"  Saved: {savings:.1f} KiB ({savings_percent:.1f}%)")
        else:
            os.remove(temp_path)
            print(f"⚠ {os.path.basename(webp_path)} already well optimized")
        
        return webp_path
    except Exception as e:
        print(f"❌ Error optimizing {webp_path}: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return None

def main():
    base_path = r"c:\Repositories\startup\paymenthood-www\assets\images"
    
    print("=" * 60)
    print("IMAGE OPTIMIZATION")
    print("=" * 60)
    
    # Convert PNG to WebP
    print("\n📦 Converting PNG to WebP...")
    print("-" * 60)
    
    png_files = [
        (os.path.join(base_path, "home", "stand-girl.png"), 85),
        (os.path.join(base_path, "home", "globe.png"), 85),
        (os.path.join(base_path, "logo.png"), 90),
        (os.path.join(base_path, "logo2x.png"), 90),
    ]
    
    for png_file, quality in png_files:
        convert_png_to_webp(png_file, quality)
        print()
    
    # Optimize existing WebP files
    print("\n🔧 Optimizing existing WebP files...")
    print("-" * 60)
    
    webp_files = [
        (os.path.join(base_path, "home", "banner-bg-large.webp"), 82),
        (os.path.join(base_path, "home", "paymenthood-chart.webp"), 80),
        (os.path.join(base_path, "home", "banner-bg.webp"), 82),
    ]
    
    for webp_file, quality in webp_files:
        optimize_webp(webp_file, quality)
        print()
    
    print("=" * 60)
    print("✅ OPTIMIZATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
