import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', JSON.stringify(event));

    try {
        return {
            statusCode: 200,
            body: "OK",
        };
    } catch (error) {
        console.error('Something went wrong', error);

        return {
            statusCode: 200,
            body: "Not OK",
        };
    }
};
