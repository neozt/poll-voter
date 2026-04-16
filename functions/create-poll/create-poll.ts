import { type Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import dataApiClient from 'data-api-client';
import { z } from 'zod';
import { cors } from '@aws-lambda-powertools/event-handler/http/middleware';
import { Router } from '@aws-lambda-powertools/event-handler/http';

const db = dataApiClient({
    secretArn: process.env.DB_SECRET_ARN!,
    resourceArn: process.env.DB_CLUSTER_ARN!,
    database: process.env.DB_NAME!,
});

const createPollSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    options: z
        .array(
            z.object({
                title: z.string(),
                description: z.string().optional(),
            }),
        )
        .min(1),
});

const app = new Router();

app.use(
    cors({
        origin: '*',
        maxAge: 300,
    }),
);

app.post(
    '/polls',
    async (reqCtx) => {
        const { title, description, options } = reqCtx.valid.req.body;

        const pollId = randomUUID();
        const transaction = db.transaction();

        // Insert poll
        transaction.query(
            'INSERT INTO poll (poll_id, title, description) VALUES (:id::uuid, :title, :desc)',
            {
                title,
                id: pollId,
                desc: description || null,
            }
        );

        for (const opt of options) {
            // Insert options
            const optionId = randomUUID();
            const optTitle = opt.title;
            const optDesc = opt.description;

            transaction.query(
                'INSERT INTO option (option_id, poll_id, title, description) VALUES (:id::uuid, :pollId::uuid, :title, :desc)',
                {
                    pollId,
                    id: optionId,
                    title: optTitle,
                    desc: optDesc ?? null,
                }
            );
        }

        await transaction.commit();

        return {
            statusCode: 201,
            body: { message: 'Poll created', pollId },
        };
    },
    {
        validation: { req: { body: createPollSchema } },
    },
);

export const handler = async (event: unknown, context: Context) => app.resolve(event, context);
