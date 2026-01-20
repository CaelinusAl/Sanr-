"""
CAELINUS AI - User Authentication System Tests
Tests for: Email/Password Auth, Onboarding, SANRI Context, Admin Users
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_PASSWORD = "caelinus2026"
TEST_USER_EMAIL = f"test_user_{uuid.uuid4().hex[:8]}@caelinus.ai"
TEST_USER_PASSWORD = "test123456"
TEST_USER_NAME = "Test User"

# Session storage for authenticated tests
session_token = None
user_id = None


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root: {data['message']}")


class TestEmailRegistration:
    """Email/Password registration tests"""
    
    def test_register_new_user(self):
        """Test new user registration with email/password"""
        global session_token, user_id
        
        response = requests.post(
            f"{BASE_URL}/api/auth/email/register",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "name": TEST_USER_NAME
            }
        )
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert data.get("success") == True
        assert data.get("is_new_user") == True
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        assert data["user"]["name"] == TEST_USER_NAME
        assert "user_id" in data["user"]
        
        user_id = data["user"]["user_id"]
        
        # Get session token from cookies
        session_token = response.cookies.get("session_token")
        
        print(f"✓ User registered: {TEST_USER_EMAIL}, user_id: {user_id}")
    
    def test_register_duplicate_email(self):
        """Test registration with existing email should fail"""
        response = requests.post(
            f"{BASE_URL}/api/auth/email/register",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "name": "Duplicate User"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Duplicate email rejected: {data['detail']}")
    
    def test_register_invalid_email(self):
        """Test registration with invalid email format"""
        response = requests.post(
            f"{BASE_URL}/api/auth/email/register",
            json={
                "email": "invalid-email",
                "password": TEST_USER_PASSWORD,
                "name": "Invalid User"
            }
        )
        
        assert response.status_code == 422  # Validation error
        print("✓ Invalid email format rejected")


class TestEmailLogin:
    """Email/Password login tests"""
    
    def test_login_success(self):
        """Test successful login with correct credentials"""
        global session_token
        
        response = requests.post(
            f"{BASE_URL}/api/auth/email/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert data.get("success") == True
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        
        # Update session token
        session_token = response.cookies.get("session_token")
        
        print(f"✓ Login successful for: {TEST_USER_EMAIL}")
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/email/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong password rejected: {data['detail']}")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/email/login",
            json={
                "email": "nonexistent@caelinus.ai",
                "password": TEST_USER_PASSWORD
            }
        )
        
        assert response.status_code == 401
        print("✓ Non-existent user rejected")


class TestAuthenticatedEndpoints:
    """Tests for authenticated endpoints"""
    
    def test_get_current_user(self):
        """Test /api/auth/me endpoint"""
        global session_token
        
        # First login to get fresh token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/email/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
        )
        session_token = login_response.cookies.get("session_token")
        
        # Test with Authorization header
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        assert response.status_code == 200, f"Get user failed: {response.text}"
        data = response.json()
        
        assert "user_id" in data
        assert data["email"] == TEST_USER_EMAIL
        assert "has_profile" in data
        
        print(f"✓ Get current user: {data['email']}, has_profile: {data['has_profile']}")
    
    def test_get_current_user_no_auth(self):
        """Test /api/auth/me without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 401
        print("✓ Unauthenticated request rejected")


