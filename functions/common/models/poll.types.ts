export type PollOverviewSqlResult = {
    poll_id: string;
    poll_title: string;
    poll_description: string;
    created_by: string;
    created_at: Date;
    is_active: boolean;
    option_id: string;
    option_title: string;
    option_desc: string;
    vote_count: number;
};

export type PollDetails = {
    id: string;
    title: string;
    description: string;
    created_by: string;
    created_at: Date;
    is_active: boolean;
    options: OptionDetails[];
};

export type OptionDetails = {
    id: string;
    title: string;
    description: string;
    vote_count: number;
};
