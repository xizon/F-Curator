/* 
 *************************************
 * <!-- Group -->
 *************************************
 */
import React from 'react';
import Project from '@/components/Project';
import Item from './Item';

import './styles/index.scss';

type GroupFnType = (arg1: number) => void;

type GroupProps = {
    /** Specify data of URL as a JSON string format. 
     * Such as: `[{"title":"Title","link":"https://example.com","icon":"https://x.jpg"},{"title":"Title","link":"https://example.com","icon":"https://x.jpg"}]` */
     data?: any[any];
    /** Specify categories as an Array. 
     * Such as: `["Uncategorized","Tools","Gallery"]` */
     cat?: any[any];
     /** The method to call when a page is clicked. Exposes the current data as an argument. */
     callback?: GroupFnType | any;
     /** Determine whether it is the result of the search filter */
     isSearch?: boolean;
};




export default function Group(props: GroupProps ) {

    const {
        data,
        cat,
        callback,
        isSearch
    } = props;


    
    // Merge items for each category into an array
    const classifiedListMap = new Map();
    cat.map((catName, index) => {

        // Filter the list of related categories
        let list: any[] = JSON.parse(JSON.stringify(data));
        list = list.filter( (item) => {
            return item.category === catName;
        });
        
        classifiedListMap.set(catName, list);

    });


    function handleClick(e) {
        e.preventDefault();

        const targetEl = e.currentTarget.dataset.id;

        document.querySelector( '.app-content__wrapper .content-area' )?.scrollTo({
            top: (document.querySelector( `#${targetEl}` ) as HTMLElement).offsetTop,
            behavior: "smooth"
        });  

    }



    return (
        <>


            <div className="app-group-sidemenu">
                <ul>
                    {cat && cat.length > 0 ? cat.map((catName, index) => {

                        const currentList = classifiedListMap.get(catName);

                        if ( currentList.length > 0 ) {
                            return <li key={index}><a href="#" data-id={`app-group-${index}`} onClick={(e) => handleClick(e) }>{catName}</a></li>;
                        }
                    }) : ''}
                </ul>
            </div>


            <dl className="app-stickgroup">
                {cat && cat.length > 0 ? cat.map((catName, index) => {

                    const currentList = classifiedListMap.get(catName);

                    if ( currentList.length > 0 ) {
                        return <Item
                            key={index}
                            title={catName}
                            id={index}
                            content={<>
                                <Project 
                                    isSearch={isSearch}
                                    data={currentList} 
                                    catName={catName} 
                                    classifiedMapData={classifiedListMap} 
                                    callback={callback} 
                                />
                            </>}
                        />;
                    }


                }) : ''}
            </dl>


        </>
    )

}