class TestOnboarding:
    """Bilinç profili onboarding tests"""
    
    def test_complete_onboarding(self):
        """Test completing onboarding with consciousness profile"""
        global session_token
        
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/auth/email/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
        )
        session_token = login_response.cookies.get("session_token")
        
        # Complete onboarding
        response = requests.post(
            f"{BASE_URL}/api/auth/onboarding",
            headers={"Authorization": f"Bearer {session_token}"},
            json={
                "reason": "self_discovery",
                "dominant_emotion": "curious",
                "style_preference": "wise",
                "purpose": "all",
                "language": "tr",
                "consent_given": True
            }
        )
        
        assert response.status_code == 200, f"Onboarding failed: {response.text}"
        data = response.json()
        
        assert data.get("success") == True
        assert "profile" in data
        assert data["profile"]["reason"] == "self_discovery"
        assert data["profile"]["dominant_emotion"] == "curious"
        assert data["profile"]["style_preference"] == "wise"
        assert data["profile"]["purpose"] == "all"
        assert data["profile"]["consent_given"] == True
        
        print(f"✓ Onboarding completed with profile: {data['profile']['reason']}")
    
    def test_onboarding_without_auth(self):
        """Test onboarding without authentication"""
        response = requests.post(
            f"{BASE_URL}/api/auth/onboarding",
            json={
                "reason": "dreams",
                "dominant_emotion": "seeking",
                "style_preference": "soft",
                "purpose": "dreams",
                "language": "tr",
                "consent_given": True
            }
        )
        
        assert response.status_code == 401
        print("✓ Unauthenticated onboarding rejected")
    
    def test_onboarding_invalid_values(self):
        """Test onboarding with invalid enum values"""
        global session_token
        
        response = requests.post(
            f"{BASE_URL}/api/auth/onboarding",
            headers={"Authorization": f"Bearer {session_token}"},
            json={
                "reason": "invalid_reason",
                "dominant_emotion": "curious",
                "style_preference": "wise",
                "purpose": "all",
                "language": "tr",
                "consent_given": True
            }
        )
        
        assert response.status_code == 422  # Validation error
        print("✓ Invalid enum values rejected")


