import type { Context } from 'aws-lambda';
import dataApiClient from 'data-api-client';
import { randomUUID } from 'crypto';
import { NotFoundError, Router } from '@aws-lambda-powertools/event-handler/http';
import { z } from 'zod';
import { cors } from '@aws-lambda-powertools/event-handler/http/middleware';

const db = dataApiClient({
    secretArn: process.env.DB_SECRET_ARN!,
    resourceArn: process.env.DB_CLUSTER_ARN!,
    database: process.env.DB_NAME!,
});

const bodySchema = z.object({
    optionId: z.string(),
});

const pathSchema = z.object({
    pollId: z.uuid(),
});

const app = new Router();

app.use(
    cors({
        origin: '*',
        maxAge: 300,
    })
);

app.post(
    '/polls/:pollId/votes',
    async (reqCtx) => {
        const pollId = reqCtx.params.pollId;
        const optionId = reqCtx.valid.req.body.optionId;

        const voteId = randomUUID();

        const transaction = db
            .transaction()
            .query(`
                SELECT COUNT(*)
                FROM poll_option
                WHERE poll_id = :pollId::uuid
                  and option_id = :optionId::uuid
            `, {
                pollId,
                optionId,
            })
            .query((result) => {
                if (result.records[0].count <= 0) {
                    throw new NotFoundError("pollId or optionId not found.");
                }

                return [
                    `INSERT INTO vote(vote_id, poll_id, selected_option_id)
                     VALUES (:voteId::uuid, :pollId::uuid, :optionId::uuid)
                     RETURNING vote_id`,
                    {voteId, pollId, optionId},
                ];
            });

        await transaction.commit();

        return {
            statusCode: 201,
            body: {message: 'Vote casted', voteId},
        };
    },
    {
        validation: {req: {body: bodySchema, path: pathSchema}}
    }
);

export const handler = async (event: unknown, context: Context) =>
    app.resolve(event, context);
