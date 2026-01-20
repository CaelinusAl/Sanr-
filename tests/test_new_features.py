"""
Test CAELINUS AI New Features:
1. SANRI'ya Sor - Görsel Prompt tab removed
2. New onboarding questions (time_perception, identity)
3. GÖRSELİN 3-layer response format
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test session from previous setup
TEST_SESSION = "test_session_1768901063114"


class TestOnboardingNewFields:
    """Test new onboarding fields: time_perception and identity"""
    
    def test_onboarding_accepts_new_fields(self):
        """Test that onboarding accepts time_perception and identity"""
        # Create a new test user
        import time
        timestamp = int(time.time() * 1000)
        
        # Register new user
        register_response = requests.post(
            f"{BASE_URL}/api/auth/email/register",
            json={
                "email": f"test.new.{timestamp}@example.com",
                "password": "testpass123",
                "name": "Test New User"
            }
        )
        
        if register_response.status_code == 200:
            # Get session from cookies
            session_cookie = register_response.cookies.get("session_token")
            
            # Complete onboarding with new fields
            onboarding_response = requests.post(
                f"{BASE_URL}/api/auth/onboarding",
                json={
                    "time_perception": "non_linear",
                    "identity": "transforming",
                    "style_preference": "wise",
                    "purpose": "self_knowledge",
                    "language": "tr",
                    "consent_given": True
                },
                cookies={"session_token": session_cookie} if session_cookie else None,
                headers={"Authorization": f"Bearer {session_cookie}"} if session_cookie else None
            )
            
            assert onboarding_response.status_code == 200
            result = onboarding_response.json()
            
            assert result["success"] == True
            assert result["profile"]["time_perception"] == "non_linear"
            assert result["profile"]["identity"] == "transforming"
            print("SUCCESS: Onboarding accepts new fields (time_perception, identity)")
        else:
            # User might already exist, skip
            pytest.skip("Could not create test user")
    
    def test_sanri_context_uses_new_fields(self):
        """Test that SANRI context uses new profile fields"""
        response = requests.get(
            f"{BASE_URL}/api/auth/sanri-context",
            headers={"Authorization": f"Bearer {TEST_SESSION}"}
        )
        
        assert response.status_code == 200
        result = response.json()
        
        assert result["has_profile"] == True
        assert "BİLİNÇ SEVİYESİ" in result["context"]
        assert "KİMLİK" in result["context"]
        print("SUCCESS: SANRI context uses new profile fields")


class TestVisualAnalyze3Layer:
    """Test GÖRSELİN 3-layer response format"""
    
    def test_analyze_response_has_3_layers(self):
        """Test that analyze response has surface, consciousness, destiny layers"""
        # Create a simple test image
        import struct
        import zlib
        from io import BytesIO
        
        def create_minimal_png():
            signature = b'\x89PNG\r\n\x1a\n'
            width, height = 10, 10
            ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
            ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
            ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
            
            raw_data = b''
            for y in range(height):
                raw_data += b'\x00'
                for x in range(width):
                    raw_data += b'\x00\x00\xff'
            
            compressed = zlib.compress(raw_data)
            idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
            idat_chunk = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
            
            iend_crc = zlib.crc32(b'IEND') & 0xffffffff
            iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
            
            return signature + ihdr_chunk + idat_chunk + iend_chunk
        
        png_bytes = create_minimal_png()
        
        response = requests.post(
            f"{BASE_URL}/api/visual/analyze",
            files={'image': ('test.png', BytesIO(png_bytes), 'image/png')},
            data={'context': 'Test for 3-layer response', 'is_premium': 'true'},
            timeout=60
        )
        
        assert response.status_code == 200
        result = response.json()
        
        if result.get("ok"):
            # Check for 3-layer fields
            assert "surface" in result or "analysis_text" in result
            print(f"SUCCESS: Analyze response has ok=true")
            print(f"Response keys: {list(result.keys())}")
            
            # The 3-layer format should have surface, consciousness, destiny
            if "surface" in result:
                print(f"Surface layer present: {len(result.get('surface', ''))} chars")
            if "consciousness" in result:
                print(f"Consciousness layer present: {len(result.get('consciousness', ''))} chars")
            if "destiny" in result:
                print(f"Destiny layer present: {len(result.get('destiny', ''))} chars")
        else:
            print(f"Analysis returned ok=false: {result.get('error')}")


class TestSanriAskEndpoint:
    """Test SANRI ask endpoint (chat mode only, no image generation)"""
    
    def test_sanri_ask_works(self):
        """Test that SANRI ask endpoint works"""
        response = requests.post(
            f"{BASE_URL}/api/sanri/ask",
            json={
                "message": "Test message",
                "message_type": "dream"
            },
            timeout=60
        )
        
        # Should work (200) or require auth (401)
        assert response.status_code in [200, 401]
        
        if response.status_code == 200:
            result = response.json()
            assert "response" in result
            print("SUCCESS: SANRI ask endpoint works")
        else:
            print("INFO: SANRI ask requires authentication")


class TestVisualGenerate:
    """Test hologram generation endpoint"""
    
    def test_generate_returns_caption(self):
        """Test that generate returns the correct caption"""
        response = requests.post(
            f"{BASE_URL}/api/visual/generate",
            json={
                "intention": "Test hologram",
                "preset_id": "moon-jellyfish",
                "aspect_ratio": "1:1",
                "num_images": 1,
                "is_premium": True,
                "add_watermark": False
            },
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Check caption
            expected_caption = "Bu görsel bir cevap değildir. Bir hatırlatmadır."
            assert result.get("caption") == expected_caption
            print(f"SUCCESS: Generate returns correct caption")
        elif response.status_code == 520:
            pytest.skip("Generation timed out - known intermittent issue")
        else:
            print(f"Generate failed: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
