"""
CAELINUS AI - SANRI VOICE TTS API Tests
Tests for TTS endpoints including SANRI and BOOK voice profiles
"""

import pytest
import requests
import os
import time

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTTSStatus:
    """TTS Status endpoint tests - /api/tts/status"""
    
    def test_tts_status_returns_200(self):
        """Test that /api/tts/status returns 200"""
        response = requests.get(f"{BASE_URL}/api/tts/status")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
    def test_tts_status_returns_voice_profiles(self):
        """Test that status returns SANRI and BOOK voice profiles"""
        response = requests.get(f"{BASE_URL}/api/tts/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "active"
        assert "voice_profiles" in data
        
        # Verify SANRI profile
        assert "sanri" in data["voice_profiles"]
        sanri = data["voice_profiles"]["sanri"]
        assert sanri["voice"] == "nova"
        assert sanri["speed"] == 0.78
        assert "description" in sanri
        
        # Verify BOOK profile
        assert "book" in data["voice_profiles"]
        book = data["voice_profiles"]["book"]
        assert book["voice"] == "shimmer"
        assert book["speed"] == 0.85
        assert "description" in book
        
    def test_tts_status_returns_features(self):
        """Test that status returns feature flags"""
        response = requests.get(f"{BASE_URL}/api/tts/status")
        data = response.json()
        
        assert "features" in data
        features = data["features"]
        assert features.get("turkish_support") == True
        assert features.get("hd_quality") == True
        assert features.get("ritual_voice") == True
        assert features.get("book_voice") == True


class TestTTSProfiles:
    """TTS Profiles endpoint tests - /api/tts/profiles"""
    
    def test_profiles_returns_200(self):
        """Test that /api/tts/profiles returns 200"""
        response = requests.get(f"{BASE_URL}/api/tts/profiles")
        assert response.status_code == 200
        
    def test_profiles_returns_sanri_details(self):
        """Test SANRI profile details"""
        response = requests.get(f"{BASE_URL}/api/tts/profiles")
        data = response.json()
        
        assert "sanri" in data
        sanri = data["sanri"]
        
        # Verify SANRI config
        assert sanri["voice"] == "nova"
        assert sanri["model"] == "tts-1-hd"
        assert sanri["speed"] == 0.78
        assert "use_cases" in sanri
        assert "Premium ritüeller" in sanri["use_cases"]
        assert sanri["turkish_name"] == "SANRI SESİ"
        
    def test_profiles_returns_book_details(self):
        """Test BOOK profile details"""
        response = requests.get(f"{BASE_URL}/api/tts/profiles")
        data = response.json()
        
        assert "book" in data
        book = data["book"]
        
        # Verify BOOK config
        assert book["voice"] == "shimmer"
        assert book["model"] == "tts-1-hd"
        assert book["speed"] == 0.85
        assert "use_cases" in book
        assert "Kitap okumaları" in book["use_cases"]
        assert book["turkish_name"] == "CAELINUS KİTAP SESİ"


class TestTTSVoices:
    """TTS Voices endpoint tests - /api/tts/voices"""
    
    def test_voices_returns_200(self):
        """Test that /api/tts/voices returns 200"""
        response = requests.get(f"{BASE_URL}/api/tts/voices")
        assert response.status_code == 200
        
    def test_voices_returns_profiles_and_available_voices(self):
        """Test voices endpoint returns profiles and available voices"""
        response = requests.get(f"{BASE_URL}/api/tts/voices")
        data = response.json()
        
        assert "profiles" in data
        assert "sanri" in data["profiles"]
        assert "book" in data["profiles"]
        
        assert "available_voices" in data
        voice_ids = [v["id"] for v in data["available_voices"]]
        assert "nova" in voice_ids
        assert "shimmer" in voice_ids
        
        assert "models" in data
        model_ids = [m["id"] for m in data["models"]]
        assert "tts-1-hd" in model_ids


class TestTTSRitualPlay:
    """TTS Ritual Play endpoint tests - /api/tts/ritual/play"""
    
    def test_ritual_play_with_valid_ritual_id(self):
        """Test ritual play with zihin-sessizligi ritual"""
        response = requests.post(
            f"{BASE_URL}/api/tts/ritual/play",
            json={
                "ritual_id": "zihin-sessizligi",
                "language": "tr"
            },
            timeout=30  # TTS generation can take time
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["ritual_id"] == "zihin-sessizligi"
        assert "audio_url" in data
        assert data["audio_url"].startswith("data:audio/mpeg;base64,")
        assert "full_text" in data
        assert len(data["full_text"]) > 0
        assert data["voice_profile"] == "sanri"
        
    def test_ritual_play_returns_voice_config(self):
        """Test that ritual play returns SANRI voice config"""
        response = requests.post(
            f"{BASE_URL}/api/tts/ritual/play",
            json={
                "ritual_id": "zihin-sessizligi",
                "language": "tr"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "voice_config" in data
        voice_config = data["voice_config"]
        assert voice_config["voice"] == "nova"
        assert voice_config["speed"] == 0.78
        
    def test_ritual_play_with_english_language(self):
        """Test ritual play with English language"""
        response = requests.post(
            f"{BASE_URL}/api/tts/ritual/play",
            json={
                "ritual_id": "zihin-sessizligi",
                "language": "en"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "full_text" in data
        # English text should contain English words
        assert "breath" in data["full_text"].lower() or "mind" in data["full_text"].lower() or "now" in data["full_text"].lower()
        
    def test_ritual_play_with_invalid_ritual_id(self):
        """Test ritual play with non-existent ritual ID"""
        response = requests.post(
            f"{BASE_URL}/api/tts/ritual/play",
            json={
                "ritual_id": "non-existent-ritual",
                "language": "tr"
            }
        )
        
        assert response.status_code == 404


class TestTTSGenerate:
    """TTS Generate endpoint tests - /api/tts/generate"""
    
    def test_generate_with_sanri_profile(self):
        """Test TTS generation with SANRI voice profile"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "Şimdi kendinle temas et.",
                "voice_profile": "sanri"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "audio_url" in data
        assert data["audio_url"].startswith("data:audio/mpeg;base64,")
        assert data["voice"] == "nova"
        assert data["voice_profile"] == "sanri"
        
    def test_generate_with_book_profile(self):
        """Test TTS generation with BOOK voice profile"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "Bilinç, düşüncenin ötesinde var olan bir alandır.",
                "voice_profile": "book"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "audio_url" in data
        assert data["voice"] == "shimmer"
        assert data["voice_profile"] == "book"
        
    def test_generate_with_custom_voice(self):
        """Test TTS generation with custom voice override"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "Test mesajı.",
                "voice_profile": "custom",
                "voice": "alloy"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["voice"] == "alloy"
        
    def test_generate_with_empty_text_fails(self):
        """Test that empty text returns validation error"""
        response = requests.post(
            f"{BASE_URL}/api/tts/generate",
            json={
                "text": "",
                "voice_profile": "sanri"
            }
        )
        
        # Should fail validation
        assert response.status_code in [400, 422]


class TestPremiumRitualEndpoints:
    """Premium Ritual endpoints tests"""
    
    def test_get_ritual_lines(self):
        """Test getting ritual lines"""
        response = requests.get(f"{BASE_URL}/api/premium-ritual/lines")
        assert response.status_code == 200
        
        data = response.json()
        # Response is object with 'lines' key
        assert "lines" in data
        lines = data["lines"]
        assert isinstance(lines, list)
        assert len(lines) >= 3  # At least 3 lines
        
        # Check line structure
        line_ids = [line["id"] for line in lines]
        assert "zihin" in line_ids
        assert "bilinc" in line_ids
        assert "yaratim" in line_ids
        
    def test_get_rituals(self):
        """Test getting rituals list"""
        response = requests.get(f"{BASE_URL}/api/premium-ritual/rituals")
        assert response.status_code == 200
        
        data = response.json()
        # Response is object with 'grouped' key containing rituals by line
        assert "grouped" in data
        grouped = data["grouped"]
        
        # Should have zihin-sessizligi ritual in zihin group
        assert "zihin" in grouped
        ritual_ids = [r["id"] for r in grouped["zihin"]]
        assert "zihin-sessizligi" in ritual_ids
        
    def test_get_ritual_by_id(self):
        """Test getting specific ritual by ID"""
        response = requests.get(f"{BASE_URL}/api/premium-ritual/rituals/zihin-sessizligi")
        assert response.status_code == 200
        
        data = response.json()
        # Response is object with 'ritual' key
        assert "ritual" in data
        ritual = data["ritual"]
        assert ritual["id"] == "zihin-sessizligi"
        assert "steps" in ritual
        assert len(ritual["steps"]) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
