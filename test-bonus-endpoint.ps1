# Test Registration Bonus Endpoint
Write-Host "`n🧪 Testing Registration Bonus Endpoint..." -ForegroundColor Cyan

# Get token from browser console
Write-Host "`n📋 STEP 1: Get Your Auth Token" -ForegroundColor Yellow
Write-Host "1. Open your browser and go to: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "2. Open DevTools (F12)" -ForegroundColor White
Write-Host "3. Go to Console tab" -ForegroundColor White
Write-Host "4. Paste this command:" -ForegroundColor White
Write-Host '   document.cookie.split(";").find(c => c.includes("authToken")).split("=")[1]' -ForegroundColor Green
Write-Host "`n5. Copy the token (it's a long string)" -ForegroundColor White

$token = Read-Host "`nPaste your auth token here"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ No token provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Token received (${($token.Length)} characters)" -ForegroundColor Green

# Test endpoint
Write-Host "`n📡 STEP 2: Testing Backend Endpoint..." -ForegroundColor Yellow
Write-Host "URL: https://api.novunt.com/api/v1/bonuses/registration/status" -ForegroundColor White

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest `
        -Uri "https://api.novunt.com/api/v1/bonuses/registration/status" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS! Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`n📊 RESPONSE DATA:" -ForegroundColor Cyan
    
    # Pretty print JSON
    $jsonResponse = $response.Content | ConvertFrom-Json
    $jsonResponse | ConvertTo-Json -Depth 10
    
    Write-Host "`n✨ INTERPRETATION:" -ForegroundColor Magenta
    Write-Host "Days Remaining: $($jsonResponse.daysRemaining) days" -ForegroundColor White
    Write-Host "Profile Completion: $($jsonResponse.requirements.profileCompletion.percentage)%" -ForegroundColor White
    Write-Host "Social Media Verified: $($jsonResponse.requirements.socialMediaVerification.verifiedCount)/5" -ForegroundColor White
    Write-Host "First Stake: $(if ($jsonResponse.requirements.firstStake.completed) {'✅ Completed'} else {'❌ Not Yet'})" -ForegroundColor White
    
    if ($jsonResponse.allRequirementsMet) {
        Write-Host "Bonus Amount: `$$($jsonResponse.bonusAmount)" -ForegroundColor Green
    } else {
        Write-Host "Bonus Amount: Not calculated yet (complete all requirements)" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 404) {
        Write-Host "`n⚠️  404 NOT FOUND" -ForegroundColor Yellow
        Write-Host "`nThis means:" -ForegroundColor White
        Write-Host "  • Your account is MORE than 7 days old" -ForegroundColor White
        Write-Host "  • The registration bonus has EXPIRED" -ForegroundColor White
        Write-Host "  • This is EXPECTED behavior per backend design" -ForegroundColor White
        
        Write-Host "`n💡 Frontend Behavior:" -ForegroundColor Cyan
        Write-Host "  • The banner shows '7 days remaining' as FALLBACK DATA" -ForegroundColor White
        Write-Host "  • This prevents the UI from breaking" -ForegroundColor White
        Write-Host "  • For NEW users (<7 days), they will see REAL data" -ForegroundColor White
        
    } elseif ($statusCode -eq 401) {
        Write-Host "`n❌ 401 UNAUTHORIZED" -ForegroundColor Red
        Write-Host "Your token is invalid or expired. Please log in again." -ForegroundColor White
        
    } else {
        Write-Host "`n❌ ERROR: Status Code $statusCode" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor White
    }
}

Write-Host "`n✅ Test Complete!" -ForegroundColor Green
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

