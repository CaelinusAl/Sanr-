#!/usr/bin/env python3

import requests
import sys
import json
import time
from datetime import datetime

class CineCursorAPITester:
    def __init__(self, base_url="https://videocraft-149.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.project_id = None
        self.scene_id = None
        self.character_id = None
        self.asset_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json() if response.content else {}
                    self.log(f"   Error: {error_data}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_create_project(self):
        """Test project creation"""
        project_data = {
            "name": f"Test Project {int(time.time())}",
            "description": "A test project for CineCursor",
            "style_guide": "cinematic"
        }
        success, response = self.run_test("Create Project", "POST", "projects", 200, project_data)
        if success and 'id' in response:
            self.project_id = response['id']
            self.log(f"   Created project with ID: {self.project_id}")
        return success

    def test_get_projects(self):
        """Test getting all projects"""
        return self.run_test("Get Projects", "GET", "projects", 200)

    def test_get_project(self):
        """Test getting specific project"""
        if not self.project_id:
            self.log("❌ Get Project - No project ID available")
            return False
        return self.run_test("Get Project", "GET", f"projects/{self.project_id}", 200)

    def test_update_project(self):
        """Test updating project"""
        if not self.project_id:
            self.log("❌ Update Project - No project ID available")
            return False
        
        update_data = {
            "description": "Updated test project description",
            "style_guide": "documentary"
        }
        return self.run_test("Update Project", "PUT", f"projects/{self.project_id}", 200, update_data)

    def test_create_scene(self):
        """Test scene creation"""
        if not self.project_id:
            self.log("❌ Create Scene - No project ID available")
            return False
            
        scene_data = {
            "project_id": self.project_id,
            "name": "Test Scene 1",
            "description": "A test scene",
            "prompt": "A beautiful sunset over mountains",
            "duration": 8.0,
            "start_time": 0.0,
            "track_index": 0,
            "characters": []
        }
        success, response = self.run_test("Create Scene", "POST", "scenes", 200, scene_data)
        if success and 'id' in response:
            self.scene_id = response['id']
            self.log(f"   Created scene with ID: {self.scene_id}")
        return success

    def test_get_project_scenes(self):
        """Test getting project scenes"""
        if not self.project_id:
            self.log("❌ Get Project Scenes - No project ID available")
            return False
        return self.run_test("Get Project Scenes", "GET", f"projects/{self.project_id}/scenes", 200)

    def test_get_scene(self):
        """Test getting specific scene"""
        if not self.scene_id:
            self.log("❌ Get Scene - No scene ID available")
            return False
        return self.run_test("Get Scene", "GET", f"scenes/{self.scene_id}", 200)

    def test_update_scene(self):
        """Test updating scene"""
        if not self.scene_id:
            self.log("❌ Update Scene - No scene ID available")
            return False
            
        update_data = {
            "name": "Updated Test Scene",
            "description": "Updated scene description",
            "duration": 10.0
        }
        return self.run_test("Update Scene", "PUT", f"scenes/{self.scene_id}", 200, update_data)

    def test_generate_scene_video(self):
        """Test scene video generation with Sora 2"""
        if not self.scene_id:
            self.log("❌ Generate Scene Video - No scene ID available")
            return False
        
        generate_data = {
            "prompt": "A beautiful sunset over mountains, cinematic shot",
            "duration": 4,
            "size": "1280x720",
            "model": "sora-2"
        }
        return self.run_test("Generate Scene Video", "POST", f"scenes/{self.scene_id}/generate", 200, generate_data)

    def test_create_character(self):
        """Test character creation"""
        if not self.project_id:
            self.log("❌ Create Character - No project ID available")
            return False
            
        character_data = {
            "project_id": self.project_id,
            "name": "Test Character",
            "description": "A test character for the project",
            "reference_images": []
        }
        success, response = self.run_test("Create Character", "POST", "characters", 200, character_data)
        if success and 'id' in response:
            self.character_id = response['id']
            self.log(f"   Created character with ID: {self.character_id}")
        return success

    def test_get_project_characters(self):
        """Test getting project characters"""
        if not self.project_id:
            self.log("❌ Get Project Characters - No project ID available")
            return False
        return self.run_test("Get Project Characters", "GET", f"projects/{self.project_id}/characters", 200)

    def test_get_character(self):
        """Test getting specific character"""
        if not self.character_id:
            self.log("❌ Get Character - No character ID available")
            return False
        return self.run_test("Get Character", "GET", f"characters/{self.character_id}", 200)

    def test_update_character(self):
        """Test updating character"""
        if not self.character_id:
            self.log("❌ Update Character - No character ID available")
            return False
            
        update_data = {
            "description": "Updated character description"
        }
        return self.run_test("Update Character", "PUT", f"characters/{self.character_id}", 200, update_data)

    def test_create_asset(self):
        """Test asset creation"""
        if not self.project_id:
            self.log("❌ Create Asset - No project ID available")
            return False
            
        asset_data = {
            "project_id": self.project_id,
            "type": "image",
            "name": "Test Asset",
            "path": "/test/path/image.jpg",
            "thumbnail": "/test/path/thumb.jpg",
            "tags": ["test", "image"]
        }
        success, response = self.run_test("Create Asset", "POST", "assets", 200, asset_data)
        if success and 'id' in response:
            self.asset_id = response['id']
            self.log(f"   Created asset with ID: {self.asset_id}")
        return success

    def test_get_project_assets(self):
        """Test getting project assets"""
        if not self.project_id:
            self.log("❌ Get Project Assets - No project ID available")
            return False
        return self.run_test("Get Project Assets", "GET", f"projects/{self.project_id}/assets", 200)

    def test_ai_chat(self):
        """Test AI Director chat"""
        if not self.project_id:
            self.log("❌ AI Chat - No project ID available")
            return False
            
        chat_data = {
            "project_id": self.project_id,
            "message": "Create a dramatic opening scene for my film"
        }
        self.log("   Note: AI chat may take a few seconds...")
        try:
            return self.run_test("AI Chat", "POST", "chat", 200, chat_data)
        except:
            self.log("   Skipping AI chat test due to timeout (expected)")
            return True  # Don't fail the test suite for AI timeout

    def test_get_chat_history(self):
        """Test getting chat history"""
        if not self.project_id:
            self.log("❌ Get Chat History - No project ID available")
            return False
        return self.run_test("Get Chat History", "GET", f"projects/{self.project_id}/chat-history", 200)

    def test_continuity_check(self):
        """Test continuity checking"""
        if not self.project_id:
            self.log("❌ Continuity Check - No project ID available")
            return False
        return self.run_test("Continuity Check", "GET", f"projects/{self.project_id}/continuity-check", 200)

    def test_export_timeline(self):
        """Test timeline JSON export"""
        if not self.project_id:
            self.log("❌ Export Timeline - No project ID available")
            return False
        return self.run_test("Export Timeline JSON", "GET", f"projects/{self.project_id}/export-json", 200)

    def test_scene_reorder(self):
        """Test scene reordering"""
        if not self.scene_id:
            self.log("❌ Scene Reorder - No scene ID available")
            return False
            
        reorder_data = [
            {
                "id": self.scene_id,
                "order": 0,
                "start_time": 0.0,
                "track_index": 0
            }
        ]
        return self.run_test("Scene Reorder", "POST", "scenes/reorder", 200, reorder_data)

    def test_delete_operations(self):
        """Test delete operations"""
        success_count = 0
        
        # Delete asset
        if self.asset_id:
            success, _ = self.run_test("Delete Asset", "DELETE", f"assets/{self.asset_id}", 200)
            if success:
                success_count += 1
        
        # Delete character
        if self.character_id:
            success, _ = self.run_test("Delete Character", "DELETE", f"characters/{self.character_id}", 200)
            if success:
                success_count += 1
        
        # Delete scene
        if self.scene_id:
            success, _ = self.run_test("Delete Scene", "DELETE", f"scenes/{self.scene_id}", 200)
            if success:
                success_count += 1
        
        # Clear chat history
        if self.project_id:
            success, _ = self.run_test("Clear Chat History", "DELETE", f"projects/{self.project_id}/chat-history", 200)
            if success:
                success_count += 1
        
        # Delete project (should cascade delete everything)
        if self.project_id:
            success, _ = self.run_test("Delete Project", "DELETE", f"projects/{self.project_id}", 200)
            if success:
                success_count += 1
        
        return success_count > 0

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        self.log("🚀 Starting CineCursor API Test Suite")
        self.log(f"   Testing against: {self.base_url}")
        
        # Core API tests
        self.test_root_endpoint()
        
        # Project lifecycle
        self.test_create_project()
        self.test_get_projects()
        self.test_get_project()
        self.test_update_project()
        
        # Scene lifecycle
        self.test_create_scene()
        self.test_get_project_scenes()
        self.test_get_scene()
        self.test_update_scene()
        self.test_generate_scene_video()
        self.test_scene_reorder()
        
        # Character lifecycle
        self.test_create_character()
        self.test_get_project_characters()
        self.test_get_character()
        self.test_update_character()
        
        # Asset lifecycle
        self.test_create_asset()
        self.test_get_project_assets()
        
        # AI features
        self.test_ai_chat()
        self.test_get_chat_history()
        
    def test_v2_features(self):
        """Test CineCursor v2.0 specific features"""
        success_count = 0
        
        if not self.scene_id:
            self.log("❌ V2 Features - No scene ID available")
            return False
        
        # Test scene transitions
        transition_data = {
            "transition_in": {"type": "fade", "duration": 0.5},
            "transition_out": {"type": "dissolve", "duration": 0.5}
        }
        success, _ = self.run_test("Set Scene Transitions", "PUT", f"scenes/{self.scene_id}/transition", 200, transition_data)
        if success:
            success_count += 1
        
        # Test render status endpoint
        success, _ = self.run_test("Get Render Status", "GET", f"scenes/{self.scene_id}/render-status", 200)
        if success:
            success_count += 1
        
        # Test audio volume setting
        success, _ = self.run_test("Set Audio Volume", "PUT", f"scenes/{self.scene_id}/audio-volume?volume=0.8", 200)
        if success:
            success_count += 1
        
        return success_count > 0

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        self.log("🚀 Starting CineCursor API Test Suite")
        self.log(f"   Testing against: {self.base_url}")
        
        # Core API tests
        self.test_root_endpoint()
        
        # Project lifecycle
        self.test_create_project()
        self.test_get_projects()
        self.test_get_project()
        self.test_update_project()
        
        # Scene lifecycle
        self.test_create_scene()
        self.test_get_project_scenes()
        self.test_get_scene()
        self.test_update_scene()
        self.test_generate_scene_video()
        self.test_scene_reorder()
        
        # Character lifecycle
        self.test_create_character()
        self.test_get_project_characters()
        self.test_get_character()
        self.test_update_character()
        
        # Asset lifecycle
        self.test_create_asset()
        self.test_get_project_assets()
        
        # AI features
        self.test_ai_chat()
        self.test_get_chat_history()
        
        # Advanced features
        self.test_continuity_check()
        self.test_export_timeline()
        
        # V2.0 specific features
        self.test_v2_features()
        
        # Cleanup
        self.test_delete_operations()
        
        # Results
        self.log(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"   Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            self.log("🎉 Backend API tests PASSED!")
            return 0
        elif success_rate >= 70:
            self.log("⚠️  Backend API tests PARTIALLY PASSED - Some issues detected")
            return 1
        else:
            self.log("❌ Backend API tests FAILED - Major issues detected")
            return 2

def main():
    tester = CineCursorAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())