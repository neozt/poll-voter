import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import dataApiClient from 'data-api-client';
import { randomUUID } from "crypto";

const db = dataApiClient({
    secretArn: process.env.DB_SECRET_ARN!,
    resourceArn: process.env.DB_CLUSTER_ARN!,
    database: process.env.DB_NAME!
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', event.body);

    try {
        const body = JSON.parse(event.body || '{}');
        const {pollId, optionId} = body;

        if (!pollId || !optionId) {
            return {
                statusCode: 400,
                headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                body: JSON.stringify({message: "pollId or optionId is missing"}),
            };
        }

        const voteId = randomUUID();

        const transaction = db.transaction()
            .query(`SELECT COUNT(*) FROM poll_option WHERE poll_id = :pollId::uuid and option_id = :optionId::uuid`, {pollId, optionId})
            .query(result => {
                if (result.records[0].count <= 0) {
                    throw new Error("pollId or optionId not found.");
                }

                return [
                    `INSERT INTO vote(vote_id, poll_id, selected_option_id) VALUES (:voteId::uuid, :pollId::uuid, :optionId::uuid) RETURNING vote_id`,
                    {voteId, pollId, optionId}
                ];
            })


        await transaction.commit();

        return {
            statusCode: 201,
            headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({message: "Vote casted", voteId}),
        };
    } catch (error) {
        console.error('Error adding vote:', error);

        return {
            statusCode: 500,
            headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({message: "Internal Server Error"}),
        };
    }
};
