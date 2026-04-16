export type PollRecord = {
    poll_id: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: Date;
    isActive: boolean;
}

export type OptionRecord = {
    optionId: string;
    pollId: string;
    title: string;
    description: string;
}

export type VoteRecord = {
    voteId: string;
    pollId: string;
    selectedOptionId: string;
    voted_by: string;
    voted_at: Date;
}

export type PollOverviewResult = {
    pollId: string;
    pollTitle: string;
    pollDescription: string;
    createdBy: string;
    createdAt: Date;
    isActive: boolean;
    optionId: string;
    optionTitle: string;
    optionDescription: string;
    voteCount: number;
};

export type PollDetails = {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: Date;
    isActive: boolean;
    options: OptionDetails[];
};

export type OptionDetails = {
    id: string;
    title: string;
    description: string;
    voteCount: number;
};
