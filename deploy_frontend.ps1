param (
    [string]$stack_name
)

# Get user input for stack name if not provided
if (-not $stack_name) {
    $stack_name = Read-Host "Enter the name of the CloudFormation stack"
}

# Get all stack outputs from CloudFormation
Write-Host "Fetching outputs for stack: $stack_name..."
$outputs_json = aws cloudformation describe-stacks --stack-name $stack_name --query "Stacks[0].Outputs" --output json
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to fetch stack outputs. Please check the stack name and your AWS credentials."
    exit $LASTEXITCODE
}

$outputs = $outputs_json | ConvertFrom-Json
$outputMap = @{}
foreach ($out in $outputs) {
    $outputMap[$out.OutputKey] = $out.OutputValue
}

# Load .env template
$env_path = "frontend/src/environments/environment.ts"
if (-not (Test-Path $env_path)) {
    Write-Error ".env file not found at $env_path"
    exit 1
}
$env_content = Get-Content -Path $env_path -Raw

# Replace placeholders %%xxx%% with stack outputs
Write-Host "Replacing placeholders in environment.ts..."
foreach ($key in $outputMap.Keys) {
    $placeholder = "%%$key%%"
    $value = $outputMap[$key]
    if ($env_content.Contains($placeholder)) {
        Write-Host "  Replacing $placeholder"
        $env_content = $env_content.Replace($placeholder, $value)
    }
}

# Write .env.production
Write-Host "Generating environment.production.ts..."
$env_content | Out-File -FilePath "frontend/src/environments/environment.production.ts" -Encoding utf8

# Run npm install and build
Write-Host "Running npm ci in frontend..."
Set-Location frontend
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed."
    Set-Location ..
    exit $LASTEXITCODE
}

Write-Host "Running vite build..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Vite build failed."
    Set-Location ..
    exit $LASTEXITCODE
}

Set-Location ..

Write-Host "Build complete! Files are in the 'dist' directory."

$cloudfront_distribution_id = $outputMap["CloudFrontDistributionId"]
$s3_bucket_name = $outputMap["WebS3BucketName"]

if (-not $s3_bucket_name -or -not $cloudfront_distribution_id) {
    Write-Error "Required outputs (WebS3BucketName or CloudFrontDistributionId) not found in stack."
    exit 1
}

# Sync distribution with S3
Write-Host "Syncing with S3 bucket: $s3_bucket_name..."
aws s3 sync "frontend/dist/poll-voter-frontend/browser/" "s3://$s3_bucket_name/" --delete

# Create cloudfront invalidation
Write-Host "Creating CloudFront invalidation for distribution: $cloudfront_distribution_id..."
$invalidation_id = aws cloudfront create-invalidation --distribution-id $cloudfront_distribution_id --paths "/*" --query "Invalidation.Id" --output text

# Wait for cloudfront invalidation to complete
Write-Host "Waiting for invalidation ($invalidation_id) to complete..."
aws cloudfront wait invalidation-completed --distribution-id $cloudfront_distribution_id --id $invalidation_id

# Get cloudfront domain name and validate
$cloudfront_domain_name = aws cloudfront list-distributions --query "DistributionList.Items[?Id=='$cloudfront_distribution_id'].DomainName" --output text

Write-Host "`nDeployment Complete!"
Write-Host "Please visit your CloudFront URL to test: https://$cloudfront_domain_name"
