import { OptionDetails, PollDetails, PollOverviewResult } from '../models/poll.types';

export function convertToPollDetailsDto(pollOverviewResults: PollOverviewResult[]): PollDetails {
    if (!pollOverviewResults || pollOverviewResults.length == 0) {
        throw new Error('pollOverviewResults cannot be empty');
    }

    return {
        id: pollOverviewResults[0].pollId,
        title: pollOverviewResults[0].pollTitle,
        description: pollOverviewResults[0].pollDescription,
        createdBy: pollOverviewResults[0].createdBy,
        createdAt: pollOverviewResults[0].createdAt,
        isActive: pollOverviewResults[0].isActive,
        options: pollOverviewResults.map((row) => {
            return {
                id: row.optionId,
                title: row.optionTitle,
                description: row.optionDescription,
                voteCount: row.voteCount,
            } as OptionDetails;
        }),
    };
}
