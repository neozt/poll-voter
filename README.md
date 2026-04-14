# Poll Voter

## ✨ Key Features

## 🏗️ Architecture

![Architecture diagram](docs/architecture.drawio.png)

## 🛠️ Tech Stack

### Backend / Infrastructure

### Frontend

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) & [npm](https://www.npmjs.com/)
- [AWS CLI](https://aws.amazon.com/cli/) & [SAM CLI](https://docs.aws.amazon.com/serverless-repo/latest/devguide/serverless-sam-cli-install.html)
- Docker (required for `sam build`)

### Deployment
1. **Configure AWS**:
    ```bash
    aws configure
    ```
2. **Install npm Dependencies**
    ```bash
    npm install
    ```
3. **Build & Deploy Backend**:
    ```bash
    sam build
    sam deploy --config-env dev
    ```
4. **Deploy Frontend**:
    Execute the PowerShell script to build and sync the frontend to your S3 bucket:
    ```powershell
    .\deploy_frontend.ps1
    ```

### 💻 Local Development
1. **Configure Local Environment**:
    Create a `frontend/.env.local` file by copying the contents of `frontend/.env` and replacing the placeholders with your CloudFormation output values.
2. **Launch Development Server**:
    Start the Vite development server to preview the dashboard and market simulator locally:
    ```bash
    npm run frontend:dev
    ```

## 🧹 Teardown
To remove all resources created by this project:
```bash
sam delete --config-env dev
```
