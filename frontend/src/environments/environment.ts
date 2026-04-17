// These placeholders will be replaced by CloudFormation output variables at build time.
// For local development, copy this file into `environment.development.ts` and replace the placeholder values marked with %%xxx%%.
export const environment = {
  production: false,
  apiUrl: '%%PollApiUrl%%',
  appSyncEndpoint: '%%AppSyncHttpEndpoint%%',
  appSyncApiKey: '%%AppSyncApiKey%%',
  appSyncRegion: '%%AwsRegion%%',
};
