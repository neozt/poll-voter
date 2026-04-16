import { OptionDetails, PollDetails, PollOverviewSqlResult } from '../models/poll.types';

export function convertToPollDetailsDto(pollOverviewResults: PollOverviewSqlResult[]): PollDetails {
    if (!pollOverviewResults || pollOverviewResults.length == 0) {
        throw new Error('pollOverviewResults cannot be empty');
    }

    return {
        id: pollOverviewResults[0].poll_id,
        title: pollOverviewResults[0].poll_title,
        description: pollOverviewResults[0].poll_description,
        created_by: pollOverviewResults[0].created_by,
        created_at: pollOverviewResults[0].created_at,
        is_active: pollOverviewResults[0].is_active,
        options: pollOverviewResults.map((row) => {
            return {
                id: row.option_id,
                title: row.option_title,
                description: row.option_desc,
                vote_count: row.vote_count,
            } as OptionDetails;
        }),
    };
}
