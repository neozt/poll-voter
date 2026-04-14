import { type Context } from 'aws-lambda';
import dataApiClient from 'data-api-client';
import { Router } from '@aws-lambda-powertools/event-handler/http';
import { cors } from '@aws-lambda-powertools/event-handler/http/middleware';

const db = dataApiClient({
    secretArn: process.env.DB_SECRET_ARN!,
    resourceArn: process.env.DB_CLUSTER_ARN!,
    database: process.env.DB_NAME!,
});

const app = new Router();

app.use(
    cors({
        origin: '*',
        maxAge: 300,
    })
);

app.get(
    '/polls',
    async (reqCtx) => {
        const result = await db.query(`SELECT * FROM poll_overview WHERE is_active = true ORDER BY created_at DESC;`);

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
                    options: [],
                };
            }
            pollsMap[row.poll_id].options.push({
                id: row.option_id,
                title: row.option_title,
                description: row.option_desc,
                vote_count: row.vote_count,
            });
        }

        const polls = Object.values(pollsMap);

        return {
            statusCode: 200,
            body: polls,
        };
    }
);

export const handler = async (event: unknown, context: Context) =>
    app.resolve(event, context);
