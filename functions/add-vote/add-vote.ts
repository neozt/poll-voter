import type { Context } from 'aws-lambda';
import dataApiClient from 'data-api-client';
import { randomUUID } from 'crypto';
import { NotFoundError, Router } from '@aws-lambda-powertools/event-handler/http';
import { z } from 'zod';
import { cors } from '@aws-lambda-powertools/event-handler/http/middleware';
import { OptionRecord } from "../common/models/poll.types";

const db = dataApiClient({
    secretArn: process.env.DB_SECRET_ARN!,
    resourceArn: process.env.DB_CLUSTER_ARN!,
    database: process.env.DB_NAME!,
});

const bodySchema = z.object({
    optionId: z.string(),
    votedBy: z.string(),
});

const pathSchema = z.object({
    pollId: z.uuid(),
});

const app = new Router();

app.use(
    cors({
        origin: '*',
        maxAge: 300,
    }),
);

app.post(
    '/polls/:pollId/votes',
    async (reqCtx) => {
        const {pollId} = reqCtx.valid.req.path;
        const {optionId, votedBy} = reqCtx.valid.req.body;

        const voteId = randomUUID();

        const selectOptionResult = await db.query<OptionRecord>(
            `
                SELECT option_id   as optionId,
                       poll_id     as pollId,
                       title       as title,
                       description as description
                FROM option
                WHERE poll_id = :pollId::uuid
                  and option_id = :optionId::uuid
            `,
            {pollId, optionId},
        );

        if (selectOptionResult.records!.length === 0) {
            throw new NotFoundError('pollId or optionId not found.');
        }

        await db.query<{ vote_id: string; }>(
            `
                INSERT INTO vote(vote_id, poll_id, selected_option_id, voted_by)
                VALUES (:voteId::uuid, :pollId::uuid, :optionId::uuid, :votedBy)
            `,
            {voteId, pollId, optionId, votedBy},
        )

        await publishUpdatedTally(pollId, optionId, votedBy);

        return {
            statusCode: 201,
            body: {message: 'Vote casted', voteId},
        };
    },
    {
        validation: {req: {body: bodySchema, path: pathSchema}},
    },
);

export const handler = async (event: unknown, context: Context) => app.resolve(event, context);

/**
 * Fetches latest vote tally and publish to AppSync Events
 * @param pollId the poll for which the vote was cast
 */
async function publishUpdatedTally(pollId: string, optionId: string, votedBy: any) {
    const selectPollOverviewResult = await db.query<{
        option_id: string;
        vote_count: number;
        current_timestamp: Date;
    }>(
        `
            select option_id, vote_count, current_timestamp
            from poll_overview
            where poll_id = :pollId::uuid
        `,
        {pollId}
    );

    const voteTally = selectPollOverviewResult.records!
        .map((row) => (
            [row.option_id, row.vote_count] as [string, number])
        ) ?? [];

    const appSyncMessage = {
        pollId,
        voteTally,
        timestamp: selectPollOverviewResult.records![0].current_timestamp,
        latestVote: {
            optionId,
            votedBy,
        }
    };

    const endpoint = process.env.APPSYNC_ENDPOINT;
    const apiKey = process.env.APPSYNC_API_KEY;
    if (!endpoint || !apiKey) {
        throw new Error("APPSYNC_ENDPOINT and APPSYNC_API_KEY must be present in env");
    }

    try {
        const response = await fetch(`https://${endpoint}/event`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel: `polls/${pollId}`,
                events: [JSON.stringify(appSyncMessage)],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`AppSync Publish Error (${response.status}):`, errorText);
        }
    } catch (error) {
        console.error('Failed to publish to AppSync', error);
    }
}
