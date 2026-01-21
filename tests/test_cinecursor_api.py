"""
CineCursor API Tests - Testing video generation, render status, and core features
Focus: Sora 2 video generation with valid resolutions, render-status polling, scene creation
"""
import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Valid Sora 2 resolutions
VALID_RESOLUTIONS = ["1280x720", "1792x1024", "1024x1792", "1024x1024"]
INVALID_RESOLUTIONS = ["1920x1080", "3840x2160", "640x480"]

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def test_project(api_client):
    """Create a test project for scene tests"""
    response = api_client.post(f"{BASE_URL}/api/projects", json={
        "name": f"TEST_Project_{uuid.uuid4().hex[:8]}",
        "description": "Test project for API testing",
        "style_guide": "cinematic"
    })
    assert response.status_code == 200
    project = response.json()
    yield project
    # Cleanup
    api_client.delete(f"{BASE_URL}/api/projects/{project['id']}")

@pytest.fixture(scope="module")
def test_scene(api_client, test_project):
    """Create a test scene for video generation tests"""
    response = api_client.post(f"{BASE_URL}/api/scenes", json={
        "project_id": test_project["id"],
        "name": f"TEST_Scene_{uuid.uuid4().hex[:8]}",
        "description": "Test scene for video generation",
        "prompt": "A beautiful sunset over the ocean with waves crashing on the shore",
        "duration": 5.0
    })
    assert response.status_code == 200
    scene = response.json()
    yield scene
    # Cleanup handled by project deletion


