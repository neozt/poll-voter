import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import dataApiClient from 'data-api-client';

const db = dataApiClient({
    secretArn: process.env.DB_SECRET_ARN!,
    resourceArn: process.env.DB_CLUSTER_ARN!,
    database: process.env.DB_NAME!
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const result = await db.query(
            `SELECT * FROM poll_overview WHERE is_active = true ORDER BY created_at DESC;`
        );

        // Group rows by poll
        const pollsMap: Record<string, any> = {};

        for (const row of result.records ?? []) {
            if (!pollsMap[row.poll_id]) {
                pollsMap[row.poll_id] = {
                    id: row.poll_id,
                    title: row.poll_title,
                    description: row.poll_description,
                    created_by: row.created_by,
                    created_at: row.created_at,
                    is_active: row.is_active,
                    options: []
                };
            }
            pollsMap[row.poll_id].options.push({
                id: row.option_id,
                title: row.option_title,
                description: row.option_desc,
                vote_count: row.vote_count
            });
        }

        const polls = Object.values(pollsMap);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(polls),
        };
    } catch (error) {
        console.error('Error listing polls:', error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
