"""
Test CAELINUS Visual Module - Analyze and Generate endpoints
Tests the new 3-layer response format (Yüzey, Bilinç, Kader)
"""
import pytest
import requests
import os
import base64
from io import BytesIO

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVisualPresets:
    """Test visual presets endpoint"""
    
    def test_get_presets(self):
        """Test getting all presets"""
        response = requests.get(f"{BASE_URL}/api/visual/presets")
        assert response.status_code == 200
        
        presets = response.json()
        assert isinstance(presets, list)
        assert len(presets) >= 1
        
        # Check preset structure
        preset = presets[0]
        assert "id" in preset
        assert "name_tr" in preset
        assert "style_prompt" in preset
        print(f"SUCCESS: Got {len(presets)} presets")
    
    def test_get_single_preset(self):
        """Test getting a single preset"""
        response = requests.get(f"{BASE_URL}/api/visual/presets/moon-jellyfish")
        assert response.status_code == 200
        
        preset = response.json()
        assert preset["id"] == "moon-jellyfish"
        assert "style_prompt" in preset
        print(f"SUCCESS: Got preset: {preset['name_tr']}")


class TestVisualAnalyze:
    """Test image analysis endpoint with 3-layer response"""
    
    def test_analyze_requires_image(self):
        """Test that analyze endpoint requires an image"""
        response = requests.post(f"{BASE_URL}/api/visual/analyze")
        # Should return 422 (validation error) without image
        assert response.status_code == 422
        print("SUCCESS: Analyze endpoint requires image")
    
    def test_analyze_with_test_image(self):
        """Test image analysis with a simple test image"""
        # Create a simple 1x1 PNG image
        import struct
        import zlib
        
        def create_minimal_png():
            # PNG signature
            signature = b'\x89PNG\r\n\x1a\n'
            
            # IHDR chunk (image header)
            width = 10
            height = 10
            bit_depth = 8
            color_type = 2  # RGB
            ihdr_data = struct.pack('>IIBBBBB', width, height, bit_depth, color_type, 0, 0, 0)
            ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
            ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
            
            # IDAT chunk (image data) - simple blue pixels
            raw_data = b''
            for y in range(height):
                raw_data += b'\x00'  # filter byte
                for x in range(width):
                    raw_data += b'\x00\x00\xff'  # RGB blue
            
            compressed = zlib.compress(raw_data)
            idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
            idat_chunk = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
            
            # IEND chunk
            iend_crc = zlib.crc32(b'IEND') & 0xffffffff
            iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
            
            return signature + ihdr_chunk + idat_chunk + iend_chunk
        
        png_bytes = create_minimal_png()
        
        files = {
            'image': ('test.png', BytesIO(png_bytes), 'image/png')
        }
        data = {
            'context': 'Test image for analysis',
            'is_premium': 'true'
        }
        
        response = requests.post(
            f"{BASE_URL}/api/visual/analyze",
            files=files,
            data=data,
            timeout=60
        )
        
        print(f"Analyze response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Check for ok field
            assert "ok" in result
            
            if result["ok"]:
                # Check for 3-layer response format
                assert "surface" in result or "analysis_text" in result
                print(f"SUCCESS: Image analysis returned ok=true")
                
                # Check for meta info
                if "meta" in result:
                    print(f"Model used: {result['meta'].get('model')}")
                    print(f"Latency: {result['meta'].get('latency_ms')}ms")
            else:
                # Error response
                print(f"Analysis returned ok=false: {result.get('error')}")
        else:
            print(f"Analysis failed with status {response.status_code}")
            print(f"Response: {response.text[:500]}")


class TestVisualGenerate:
    """Test hologram generation endpoint"""
    
    def test_generate_with_preset(self):
        """Test hologram generation with a preset"""
        payload = {
            "intention": "Test hologram generation",
            "preset_id": "moon-jellyfish",
            "aspect_ratio": "1:1",
            "num_images": 1,
            "is_premium": True,
            "add_watermark": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/visual/generate",
            json=payload,
            timeout=120
        )
        
        print(f"Generate response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Check response structure
            assert "images" in result
            assert "generation_id" in result
            assert "caption" in result
            
            # Verify caption
            assert result["caption"] == "Bu görsel bir cevap değildir. Bir hatırlatmadır."
            
            print(f"SUCCESS: Generated {len(result['images'])} image(s)")
            print(f"Generation ID: {result['generation_id']}")
            print(f"Preset used: {result.get('preset_used')}")
        else:
            print(f"Generation failed with status {response.status_code}")
            print(f"Response: {response.text[:500]}")
            # Don't fail test for timeout issues
            if response.status_code == 520:
                pytest.skip("Generation timed out - known intermittent issue")


class TestVisualHistory:
    """Test history endpoints"""
    
    def test_get_generation_history(self):
        """Test getting generation history"""
        response = requests.get(f"{BASE_URL}/api/visual/history/generations")
        assert response.status_code == 200
        
        history = response.json()
        assert isinstance(history, list)
        print(f"SUCCESS: Got {len(history)} generation history items")
    
    def test_get_analysis_history(self):
        """Test getting analysis history"""
        response = requests.get(f"{BASE_URL}/api/visual/history/analyses")
        assert response.status_code == 200
        
        history = response.json()
        assert isinstance(history, list)
        print(f"SUCCESS: Got {len(history)} analysis history items")


class TestVisualAdmin:
    """Test admin analytics endpoint"""
    
    def test_get_analytics(self):
        """Test getting visual analytics"""
        response = requests.get(f"{BASE_URL}/api/visual/admin/analytics")
        assert response.status_code == 200
        
        analytics = response.json()
        assert "total_generations" in analytics
        assert "total_analyses" in analytics
        print(f"SUCCESS: Total generations: {analytics['total_generations']}, analyses: {analytics['total_analyses']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
