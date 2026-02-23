import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const TEST_MOBILE = '9970825381';

async function testNativeOTPFlow() {
    console.log(`[TEST] Starting Native OTP Flow for ${TEST_MOBILE}...`);
    try {
        // 1. Request OTP
        console.log(`[TEST] Phase 1: Requesting OTP...`);
        const reqResponse = await axios.post(`${API_URL}/auth/request-otp`, { mobile: TEST_MOBILE });
        console.log(`[TEST] Phase 1 Response:`, reqResponse.data);

        // Since we can't see the OTP (it's in Textbelt/SMS), we'll need to check the logs 
        // Or for this test, we might need a way to mock or just verify the request was sent.
        // Actually, the generate endpoint returns the OTP in the response!
        // Wait, does our controller return it? No.

        console.log(`\n[TEST] CHECK BACKEND LOGS FOR THE GENERATED OTP.`);
    } catch (error: any) {
        console.error(`[TEST] Flow failed:`, error.response?.data || error.message);
    }
}

testNativeOTPFlow();
