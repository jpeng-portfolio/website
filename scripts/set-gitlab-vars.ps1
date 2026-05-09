<#
.SYNOPSIS
    Push required website CI/CD variables to a GitLab project via the API.
.DESCRIPTION
    Reads variable values interactively and creates them as CI/CD variables
    in the specified GitLab project. Existing variables are updated.
.PARAMETER GitLabToken
    Personal Access Token with api scope.
.PARAMETER ProjectId
    Numeric GitLab project ID (Settings > General > Project ID).
.PARAMETER Protected
    Whether variables should be marked as protected in GitLab (default: $true).
.PARAMETER IncludeContactAlias
    Also set CONTACT_API_URL as an alias of NEXT_PUBLIC_CONTACT_API_URL.
#>
param(
    [Parameter(Mandatory)] [string] $GitLabToken,
    [Parameter(Mandatory)] [string] $ProjectId,
    [bool] $Protected = $true,
    [switch] $IncludeContactAlias
)

$GitLabApiUrl = "https://gitlab.com/api/v4/projects/$ProjectId/variables"

$Headers = @{
    "PRIVATE-TOKEN" = $GitLabToken
    "Content-Type"  = "application/json"
}

# ---------------------------------------------------------------------------
# Define variables: [key, prompt, masked, protected]
# ---------------------------------------------------------------------------
$Variables = @(
    @("ROLE_ARN",                    "IAM Role ARN (from infrastructure bootstrap output)", $false, $Protected),
    @("AWS_DEFAULT_REGION",          "AWS region (e.g. us-east-1)",                         $false, $Protected),
    @("BUCKET_NAME",                 "S3 bucket name for website assets",                    $false, $Protected),
    @("DISTRIBUTION_ID",             "CloudFront distribution ID",                           $false, $Protected),
    @("GITHUB_REPO",                 "GitHub repository name (e.g. jpeng-portfolio)",        $false, $Protected),
    @("GITHUB_OWNER",                "GitHub owner/org name",                                $false, $Protected),
    @("GITHUB_USERNAME",             "GitHub username for authentication",                    $false, $Protected),
    @("GITHUB_TOKEN",                "GitHub token (PAT or fine-grained token)",             $true,  $Protected),
    @("NEXT_PUBLIC_CONTACT_API_URL", "Contact API URL ending with /contact",                 $false, $Protected)
)
$EnteredValues = @{}

foreach ($var in $Variables) {
    $key       = $var[0]
    $prompt    = $var[1]
    $masked    = $var[2]
    $protected = $var[3]

    $value = Read-Host -Prompt $prompt
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Warning "Skipping $key (empty value)"
        continue
    }
    $EnteredValues[$key] = $value

    $body = @{
        key           = $key
        value         = $value
        masked        = $masked
        protected     = $protected
        variable_type = "env_var"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $GitLabApiUrl -Method Post -Headers $Headers -Body $body | Out-Null
        Write-Host "[OK] $key" -ForegroundColor Green
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 409) {
            # Variable already exists — update it
            $updateUri = "$GitLabApiUrl/$key"
            Invoke-RestMethod -Uri $updateUri -Method Put -Headers $Headers -Body $body | Out-Null
            Write-Host "[UPDATED] $key" -ForegroundColor Yellow
        } else {
            Write-Error "Failed to set $key : $_"
        }
    }
}

if ($IncludeContactAlias) {
    $contactApiUrl = Read-Host -Prompt "CONTACT_API_URL alias value (press Enter to reuse NEXT_PUBLIC_CONTACT_API_URL)"

    if ([string]::IsNullOrWhiteSpace($contactApiUrl)) {
        if ($EnteredValues.ContainsKey("NEXT_PUBLIC_CONTACT_API_URL")) {
            $contactApiUrl = $EnteredValues["NEXT_PUBLIC_CONTACT_API_URL"]
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($contactApiUrl)) {
        $body = @{
            key           = "CONTACT_API_URL"
            value         = $contactApiUrl
            masked        = $false
            protected     = $Protected
            variable_type = "env_var"
        } | ConvertTo-Json

        try {
            Invoke-RestMethod -Uri $GitLabApiUrl -Method Post -Headers $Headers -Body $body | Out-Null
            Write-Host "[OK] CONTACT_API_URL" -ForegroundColor Green
        } catch {
            $status = $_.Exception.Response.StatusCode.value__
            if ($status -eq 409) {
                $updateUri = "$GitLabApiUrl/CONTACT_API_URL"
                Invoke-RestMethod -Uri $updateUri -Method Put -Headers $Headers -Body $body | Out-Null
                Write-Host "[UPDATED] CONTACT_API_URL" -ForegroundColor Yellow
            } else {
                Write-Error "Failed to set CONTACT_API_URL : $_"
            }
        }
    } else {
        Write-Warning "Skipping CONTACT_API_URL (empty value)"
    }
}

Write-Host "`nAll variables processed." -ForegroundColor Cyan