class TestAPIHealth:
    """Test API health and basic connectivity"""
    
    def test_api_root(self, api_client):
        """Test API root endpoint returns correct info"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert "sora2" in data["features"]
        print(f"✓ API is operational with features: {data['features']}")


class TestProjectCRUD:
    """Test project CRUD operations"""
    
    def test_create_project(self, api_client):
        """Test creating a new project"""
        project_name = f"TEST_Project_{uuid.uuid4().hex[:8]}"
        response = api_client.post(f"{BASE_URL}/api/projects", json={
            "name": project_name,
            "description": "Test project",
            "style_guide": "cinematic"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == project_name
        assert "id" in data
        print(f"✓ Created project: {data['id']}")
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/projects/{data['id']}")
    
    def test_get_projects(self, api_client):
        """Test listing all projects"""
        response = api_client.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} projects")
    
    def test_get_project_by_id(self, api_client, test_project):
        """Test getting a specific project"""
        response = api_client.get(f"{BASE_URL}/api/projects/{test_project['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_project["id"]
        print(f"✓ Retrieved project: {data['name']}")


class TestSceneCRUD:
    """Test scene CRUD operations"""
    
    def test_create_scene(self, api_client, test_project):
        """Test creating a new scene"""
        scene_name = f"TEST_Scene_{uuid.uuid4().hex[:8]}"
        response = api_client.post(f"{BASE_URL}/api/scenes", json={
            "project_id": test_project["id"],
            "name": scene_name,
            "description": "Test scene",
            "prompt": "A cinematic shot of a city skyline at night",
            "duration": 8.0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == scene_name
        assert data["project_id"] == test_project["id"]
        assert "id" in data
        print(f"✓ Created scene: {data['id']}")
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/scenes/{data['id']}")
    
    def test_get_project_scenes(self, api_client, test_project, test_scene):
        """Test getting scenes for a project"""
        response = api_client.get(f"{BASE_URL}/api/projects/{test_project['id']}/scenes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        print(f"✓ Retrieved {len(data)} scenes for project")
    
    def test_get_scene_by_id(self, api_client, test_scene):
        """Test getting a specific scene"""
        response = api_client.get(f"{BASE_URL}/api/scenes/{test_scene['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_scene["id"]
        print(f"✓ Retrieved scene: {data['name']}")
    
    def test_update_scene(self, api_client, test_scene):
        """Test updating a scene"""
        new_name = f"TEST_Updated_Scene_{uuid.uuid4().hex[:8]}"
        response = api_client.put(f"{BASE_URL}/api/scenes/{test_scene['id']}", json={
            "name": new_name,
            "description": "Updated description"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == new_name
        print(f"✓ Updated scene to: {data['name']}")


class TestRenderStatus:
    """Test render status endpoint - critical for video generation polling"""
    
    def test_render_status_unknown_scene(self, api_client):
        """Test render status for non-existent scene returns unknown"""
        fake_scene_id = str(uuid.uuid4())
        response = api_client.get(f"{BASE_URL}/api/scenes/{fake_scene_id}/render-status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unknown"
        print(f"✓ Render status for unknown scene returns 'unknown'")
    
    def test_render_status_draft_scene(self, api_client, test_scene):
        """Test render status for draft scene"""
        response = api_client.get(f"{BASE_URL}/api/scenes/{test_scene['id']}/render-status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "progress" in data
        print(f"✓ Render status for draft scene: status={data['status']}, progress={data['progress']}")
    
    def test_render_status_existing_video(self, api_client):
        """Test render status for scene with existing video (from previous test)"""
        # Use the known scene ID from the main agent's test
        known_scene_id = "dcdf4d1b-ef43-474b-a43f-671e644f61bd"
        response = api_client.get(f"{BASE_URL}/api/scenes/{known_scene_id}/render-status")
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Render status for known scene: status={data.get('status')}, progress={data.get('progress')}")


class TestVideoGeneration:
    """Test video generation with Sora 2 - validates resolution handling"""
    
    def test_generate_video_valid_resolution_1280x720(self, api_client, test_scene):
        """Test video generation request with valid HD resolution"""
        response = api_client.post(f"{BASE_URL}/api/scenes/{test_scene['id']}/generate", json={
            "prompt": "A beautiful sunset over the ocean",
            "duration": 4,
            "size": "1280x720",
            "model": "sora-2"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "generating"
        assert data["scene_id"] == test_scene["id"]
        print(f"✓ Video generation started with 1280x720 resolution")
        
        # Wait a moment and check status
        time.sleep(2)
        status_response = api_client.get(f"{BASE_URL}/api/scenes/{test_scene['id']}/render-status")
        assert status_response.status_code == 200
        status_data = status_response.json()
        print(f"  Status after 2s: {status_data.get('status')}, progress: {status_data.get('progress')}")
    
    def test_generate_video_valid_resolution_1792x1024(self, api_client, test_project):
        """Test video generation with widescreen resolution"""
        # Create a new scene for this test
        scene_response = api_client.post(f"{BASE_URL}/api/scenes", json={
            "project_id": test_project["id"],
            "name": f"TEST_Widescreen_{uuid.uuid4().hex[:8]}",
            "prompt": "A cinematic landscape shot",
            "duration": 4.0
        })
        assert scene_response.status_code == 200
        scene = scene_response.json()
        
        response = api_client.post(f"{BASE_URL}/api/scenes/{scene['id']}/generate", json={
            "prompt": "A cinematic landscape shot with mountains",
            "duration": 4,
            "size": "1792x1024",
            "model": "sora-2"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "generating"
        print(f"✓ Video generation started with 1792x1024 (widescreen) resolution")
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/scenes/{scene['id']}")
    
    def test_generate_video_valid_resolution_square(self, api_client, test_project):
        """Test video generation with square resolution"""
        scene_response = api_client.post(f"{BASE_URL}/api/scenes", json={
            "project_id": test_project["id"],
            "name": f"TEST_Square_{uuid.uuid4().hex[:8]}",
            "prompt": "A square format video",
            "duration": 4.0
        })
        assert scene_response.status_code == 200
        scene = scene_response.json()
        
        response = api_client.post(f"{BASE_URL}/api/scenes/{scene['id']}/generate", json={
            "prompt": "A square format video of nature",
            "duration": 4,
            "size": "1024x1024",
            "model": "sora-2"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "generating"
        print(f"✓ Video generation started with 1024x1024 (square) resolution")
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/scenes/{scene['id']}")
    
    def test_generate_video_missing_prompt(self, api_client, test_project):
        """Test video generation fails without prompt"""
        scene_response = api_client.post(f"{BASE_URL}/api/scenes", json={
            "project_id": test_project["id"],
            "name": f"TEST_NoPrompt_{uuid.uuid4().hex[:8]}",
            "prompt": "",  # Empty prompt
            "duration": 4.0
        })
        assert scene_response.status_code == 200
        scene = scene_response.json()
        
        response = api_client.post(f"{BASE_URL}/api/scenes/{scene['id']}/generate", json={
            "prompt": "",  # Empty prompt
            "duration": 4,
            "size": "1280x720",
            "model": "sora-2"
        })
        # Should return 400 for missing prompt
        assert response.status_code == 400
        print(f"✓ Video generation correctly rejected empty prompt")
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/scenes/{scene['id']}")


class TestAIDirectorChat:
    """Test AI Director chat functionality"""
    
    def test_chat_send_message(self, api_client, test_project):
        """Test sending a message to AI Director"""
        response = api_client.post(f"{BASE_URL}/api/chat", json={
            "project_id": test_project["id"],
            "message": "Hello, I want to create a short video about nature"
        }, timeout=60)  # AI responses can take time
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert len(data["message"]) > 0
        print(f"✓ AI Director responded with {len(data['message'])} characters")
        if data.get("scene_plan"):
            print(f"  Scene plan suggested: {data['scene_plan'].get('name', 'unnamed')}")
    
    def test_chat_history(self, api_client, test_project):
        """Test retrieving chat history"""
        response = api_client.get(f"{BASE_URL}/api/projects/{test_project['id']}/chat-history")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} chat messages")
    
    def test_clear_chat_history(self, api_client, test_project):
        """Test clearing chat history"""
        response = api_client.delete(f"{BASE_URL}/api/projects/{test_project['id']}/chat-history")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "cleared"
        print(f"✓ Chat history cleared")


class TestCharacterCRUD:
    """Test character CRUD operations"""
    
    def test_create_character(self, api_client, test_project):
        """Test creating a character"""
        char_name = f"TEST_Character_{uuid.uuid4().hex[:8]}"
        response = api_client.post(f"{BASE_URL}/api/characters", json={
            "project_id": test_project["id"],
            "name": char_name,
            "description": "A test character for video production"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == char_name
        print(f"✓ Created character: {data['name']}")
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/characters/{data['id']}")
    
    def test_get_project_characters(self, api_client, test_project):
        """Test getting characters for a project"""
        response = api_client.get(f"{BASE_URL}/api/projects/{test_project['id']}/characters")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} characters")


class TestExportFeatures:
    """Test export and timeline features"""
    
    def test_export_timeline_json(self, api_client, test_project):
        """Test exporting timeline as JSON"""
        response = api_client.get(f"{BASE_URL}/api/projects/{test_project['id']}/export-json")
        assert response.status_code == 200
        data = response.json()
        assert "project" in data
        assert "scenes" in data
        assert "total_duration" in data
        print(f"✓ Exported timeline JSON with {len(data['scenes'])} scenes")
    
    def test_continuity_check(self, api_client, test_project):
        """Test continuity check endpoint"""
        response = api_client.get(f"{BASE_URL}/api/projects/{test_project['id']}/continuity-check")
        assert response.status_code == 200
        data = response.json()
        assert "project_id" in data
        assert "total_issues" in data
        assert "issues" in data
        print(f"✓ Continuity check found {data['total_issues']} issues")


class TestVideoServing:
    """Test video and thumbnail serving"""
    
    def test_video_not_found(self, api_client):
        """Test video endpoint returns 404 for non-existent video"""
        fake_scene_id = str(uuid.uuid4())
        response = api_client.get(f"{BASE_URL}/api/videos/{fake_scene_id}")
        assert response.status_code == 404
        print(f"✓ Video endpoint correctly returns 404 for non-existent video")
    
    def test_thumbnail_not_found(self, api_client):
        """Test thumbnail endpoint returns 404 for non-existent thumbnail"""
        fake_scene_id = str(uuid.uuid4())
        response = api_client.get(f"{BASE_URL}/api/thumbnails/{fake_scene_id}")
        assert response.status_code == 404
        print(f"✓ Thumbnail endpoint correctly returns 404 for non-existent thumbnail")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
