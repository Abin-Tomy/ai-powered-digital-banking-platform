#!/usr/bin/env python3
"""
API Testing Script for AI-Powered Digital Banking Platform
Tests all implemented API endpoints for functionality
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

class APITester:
    def __init__(self):
        self.token = None
        self.session = requests.Session()
        self.results = []

    def log_test(self, name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {name}")
        if details:
            print(f"   └─ {details}")
        self.results.append({
            'test': name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })

    def test_public_endpoints(self):
        """Test endpoints that don't require authentication"""
        print("\n🔓 Testing Public Endpoints")
        
        # Loan Types
        try:
            response = self.session.get(f"{BASE_URL}/loans/types/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Count: {len(data) if data else 0}"
            self.log_test("GET /loans/types/", success, details)
        except Exception as e:
            self.log_test("GET /loans/types/", False, str(e))

        # Credit Card Types
        try:
            response = self.session.get(f"{BASE_URL}/credit-cards/types/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Count: {len(data) if data else 0}"
            self.log_test("GET /credit-cards/types/", success, details)
        except Exception as e:
            self.log_test("GET /credit-cards/types/", False, str(e))

        # Bill Payment Categories
        try:
            response = self.session.get(f"{BASE_URL}/bill-payments/categories/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Count: {len(data) if data else 0}"
            self.log_test("GET /bill-payments/categories/", success, details)
        except Exception as e:
            self.log_test("GET /bill-payments/categories/", False, str(e))

        # Billers
        try:
            response = self.session.get(f"{BASE_URL}/bill-payments/billers/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Count: {len(data) if data else 0}"
            self.log_test("GET /bill-payments/billers/", success, details)
        except Exception as e:
            self.log_test("GET /bill-payments/billers/", False, str(e))

    def test_authentication(self):
        """Test user authentication"""
        print("\n🔐 Testing Authentication")
        
        # Login
        try:
            login_data = {
                "email": "test@example.com",
                "password": "testpass123"
            }
            response = self.session.post(f"{BASE_URL}/auth/login/", json=login_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.token = data.get('access')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.token}'
                })
                details = "Login successful, token received"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("POST /auth/login/", success, details)
        except Exception as e:
            self.log_test("POST /auth/login/", False, str(e))

    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.token:
            print("\n⚠️ Skipping authenticated endpoints - no token available")
            return
            
        print("\n🔒 Testing Authenticated Endpoints")
        
        # User Accounts
        try:
            response = self.session.get(f"{BASE_URL}/accounts/my/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Accounts: {len(data) if data else 0}"
            self.log_test("GET /accounts/my/", success, details)
        except Exception as e:
            self.log_test("GET /accounts/my/", False, str(e))

        # Loan Applications
        try:
            response = self.session.get(f"{BASE_URL}/loans/applications/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Applications: {len(data) if data else 0}"
            self.log_test("GET /loans/applications/", success, details)
        except Exception as e:
            self.log_test("GET /loans/applications/", False, str(e))

        # User Loans
        try:
            response = self.session.get(f"{BASE_URL}/loans/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Loans: {len(data) if data else 0}"
            self.log_test("GET /loans/", success, details)
        except Exception as e:
            self.log_test("GET /loans/", False, str(e))

        # Credit Card Applications
        try:
            response = self.session.get(f"{BASE_URL}/credit-cards/applications/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Applications: {len(data) if data else 0}"
            self.log_test("GET /credit-cards/applications/", success, details)
        except Exception as e:
            self.log_test("GET /credit-cards/applications/", False, str(e))

        # User Credit Cards
        try:
            response = self.session.get(f"{BASE_URL}/credit-cards/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Cards: {len(data) if data else 0}"
            self.log_test("GET /credit-cards/", success, details)
        except Exception as e:
            self.log_test("GET /credit-cards/", False, str(e))

        # Saved Billers
        try:
            response = self.session.get(f"{BASE_URL}/bill-payments/saved-billers/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Saved Billers: {len(data) if data else 0}"
            self.log_test("GET /bill-payments/saved-billers/", success, details)
        except Exception as e:
            self.log_test("GET /bill-payments/saved-billers/", False, str(e))

        # Bill Payments
        try:
            response = self.session.get(f"{BASE_URL}/bill-payments/payments/")
            success = response.status_code == 200
            data = response.json() if success else None
            details = f"Status: {response.status_code}, Payments: {len(data) if data else 0}"
            self.log_test("GET /bill-payments/payments/", success, details)
        except Exception as e:
            self.log_test("GET /bill-payments/payments/", False, str(e))

    def test_create_operations(self):
        """Test creating new records (sample tests)"""
        if not self.token:
            print("\n⚠️ Skipping create operations - no token available")
            return
            
        print("\n📝 Testing Create Operations (Sample)")
        
        # Note: These are basic connectivity tests
        # In a real scenario, you'd want to test with valid data
        
        # Test loan application endpoint (without submitting)
        try:
            # Just test the endpoint accessibility
            response = self.session.options(f"{BASE_URL}/loans/applications/")
            success = response.status_code in [200, 204]
            details = f"Options request status: {response.status_code}"
            self.log_test("OPTIONS /loans/applications/ (connectivity)", success, details)
        except Exception as e:
            self.log_test("OPTIONS /loans/applications/ (connectivity)", False, str(e))

    def run_all_tests(self):
        """Run complete API test suite"""
        print("🚀 Starting API Test Suite")
        print(f"📍 Base URL: {BASE_URL}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        self.test_public_endpoints()
        self.test_authentication()
        self.test_authenticated_endpoints()
        self.test_create_operations()
        
        # Summary
        print("\n📊 Test Summary")
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")
        
        return passed_tests == total_tests

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! API is working correctly.")
        exit(0)
    else:
        print("\n⚠️ Some tests failed. Please check the issues above.")
        exit(1)