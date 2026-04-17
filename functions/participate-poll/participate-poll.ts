import { type Context } from 'aws-lambda';
import dataApiClient from 'data-api-client';
import { Router } from '@aws-lambda-powertools/event-handler/http';
import { cors } from '@aws-lambda-powertools/event-handler/http/middleware';
import { z } from 'zod';
import { notFound } from "../common/utils/response.util";

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

const bodySchema = z.object({
    participantId: z.uuid(),
    action: z.enum(['JOIN_POLL', 'HEARTBEAT', 'LEAVE_POLL']),
});

app.post(
    '/polls/:pollId/participants',
    async (reqCtx) => {
        try {
            const pollId = reqCtx.valid.req.path.pollId;
            const {participantId, action} = reqCtx.valid.req.body;

            const pollExistsQueryResult = await db.query<{exists: boolean}>(
                `select exists(select 1 from poll where poll_id = :pollId::uuid)`,
                {pollId}
            );

            const isPollExists = pollExistsQueryResult.records![0].exists;

            if (!isPollExists) {
                return notFound('Poll not found', {pollId});
            }

            switch (action) {
                case 'LEAVE_POLL': {
                    await db.query(
                        `delete from participant where poll_id = :pollId::uuid and participant_id = :participantId::uuid`,
                        {pollId, participantId}
                    );
                    break
                }
                case 'JOIN_POLL':
                case 'HEARTBEAT': {
                    await db.query(
                        `
                            insert into participant (participant_id, poll_id, latest_heartbeat)
                            values (:participantId::uuid, :pollId::uuid, current_timestamp)
                            on conflict (participant_id, poll_id) do update set latest_heartbeat = current_timestamp
                        `,
                        {participantId, pollId}
                    );
                    break;
                }
            }

            await publishParticipantsCount(pollId);

            return {
                statusCode: 201,
            };
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    {
        validation: { req: { path: pathSchema, body: bodySchema } },
    },
);

export const handler = async (event: unknown, context: Context) => app.resolve(event, context);

async function publishParticipantsCount(pollId: string) {
    const countParticipantsQueryResult = await db.query<{count: number}>(
        `
                    WITH cleanup AS (
                        DELETE FROM participant
                            WHERE latest_heartbeat < current_timestamp - interval '20 seconds'
                    )
                    SELECT count(1)
                    FROM participant
                    WHERE poll_id = :pollId::uuid;
                `,
        {pollId}
    );
    const participantsCount = countParticipantsQueryResult.records![0].count;
    const endpoint = process.env.APPSYNC_ENDPOINT;
    const apiKey = process.env.APPSYNC_API_KEY;
    if (!endpoint || !apiKey) {
        throw new Error("APPSYNC_ENDPOINT and APPSYNC_API_KEY must be present in env");
    }

    try {
        const channel = `participants/${pollId}`;
        const message = JSON.stringify({
            pollId,
            participantsCount,
        });
        const response = await fetch(`https://${endpoint}/event`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel: channel,
                events: [message],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`AppSync Publish Error (${response.status}):`, errorText);
        }

        console.log(`Published to ${channel}: ${message}`);
    } catch (error) {
        console.error('Failed to publish to AppSync', error);
    }
}