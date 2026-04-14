import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './create-poll';

describe('approve-claim handler', () => {

    it('should return 200 OK', async () => {
        const event = {} as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual('OK');
    });

});
