import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import dataApiClient from 'data-api-client';

const db = dataApiClient({
    secretArn: process.env.DB_SECRET_ARN!,
    resourceArn: process.env.DB_CLUSTER_ARN!,
    database: process.env.DB_NAME!
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', event.body);

    try {
        const body = JSON.parse(event.body || '{}');
        const {title, description, created_by, options} = body;

        if (!title || !options || !Array.isArray(options) || options.length < 1) {
            return {
                statusCode: 400,
                headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                body: JSON.stringify({message: "Title and at least 2 options are required."}),
            };
        }

        const pollId = randomUUID();
        const transaction = db.transaction();

        // Create poll
        transaction.query(
            'INSERT INTO poll (poll_id, title, description, created_by) VALUES (:id::uuid, :title, :desc, :createdBy)',
            {id: pollId, title, desc: description || null, createdBy: created_by || null}
        );

        // Create options
        for (const opt of options) {
            const optionId = randomUUID();
            // Allow option to be passed as an object or a simple string
            const optTitle = typeof opt === 'string' ? opt : opt.title;
            const optDesc = typeof opt === 'string' ? null : opt.description || null;

            transaction.query(
                'INSERT INTO option (option_id, title, description) VALUES (:id::uuid, :title, :desc)',
                {id: optionId, title: optTitle, desc: optDesc}
            );
            transaction.query(
                'INSERT INTO poll_option (poll_id, option_id) VALUES (:pollId::uuid, :optId::uuid)',
                {pollId, optId: optionId}
            );
        }

        await transaction.commit();

        return {
            statusCode: 201,
            headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({message: "Poll created", poll_id: pollId}),
        };
    } catch (error) {
        console.error('Error creating poll:', error);

        return {
            statusCode: 500,
            headers: {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            body: JSON.stringify({message: "Internal Server Error"}),
        };
    }
};
