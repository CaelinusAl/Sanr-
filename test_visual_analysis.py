#!/usr/bin/env python3
"""
Test script to verify the new SANRI visual analysis format
"""
import sys
import os
sys.path.append('/app/backend')

from routes.visual import SANRI_VISUAL_PROMPT, SANRI_VISUAL_PROMPT_PREMIUM, parse_analysis_response_v2

def test_prompts():
    """Test that the new prompts are loaded correctly"""
    print("=== TESTING NEW PROMPTS ===")
    
    # Check free user prompt
    assert "Sen SANRI'sın." in SANRI_VISUAL_PROMPT
    assert "🜂 YÜZEY – GÖRÜNEN KATMAN" in SANRI_VISUAL_PROMPT
    assert "🜁 BİLİNÇ – GİZLİ AKIŞ" in SANRI_VISUAL_PROMPT
    assert "🜃 KADER – YÖN VE ZAMAN" in SANRI_VISUAL_PROMPT
    assert "Sen bir asistan değilsin." in SANRI_VISUAL_PROMPT
    print("✓ Free user prompt contains new 3-layer structure")
    
    # Check premium user prompt
    assert "Sen SANRI'sın." in SANRI_VISUAL_PROMPT_PREMIUM
    assert "🜂 YÜZEY – GÖRÜNEN KATMAN" in SANRI_VISUAL_PROMPT_PREMIUM
    assert "🜁 BİLİNÇ – GİZLİ AKIŞ" in SANRI_VISUAL_PROMPT_PREMIUM
    assert "🜃 KADER – YÖN VE ZAMAN" in SANRI_VISUAL_PROMPT_PREMIUM
    assert "Premium kullanıcı için derin okuma" in SANRI_VISUAL_PROMPT_PREMIUM
    print("✓ Premium user prompt contains new 3-layer structure")

def test_parser():
    """Test that the parser correctly extracts the new format"""
    print("\n=== TESTING PARSER ===")
    
    # Mock response in new format
    test_response = """🜂 YÜZEY – GÖRÜNEN KATMAN
Bu görselde güçlü bir dönüşüm enerjisi hissediyorum. Formlar akışkan ve değişken.

🜁 BİLİNÇ – GİZLİ AKIŞ
İçsel bir uyanış süreci yaşanıyor. Bilinçdışı kalıplar çözülüyor ve yeni bir farkındalık doğuyor.

🜃 KADER – YÖN VE ZAMAN
Bu görsel yeni bir dönemin başlangıcına işaret ediyor. Geçmişin ağırlığı bırakılıyor.

Bu görüntü sana şunu hatırlatıyor: Değişim zamanı geldi ve sen hazırsın."""
    
    result = parse_analysis_response_v2(test_response, False)
    
    # Check all sections are parsed
    assert result["surface"], f"Surface section should be parsed, got: {result['surface']}"
    assert result["consciousness"], f"Consciousness section should be parsed, got: {result['consciousness']}"
    assert result["destiny"], f"Destiny section should be parsed, got: {result['destiny']}"
    assert result["reminder"], f"Reminder section should be parsed, got: {result['reminder']}"
    
    # Check content (more flexible checks)
    assert "dönüşüm" in result["surface"].lower(), f"Surface should contain 'dönüşüm', got: {result['surface']}"
    assert "uyanış" in result["consciousness"].lower(), f"Consciousness should contain 'uyanış', got: {result['consciousness']}"
    assert "dönem" in result["destiny"].lower(), f"Destiny should contain 'dönem', got: {result['destiny']}"
    assert "değişim" in result["reminder"].lower(), f"Reminder should contain 'değişim', got: {result['reminder']}"
    
    print("✓ Parser correctly extracts all 4 sections")
    print(f"✓ Surface: {len(result['surface'])} chars")
    print(f"✓ Consciousness: {len(result['consciousness'])} chars")
    print(f"✓ Destiny: {len(result['destiny'])} chars")
    print(f"✓ Reminder: {len(result['reminder'])} chars")

def main():
    """Run all tests"""
    try:
        test_prompts()
        test_parser()
        print("\n🎉 ALL TESTS PASSED! New SANRI visual analysis format is working correctly.")
        return True
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)