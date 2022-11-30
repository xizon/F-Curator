import React from 'react';

type GroupItemProps = {
    id?: string | number;
    title?: React.ReactNode;
    content?: React.ReactNode;
};

export default function GroupItem(props: GroupItemProps) {

    const {
        id,
        title,
        content,
    } = props;

    return (
        <>
            <div className="app-group" id={`app-group-${id}`}>
                <dt>{title || null}</dt>
                <dd>{content || null}</dd>
            </div>

        </>
    )

}

