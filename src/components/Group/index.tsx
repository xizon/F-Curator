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
};




export default function Group(props: GroupProps ) {

    const {
        data,
        cat,
        callback
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


    return (
        <>

            {cat && cat.length > 0 ? cat.map((catName, index) => {

                const currentList = classifiedListMap.get(catName);

                if ( currentList.length > 0 ) {
                    return <Item
                        key={index}
                        title={catName}
                        content={<>
                            <Project 
                                data={currentList} 
                                catName={catName} 
                                classifiedMapData={classifiedListMap} 
                                callback={callback} 
                            />
                        </>}
                    />;
                }


            }) : ''}

        </>
    )

}

