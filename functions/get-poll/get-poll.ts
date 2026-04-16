import { type Context } from 'aws-lambda';
import dataApiClient from 'data-api-client';
import { NotFoundError, Router } from '@aws-lambda-powertools/event-handler/http';
import { cors } from '@aws-lambda-powertools/event-handler/http/middleware';
import { PollOverviewResult } from '../common/models/poll.types';
import { z } from 'zod';
import { convertToPollDetailsDto } from '../common/mappers/poll.mappers';

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
    }),
);

const pathSchema = z.object({
    pollId: z.uuid(),
});

app.get(
    '/polls/:pollId',
    async (reqCtx) => {
        const pollId = reqCtx.valid.req.path.pollId;

        const result = await db.query<PollOverviewResult>(
            `SELECT poll_id            as "pollId",
                    poll_title         as "pollTitle",
                    poll_description   as "pollDescription",
                    created_by         as "createdBy",
                    created_at         as "createdAt",
                    is_active          as "isActive",
                    option_id          as "optionId",
                    option_title       as "optionTitle",
                    option_description as "optionDescription",
                    vote_count         as "voteCount"
             FROM poll_overview
             WHERE poll_id = :pollId::uuid`,
            { pollId },
        );

        if (!result.records || result.records.length == 0) {
            throw new NotFoundError(`Poll not found.`, undefined, { pollId });
        }

        const pollDetails = convertToPollDetailsDto(result.records);

        return {
            statusCode: 200,
            body: JSON.stringify(pollDetails),
        };
    },
    {
        validation: { req: { path: pathSchema } },
    },
);

export const handler = async (event: unknown, context: Context) => app.resolve(event, context);
