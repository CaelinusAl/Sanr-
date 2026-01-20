"""
Test suite for CAELINUS AI GÖRSELİN module - Visual Analysis and Hologram Generation
Tests: /api/visual/analyze, /api/visual/generate, /api/visual/presets endpoints
"""

import pytest
import requests
import os
import base64
import time

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Create a simple test PNG image (1x1 pixel red)
def create_test_png():
    """Create a minimal valid PNG image for testing"""
    # Minimal 1x1 red PNG
    png_data = bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1 dimensions
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # 8-bit RGB
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,  # compressed data
        0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD,  
        0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,  # IEND chunk
        0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    return png_data


class TestVisualPresets:
    """Test /api/visual/presets endpoints"""
    
    def test_get_presets_success(self):
        """Test GET /api/visual/presets returns list of presets"""
        response = requests.get(f"{BASE_URL}/api/visual/presets")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one preset"
        
        # Verify preset structure
        preset = data[0]
        assert "id" in preset, "Preset should have id"
        assert "name_tr" in preset, "Preset should have name_tr"
        assert "name_en" in preset, "Preset should have name_en"
        assert "icon" in preset, "Preset should have icon"
        assert "style_prompt" in preset, "Preset should have style_prompt"
        
        print(f"SUCCESS: Found {len(data)} presets")
        for p in data:
            print(f"  - {p['id']}: {p['name_tr']}")
    
    def test_get_specific_preset(self):
        """Test GET /api/visual/presets/{preset_id}"""
        # First get all presets
        response = requests.get(f"{BASE_URL}/api/visual/presets")
        assert response.status_code == 200
        presets = response.json()
        
        if len(presets) > 0:
            preset_id = presets[0]["id"]
            response = requests.get(f"{BASE_URL}/api/visual/presets/{preset_id}")
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert data["id"] == preset_id, "Preset ID should match"
            print(f"SUCCESS: Retrieved preset {preset_id}")
    
    def test_get_nonexistent_preset(self):
        """Test GET /api/visual/presets/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/visual/presets/nonexistent-preset-id")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: 404 returned for nonexistent preset")


class TestVisualAnalyze:
    """Test /api/visual/analyze endpoint - Image analysis with SANRI"""
    
    def test_analyze_image_success(self):
        """Test POST /api/visual/analyze with valid image"""
        png_data = create_test_png()
        
        files = {
            'image': ('test.png', png_data, 'image/png')
        }
        data = {
            'context': 'Test image for analysis',
            'is_premium': 'false'
        }
        
        print("Sending image for analysis (this may take 20-30 seconds)...")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/api/visual/analyze",
            files=files,
            data=data,
            timeout=120
        )
        
        elapsed = time.time() - start_time
        print(f"Response received in {elapsed:.1f} seconds")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        result = response.json()
        
        # Check response schema
        assert "ok" in result, "Response should have 'ok' field"
        
        if result["ok"]:
            # Success response schema
            assert "analysis_text" in result, "Success response should have analysis_text"
            assert "seen" in result, "Success response should have 'seen'"
            assert "symbolic" in result, "Success response should have 'symbolic'"
            assert "questions" in result, "Success response should have 'questions'"
            assert "ritual" in result, "Success response should have 'ritual'"
            assert "meta" in result, "Success response should have 'meta'"
            
            # Verify meta structure
            meta = result["meta"]
            assert "model" in meta, "Meta should have model"
            assert "latency_ms" in meta, "Meta should have latency_ms"
            assert "request_id" in meta, "Meta should have request_id"
            
            print(f"SUCCESS: Image analysis completed")
            print(f"  - Model: {meta['model']}")
            print(f"  - Latency: {meta['latency_ms']}ms")
            print(f"  - Seen: {result['seen'][:100]}...")
            print(f"  - Questions count: {len(result['questions'])}")
        else:
            # Error response schema
            assert "error" in result, "Error response should have 'error' field"
            assert "code" in result["error"], "Error should have 'code'"
            assert "message" in result["error"], "Error should have 'message'"
            print(f"Analysis returned error: {result['error']}")
    
    def test_analyze_image_error_response_schema(self):
        """Test that error responses follow {ok: false, error: {code, message}} schema"""
        # Send invalid/empty request to trigger error
        response = requests.post(
            f"{BASE_URL}/api/visual/analyze",
            data={},
            timeout=30
        )
        
        # Should return error (422 for validation or 200 with ok=false)
        if response.status_code == 200:
            result = response.json()
            if not result.get("ok", True):
                assert "error" in result, "Error response should have 'error'"
                assert "code" in result["error"], "Error should have 'code'"
                assert "message" in result["error"], "Error should have 'message'"
                print(f"SUCCESS: Error schema verified - {result['error']['code']}")
        else:
            # FastAPI validation error
            print(f"Validation error returned: {response.status_code}")
            assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
    
    def test_analyze_image_with_context(self):
        """Test analysis with user-provided context"""
        png_data = create_test_png()
        
        files = {
            'image': ('test.png', png_data, 'image/png')
        }
        data = {
            'context': 'Bu rüyamdaki bir sahne',
            'is_premium': 'false'
        }
        
        print("Sending image with context for analysis...")
        response = requests.post(
            f"{BASE_URL}/api/visual/analyze",
            files=files,
            data=data,
            timeout=120
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        result = response.json()
        if result.get("ok"):
            print(f"SUCCESS: Analysis with context completed")
            print(f"  - Analysis ID: {result.get('analysis_id', 'N/A')}")


class TestVisualGenerate:
    """Test /api/visual/generate endpoint - Hologram generation"""
    
    def test_generate_hologram_success(self):
        """Test POST /api/visual/generate with valid request"""
        payload = {
            "intention": "kozmik bilinç ve dönüşüm",
            "preset_id": "moon-jellyfish",
            "aspect_ratio": "1:1",
            "num_images": 1,
            "show_prompt": True,
            "is_premium": False,
            "add_watermark": True
        }
        
        print("Generating hologram (this may take 30-60 seconds)...")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/api/visual/generate",
            json=payload,
            timeout=180
        )
        
        elapsed = time.time() - start_time
        print(f"Response received in {elapsed:.1f} seconds")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        result = response.json()
        
        # Verify response structure
        assert "images" in result, "Response should have 'images'"
        assert "generation_id" in result, "Response should have 'generation_id'"
        assert "timestamp" in result, "Response should have 'timestamp'"
        assert "caption" in result, "Response should have 'caption'"
        
        # Verify images
        assert isinstance(result["images"], list), "Images should be a list"
        assert len(result["images"]) >= 1, "Should have at least 1 image"
        
        # Verify image is valid base64
        try:
            img_bytes = base64.b64decode(result["images"][0])
            assert len(img_bytes) > 0, "Image should have content"
            print(f"SUCCESS: Generated {len(result['images'])} image(s)")
            print(f"  - Generation ID: {result['generation_id']}")
            print(f"  - Caption: {result['caption']}")
            if result.get("prompt_used"):
                print(f"  - Prompt length: {len(result['prompt_used'])} chars")
        except Exception as e:
            pytest.fail(f"Invalid base64 image: {e}")
    
    def test_generate_without_preset(self):
        """Test generation without preset_id (uses master prompt only)"""
        payload = {
            "intention": "iç huzur ve sessizlik",
            "aspect_ratio": "4:5",
            "num_images": 1,
            "is_premium": False
        }
        
        print("Generating hologram without preset...")
        response = requests.post(
            f"{BASE_URL}/api/visual/generate",
            json=payload,
            timeout=180
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        result = response.json()
        assert "images" in result
        assert len(result["images"]) >= 1
        print(f"SUCCESS: Generated image without preset")
    
    def test_generate_missing_intention(self):
        """Test generation fails without intention"""
        payload = {
            "preset_id": "moon-jellyfish",
            "aspect_ratio": "1:1"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/visual/generate",
            json=payload,
            timeout=30
        )
        
        # Should fail validation
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("SUCCESS: Validation error for missing intention")


class TestVisualHistory:
    """Test /api/visual/history endpoints"""
    
    def test_get_generation_history(self):
        """Test GET /api/visual/history/generations"""
        response = requests.get(f"{BASE_URL}/api/visual/history/generations")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"SUCCESS: Retrieved {len(data)} generation history records")
    
    def test_get_analysis_history(self):
        """Test GET /api/visual/history/analyses"""
        response = requests.get(f"{BASE_URL}/api/visual/history/analyses")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"SUCCESS: Retrieved {len(data)} analysis history records")


class TestVisualAnalytics:
    """Test /api/visual/admin/analytics endpoint"""
    
    def test_get_analytics(self):
        """Test GET /api/visual/admin/analytics"""
        response = requests.get(f"{BASE_URL}/api/visual/admin/analytics")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "total_generations" in data, "Should have total_generations"
        assert "total_analyses" in data, "Should have total_analyses"
        
        print(f"SUCCESS: Analytics retrieved")
        print(f"  - Total generations: {data['total_generations']}")
        print(f"  - Total analyses: {data['total_analyses']}")


# Quick connectivity test
class TestConnectivity:
    """Basic connectivity tests"""
    
    def test_api_reachable(self):
        """Test that API is reachable"""
        response = requests.get(f"{BASE_URL}/api/visual/presets", timeout=10)
        assert response.status_code == 200, f"API not reachable: {response.status_code}"
        print(f"SUCCESS: API reachable at {BASE_URL}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
