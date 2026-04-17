# Poll Voter

A serverless, real-time poll voting application built with AWS Lambda, AppSync Events, Angular and Aurora Serverless V2 (PostgreSQL).

## ✨ Key Features
- **Poll Management**: Create and view detailed results for polls.
- **Real-time Live Voting**: Instantly see poll results update as users cast their votes via AWS AppSync Events.
- **Real-time Participant Count**: See how many participants are in the same poll as you.
- **Serverless Architecture**: Fully scalable backend using AWS Lambda and Aurora Serverless v2.
- **Responsive UI**: Modern dashboard built with Angular, Tailwind CSS, and Ng-Zorro Ant Design.

## 🏗️ Architecture
The application follows a modern serverless event-driven architecture:

1.  **Frontend**: Hosted on Amazon S3 and distributed via CloudFront.
2.  **API Layer**: Amazon API Gateway routes requests to Lambda functions.
3.  **Compute**: AWS Lambda handles business logic (creating polls, retrieving data, recording votes).
4.  **Database**: Aurora Serverless v2 (PostgreSQL) stores poll data and votes, accessed via the RDS Data API.
5.  **WebSocket Layer**: Real-time updates pushed to the frontend via AppSync Events.

## 🛠️ Tech Stack

### Backend / Infrastructure
- **Framework**: [AWS SAM](https://aws.amazon.com/serverless/sam/) (Serverless Application Model)
- **Runtime**: Node.js 24.x (TypeScript)
- **Compute**: AWS Lambda
- **Database**: Amazon RDS Aurora Serverless v2 (PostgreSQL)
- **Database Client**: Utilizing [data-api-client](https://www.npmjs.com/package/data-api-client) library to access RDS via [RDS Data API](https://docs.aws.amazon.com/rdsdataservice/latest/APIReference/Welcome.html)
- **Real-time**: AWS AppSync Events (HTTP/WebSocket)

### Frontend
- **Framework**: Angular
- **Styling**: Tailwind CSS & [Ng-Zorro Ant Design](https://ng.ant.design/)
- **Real-time Client**: AWS Amplify to access AppSync Events

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
    Create a `frontend/src/environments/environment.development.ts` file by copying the contents of `frontend/src/environments/environment.ts` and replacing the placeholders with your CloudFormation output values.
2. **Launch Development Server**:
    Start the Angular development server to preview the site locally:
    ```bash
    npm run frontend:start
    ```
3. **Hot Reload Lambdas**:
    Sync Lambda code changes directly to AWS:
    ```bash
    sam sync --code --watch --stack-name {stack-name}
    ```

## 🧹 Teardown
To remove all resources created by this project:
```bash
sam delete --config-env dev
```
