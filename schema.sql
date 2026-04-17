CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE poll
(
    poll_id     UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT,
    created_by  TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active   BOOLEAN                  DEFAULT true
);

CREATE TABLE option
(
    option_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id     UUID REFERENCES poll (poll_id),
    title       TEXT NOT NULL,
    description TEXT
);

CREATE TABLE vote
(
    vote_id            UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    poll_id            UUID REFERENCES poll (poll_id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES option (option_id) ON DELETE CASCADE,
    voted_by           TEXT,
    voted_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vote_option_id ON vote(selected_option_id);

create or replace view poll_overview as
select poll.poll_id,
       poll.title                         as poll_title,
       poll.description                   as poll_description,
       poll.created_at,
       poll.created_by,
       poll.is_active,
       option.option_id,
       option.title                       as option_title,
       option.description                 as option_description,
       coalesce(vote_tally.vote_count, 0) as vote_count
from poll
left join option on poll.poll_id = option.poll_id
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS vote_count
    FROM vote
    WHERE vote.selected_option_id = option.option_id
) vote_tally ON TRUE
;

CREATE TABLE participant
(
    participant_id      UUID UNIQUE         DEFAULT gen_random_uuid(),
    poll_id             UUID REFERENCES poll (poll_id) ON DELETE CASCADE,
    latest_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (participant_id, poll_id)
);