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
    title       TEXT NOT NULL,
    description TEXT
);

CREATE TABLE poll_option
(
    poll_id   UUID REFERENCES poll (poll_id) ON DELETE CASCADE,
    option_id UUID REFERENCES option (option_id) ON DELETE CASCADE,
    PRIMARY KEY (poll_id, option_id)
);

CREATE TABLE vote
(
    vote_id            UUID PRIMARY KEY         DEFAULT gen_random_uuid(),
    poll_id            UUID REFERENCES poll (poll_id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES option (option_id) ON DELETE CASCADE,
    voted_by           TEXT,
    voted_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

create or replace view option_with_tally as
with vote_tally as (select option.option_id,
                           count(*) as vote_count
                    from option
                             inner join vote on option.option_id = vote.selected_option_id
                    group by option.option_id)
select option.option_id,
       option.title,
       option.description,
       vote_tally.vote_count
from option
         left join vote_tally on option.option_id = vote_tally.option_id
;

create or replace view poll_overview as
select poll.poll_id,
       poll.title                    as poll_title,
       poll.description              as poll_description,
       poll.created_at,
       poll.created_by,
       poll.is_active,
       option_with_tally.option_id,
       option_with_tally.title       as option_title,
       option_with_tally.description as option_description,
       coalesce(vote_count, 0)       as vote_count
from poll
         left join poll_option po on poll.poll_id = po.poll_id
         left join option_with_tally on po.option_id = option_with_tally.option_id
order by poll_id, option_id desc
;