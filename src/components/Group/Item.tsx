import React from 'react';

type ItemProps = {
    id?: string | number;
    title?: React.ReactNode;
    content?: React.ReactNode;
};

export default function Item(props: ItemProps) {

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