class TestSanriContext:
    """SANRI context and welcome message tests"""
    
    def test_get_sanri_context(self):
        """Test getting SANRI context for authenticated user"""
        global session_token
        
        response = requests.get(
            f"{BASE_URL}/api/auth/sanri-context",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "context" in data
        assert "has_profile" in data
        
        if data["has_profile"]:
            assert len(data["context"]) > 0
            assert "USER CONSCIOUSNESS PROFILE" in data["context"]
            print(f"✓ SANRI context generated, length: {len(data['context'])}")
        else:
            print("✓ SANRI context returned (no profile)")
    
    def test_get_sanri_context_no_auth(self):
        """Test SANRI context without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/sanri-context")
        
        assert response.status_code == 200
        data = response.json()
        assert data["has_profile"] == False
        assert data["context"] == ""
        print("✓ SANRI context for unauthenticated user: empty")
    
    def test_get_sanri_welcome_tr(self):
        """Test SANRI welcome message in Turkish"""
        response = requests.get(f"{BASE_URL}/api/auth/sanri-welcome")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "language" in data
        assert len(data["message"]) > 0
        
        print(f"✓ SANRI welcome ({data['language']}): {data['message'][:50]}...")


class TestUserProfile:
    """User profile management tests"""
    
    def test_get_user_profile(self):
        """Test getting user profile"""
        global session_token
        
        response = requests.get(
            f"{BASE_URL}/api/user/profile",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "user" in data
        assert "profile" in data
        assert "stats" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        
        print(f"✓ User profile retrieved: {data['user']['email']}")
    
    def test_update_user_profile(self):
        """Test updating user profile"""
        global session_token
        
        response = requests.put(
            f"{BASE_URL}/api/user/profile",
            headers={"Authorization": f"Bearer {session_token}"},
            json={
                "style_preference": "direct",
                "language": "en"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert data["profile"]["style_preference"] == "direct"
        assert data["profile"]["language"] == "en"
        
        print(f"✓ Profile updated: style={data['profile']['style_preference']}, lang={data['profile']['language']}")
    
    def test_get_profile_no_auth(self):
        """Test getting profile without authentication"""
        response = requests.get(f"{BASE_URL}/api/user/profile")
        
        assert response.status_code == 401
        print("✓ Unauthenticated profile request rejected")


class TestGDPRExport:
    """GDPR/KVKK data export tests"""
    
    def test_export_user_data(self):
        """Test exporting user data"""
        global session_token
        
        response = requests.get(
            f"{BASE_URL}/api/user/export",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "export_date" in data
        assert "user" in data
        assert "consciousness_profile" in data
        assert "activity_summary" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        
        print(f"✓ Data export successful, keys: {list(data.keys())}")
    
    def test_export_no_auth(self):
        """Test export without authentication"""
        response = requests.get(f"{BASE_URL}/api/user/export")
        
        assert response.status_code == 401
        print("✓ Unauthenticated export rejected")


class TestAdminDashboard:
    """Admin user management tests"""
    
    def test_admin_dashboard(self):
        """Test admin users dashboard"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users/dashboard",
            headers={"X-Admin-Token": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "users" in data
        assert "profiles" in data
        assert "activity" in data
        assert "errors" in data
        
        assert "total" in data["users"]
        assert "premium" in data["users"]
        assert "by_auth" in data["users"]
        
        print(f"✓ Admin dashboard: {data['users']['total']} total users, {data['users']['premium']} premium")
    
    def test_admin_dashboard_no_auth(self):
        """Test admin dashboard without authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/users/dashboard")
        
        assert response.status_code == 401
        print("✓ Unauthenticated admin request rejected")
    
    def test_admin_dashboard_wrong_token(self):
        """Test admin dashboard with wrong token"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users/dashboard",
            headers={"X-Admin-Token": "wrongpassword"}
        )
        
        assert response.status_code == 401
        print("✓ Wrong admin token rejected")


class TestAdminUserList:
    """Admin user list tests"""
    
    def test_list_users(self):
        """Test listing users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users/list",
            headers={"X-Admin-Token": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "users" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert "pages" in data
        
        print(f"✓ User list: {data['total']} users, page {data['page']}/{data['pages']}")
    
    def test_list_users_with_search(self):
        """Test listing users with search filter"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users/list?search=test",
            headers={"X-Admin-Token": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "users" in data
        print(f"✓ User search: found {len(data['users'])} users matching 'test'")
    
    def test_list_users_pagination(self):
        """Test user list pagination"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users/list?page=1&limit=5",
            headers={"X-Admin-Token": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["limit"] == 5
        assert len(data["users"]) <= 5
        
        print(f"✓ Pagination: page {data['page']}, limit {data['limit']}, got {len(data['users'])} users")


class TestAdminPremiumManagement:
    """Admin premium management tests"""
    
    def test_set_user_premium(self):
        """Test setting user premium status"""
        global user_id
        
        response = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}/premium",
            headers={"X-Admin-Token": ADMIN_PASSWORD},
            json={
                "is_premium": True,
                "premium_plan": "monthly",
                "premium_expiry": "2026-12-31T23:59:59Z"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert data.get("is_premium") == True
        
        print(f"✓ User {user_id} set to premium")
    
    def test_remove_user_premium(self):
        """Test removing user premium status"""
        global user_id
        
        response = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}/premium",
            headers={"X-Admin-Token": ADMIN_PASSWORD},
            json={
                "is_premium": False
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        assert data.get("is_premium") == False
        
        print(f"✓ User {user_id} premium removed")
    
    def test_set_premium_nonexistent_user(self):
        """Test setting premium for non-existent user"""
        response = requests.put(
            f"{BASE_URL}/api/admin/users/nonexistent_user_id/premium",
            headers={"X-Admin-Token": ADMIN_PASSWORD},
            json={"is_premium": True}
        )
        
        assert response.status_code == 404
        print("✓ Non-existent user premium update rejected")


class TestLogout:
    """Logout tests"""
    
    def test_logout(self):
        """Test logout endpoint"""
        global session_token
        
        response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("success") == True
        print("✓ Logout successful")
    
    def test_access_after_logout(self):
        """Test accessing protected endpoint after logout"""
        global session_token
        
        # Try to access /me with old token
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        # Should be unauthorized after logout
        assert response.status_code == 401
        print("✓ Access denied after logout")


class TestEventTracking:
    """Event tracking tests"""
    
    def test_track_event(self):
        """Test tracking user event"""
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/auth/email/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
        )
        token = login_response.cookies.get("session_token")
        
        response = requests.post(
            f"{BASE_URL}/api/user/event",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "event_type": "page_view",
                "event_value": {"page": "/test"}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        print("✓ Event tracked successfully")
    
    def test_track_event_anonymous(self):
        """Test tracking event without authentication"""
        response = requests.post(
            f"{BASE_URL}/api/user/event",
            json={
                "event_type": "page_view",
                "event_value": {"page": "/anonymous"}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        print("✓ Anonymous event tracked")


# Cleanup test - run last
class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_user(self):
        """Delete test user via admin endpoint"""
        global user_id
        
        if not user_id:
            pytest.skip("No user_id to cleanup")
        
        response = requests.delete(
            f"{BASE_URL}/api/admin/users/{user_id}",
            headers={"X-Admin-Token": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        print(f"✓ Test user {user_id} deleted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
