export type Poll = {
    poll_id: string;
    title: string;
    description: string;
    created_by: string;
    created_at: Date;
    is_active: boolean;
}

export type Option = {
    option_id: string;
    poll_id: string;
    title: string;
    description: string;
}

export type Vote = {
    vote_id: string;
    poll_id: string;
    selected_option_id: string;
    voted_by: string;
    voted_at: Date;
}

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
