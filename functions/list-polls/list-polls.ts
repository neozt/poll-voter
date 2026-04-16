import { type Context } from 'aws-lambda';
import dataApiClient from 'data-api-client';
import { Router } from '@aws-lambda-powertools/event-handler/http';
import { cors } from '@aws-lambda-powertools/event-handler/http/middleware';
import { PollOverviewResult } from '../common/models/poll.types';
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

app.get('/polls', async (reqCtx) => {
    const result = await db.query<PollOverviewResult>(
        `
            SELECT poll_id            as "pollId",
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
            WHERE is_active = true
            ORDER BY created_at DESC;
        `,
    );

    // Group rows by poll
    const groupByPollId: Record<string, PollOverviewResult[]> = {};

    for (const row of result.records ?? []) {
        if (!groupByPollId[row.pollId]) {
            groupByPollId[row.pollId] = [];
        }
        groupByPollId[row.pollId].push(row);
    }

    const polls = Object.values(groupByPollId)
        .map(convertToPollDetailsDto)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
        statusCode: 200,
        body: JSON.stringify(polls),
    };
});

export const handler = async (event: unknown, context: Context) => app.resolve(event, context);
