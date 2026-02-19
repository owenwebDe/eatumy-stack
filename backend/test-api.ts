

async function main() {
    try {
        console.log("Testing Request OTP...");
        const response = await fetch('http://localhost:5000/api/auth/request-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mobile: "9999999999"
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log("Success:", data);
        } else {
            console.error("Error Status:", response.status);
            console.error("Error Data:", data);
        }
    } catch (error: any) {
        console.error("Network/Script Error:", error.message);
    }
}

main();
