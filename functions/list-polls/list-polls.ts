import { type Context } from 'aws-lambda';
import dataApiClient from 'data-api-client';
import { Router } from '@aws-lambda-powertools/event-handler/http';
import { cors } from '@aws-lambda-powertools/event-handler/http/middleware';
import { PollOverviewSqlResult } from '../common/models/poll.types';
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
    const result = await db.query<PollOverviewSqlResult>(
        `SELECT * FROM poll_overview WHERE is_active = true ORDER BY created_at DESC;`,
    );

    // Group rows by poll
    const groupByPollId: Record<string, PollOverviewSqlResult[]> = {};

    for (const row of result.records ?? []) {
        if (!groupByPollId[row.poll_id]) {
            groupByPollId[row.poll_id] = [];
        }
        groupByPollId[row.poll_id].push(row);
    }

    const polls = Object.values(groupByPollId)
        .map(convertToPollDetailsDto)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return {
        statusCode: 200,
        body: JSON.stringify(polls),
    };
});

export const handler = async (event: unknown, context: Context) => app.resolve(event, context);
