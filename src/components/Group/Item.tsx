import React from 'react';

type ItemProps = {
  title?: React.ReactNode;
  content?: React.ReactNode;
};

export default function Item(props: ItemProps) {

  const {
    title,
    content,
  } = props;

  return (
    <>

            <div className="app-group">
                <div className="app-group__title">
                    {title || null}
                </div>
                <div className="app-group__content">
                {content || null}
                </div>
            </div>

    </>
  )

}

